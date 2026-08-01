import calendar
from datetime import datetime, date
import pandas as pd
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import select
from sqlalchemy.orm import Session
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules
from prophet import Prophet
from app.controllers.insights_controller import add_new_insight_investigator
from app.core.database import SessionLocal # Usaremos isso para rotinas automáticas
from app.models.balance_forecast import Balance_forecast
from app.models.expense import Expense
from app.models.expense_category import Expense_category
from app.models.user import User
from app.models.ia_insights import Ia_insights
from app.services.ai_processor import generate_behavioral_insights


def get_data_users(db: Session):
    try:
        stmt = (select(User.id).where(User.subscriber == True))
        ids_of_users = db.execute(stmt).scalars().all()
        debug_print(is_show=True, text=f"IDs of users fetched: {ids_of_users}")
        return ids_of_users
    except Exception as e:
        print(f"Error occurred while fetching user data: {e}")
        return []
    

def get_expenses_by_user_id(user_id: int, db: Session):
    try:
        stmt = select(Expense.date, Expense_category.name.label('category_name')).join(
            Expense_category, Expense.category == Expense_category.id
        ).where(
            Expense.user_id == user_id,
            Expense.type_expense == False,
            Expense.is_activated == True
        )
        
        transacoes = db.execute(stmt).all()
        debug_print(is_show=True, text=f"Fetched {len(transacoes)} transactions for user {user_id}")
        return transacoes
    except Exception as e:
        print(f"Error occurred while fetching expenses for user {user_id}: {e}")
        return []


def get_daily_balances_by_user_id(user_id: int, db: Session):
    try:
        # Aprimorar p ver a quantidade de dias de transações q irá pegar, por enq ta pegando td
        stmt = (select(Expense.date, Expense.value, Expense.type_expense)
                .where(Expense.user_id == user_id, Expense.is_activated == True)
                .order_by(Expense.date.asc()))
        transactions = db.execute(stmt).all()
        debug_print(is_show=True, text=f"Fetched {len(transactions)} transactions for daily balance calculation for user {user_id}")
        
        if not transactions:
            debug_print(is_show=True, text=f"No transactions found for user {user_id}")
            return None

        df = pd.DataFrame(transactions, columns=['date', 'value', 'type_expense'])
        
        # 🔥 CORREÇÃO: Usar .dt.normalize() em vez de .dt.date
        # Isso zera as horas (00:00:00) mas mantém no formato Timestamp do Pandas para não bugar o calendário
        df['date'] = pd.to_datetime(df['date']).dt.normalize()
        
        # Garante que os valores numéricos sejam tratados como float
        df['real_amount'] = df.apply(lambda row: float(row['value']) if row['type_expense'] else -float(row['value']), axis=1)

        daily_summary = df.groupby('date')['real_amount'].sum().reset_index()
        daily_summary.set_index('date', inplace=True)
        
        # 🔥 CORREÇÃO: Usando pd.Timestamp para pegar hoje à meia-noite (alinha perfeitamente com o normalize)
        last_day = max(daily_summary.index.max(), pd.Timestamp.today().normalize())
        
        full_calendar = pd.date_range(start=daily_summary.index.min(), end=last_day, freq='D')
        daily_summary = daily_summary.reindex(full_calendar)
        
        daily_summary['real_amount'] = daily_summary['real_amount'].fillna(0)
        daily_summary['balance'] = daily_summary['real_amount'].cumsum()
        daily_summary.reset_index(names='date', inplace=True)

        df_prophet = daily_summary[['date', 'balance']].rename(columns={'date': 'ds', 'balance': 'y'})
        debug_print(is_show=True, text=f"Daily balances calculated for user {user_id}")
        
        return df_prophet

    except Exception as e:
        print(f"Error occurred while fetching daily balances for user {user_id}: {e}")
        return []

def training_prophet_model():
    try:
        db = SessionLocal()
        ids_users = get_data_users(db)

        for user_id in ids_users:
            df_prophet = get_daily_balances_by_user_id(user_id, db)
            if df_prophet is None or len(df_prophet) < 10:
                debug_print(is_show=True, text=f"Not enough data for Prophet training for user {user_id}, skipping...")
                continue

            print(f"Starting Prophet training for user {user_id} with {len(df_prophet)} daily balance records...")

            model = Prophet(daily_seasonality=False)
            model.fit(df_prophet)

            # 🔥 1. DINAMIZANDO OS DIAS (Respondendo seu comentário)
            # Vamos calcular quantos dias faltam para acabar o mês atual!
            hoje = datetime.today()
            ultimo_dia_do_mes = calendar.monthrange(hoje.year, hoje.month)[1]
            dias_para_o_fim_do_mes = ultimo_dia_do_mes - hoje.day
            
            # Se faltar menos de 5 dias pro fim do mês, joga pelo menos 15 dias pra ter gráfico.
            # Se não, prevê exatamente até o dia 30/31!
            periodos_futuro = max(15, dias_para_o_fim_do_mes)

            future = model.make_future_dataframe(periods=periodos_futuro)
            forecast = model.predict(future)
            debug_print(is_show=True, text=f"Prophet model trained and forecast generated for user {user_id}")

            # 🔥 A SOLUÇÃO DO BUG ESTÁ AQUI:
            # Forçamos a coluna 'ds' original a virar datetime64 igual a do Prophet antes de juntar
            df_prophet['ds'] = pd.to_datetime(df_prophet['ds'])

            # 🔥 2. O QUE O MERGE FAZ? (Respondendo seu comentário)
            # Pense no pd.merge como um "LEFT JOIN" do banco de dados.
            # O forecast tem o futuro (mas não tem o saldo real do passado).
            # O df_prophet tem o saldo real do passado (mas não tem o futuro).
            # O merge gruda os dois usando a data ('ds') como chave. Onde não tem saldo real (no futuro), ele bota NaN.
            merged_df = pd.merge(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']],
                                 df_prophet[['ds', 'y']],
                                 on='ds', how='left')
            
            records_to_upsert = []
            for index, row in merged_df.iterrows():
                records_to_upsert.append({
                    "user_id": user_id,
                    "target_date": row['ds'].date(), # Como agora é datetime64, o .date() funciona perfeito aqui pro Banco!
                    "real_balance": row['y'] if pd.notna(row['y']) else None,
                    "predicted_balance": row['yhat'],
                    "band_min": row['yhat_lower'],
                    "band_max": row['yhat_upper']
                })

            stmt = insert(Balance_forecast).values(records_to_upsert)
            stmt = stmt.on_conflict_do_update(
                constraint='uq_user_target_date',
                set_={
                    'predicted_balance': stmt.excluded.predicted_balance,
                    'band_min': stmt.excluded.band_min,
                    'band_max': stmt.excluded.band_max,
                    'real_balance': stmt.excluded.real_balance
                })
            
            db.execute(stmt)
            db.commit()
            debug_print(is_show=True, text=f"Balance forecasts upserted for user {user_id}")
            debug_print(is_show=True, text=f"Data saved to database for user {user_id} with {len(records_to_upsert)} records.")
            debug_print(is_show=True, text=f"Raw of data: {records_to_upsert}")

    except Exception as e:
        db.rollback()
        print(f"Error occurred during Prophet model training: {e}")
    finally:
        db.close()


def training_model():
    
    db = SessionLocal() 
    try:
        ids_users = get_data_users(db)
        data_for_gemini = []

        for id in ids_users:
            transactions_user = get_expenses_by_user_id(id, db)
            if not transactions_user or len(transactions_user) < 5:
                print(f"⚠️ Usuário {id} tem poucas ou nenhuma despesa, pulando...")
                continue
            df = pd.DataFrame(transactions_user, columns=['date', 'category_name'])
            df['date'] = pd.to_datetime(df['date']).dt.date
            df = df.dropna(subset=['category_name'])
            groups = df.groupby('date')['category_name'].apply(list).tolist()

            if len(groups) < 5:
                print(f"⚠️ Usuário {id} tem poucas transações agrupadas, pulando...")
                continue

            te = TransactionEncoder()
            te_ary = te.fit(groups).transform(groups)
            df_ia = pd.DataFrame(te_ary, columns=te.columns_)
            debug_print(is_show=True, text=f"Transaction encoding completed for user {id} with {len(df_ia)} rows.")
            try:
                frequent_itemsets = apriori(df_ia, min_support=0.05, use_colnames=True)
                rules = association_rules(frequent_itemsets, metric='confidence', min_threshold=0.60)
            except Exception as e:
                print(f"🚨 Erro ao rodar Apriori para usuário {id}: {e}")
                continue

            if rules.empty:
                print(f"📉 Usuário {id} não possui padrões de gastos combinados fortes o suficiente. Pulando...")
                continue

            rules = rules.sort_values(by=['lift', 'confidence'], ascending=[False, False])
            best_rule = rules.head(1).iloc[0]
            debug_print(is_show=True, text=f"RULES {rules} USUARIO: {id}")
            debug_print(is_show=True, text=f"Best rule for user {id}: {best_rule.to_dict()}")
            debug_print(is_show=True, text=f"Rule details - Support: {rules['support'].max()}, Confidence: {rules['confidence'].max()}, Lift: {rules['lift'].max()}")
            if best_rule['lift'] > 1:
                cause = list(best_rule['antecedents'])[0]
                consequence = list(best_rule['consequents'])[0]

                data_for_gemini.append({
                    'user_id': id,
                    'rule': f"{cause} -> {consequence}"
                })

        if data_for_gemini:
            print(f'✅ Regras geradas para {len(data_for_gemini)} usuários. Enviando para o Gemini...')
            insights_text = generate_behavioral_insights(data_for_gemini)
            debug_print(is_show=True, text=f"Insights generated by Gemini: {insights_text}")
            for item in insights_text:
                add_new_insight_investigator(
                    user_id=item['user_id'],
                    title="Comportamento Financeiro",
                    text_content=item['insight'],
                    db=db
                )
        else:
            print("⚠️ Nenhuma regra forte encontrada para nenhum usuário desta vez.")

    except Exception as e:
        db.rollback() # Se der erro grave, cancela tudo para não sujar o banco
        print(f"🚨 Erro crítico na pipeline: {e}")
    finally:
        db.close() # Sempre fecha o telefone na cara do banco de dados no final!


def debug_print(is_show: bool = False, text: str = ""):
    if is_show:
        print(f"Debug mode is ON - {text}")
    else:
        print("Debug mode is OFF")