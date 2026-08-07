import calendar
from datetime import datetime, date, timedelta
import pandas as pd
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import select
from sqlalchemy.orm import Session
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules
from prophet import Prophet
from sklearn.ensemble import IsolationForest
from app.controllers.expense_category_controller import get_expense_category_by_id
from app.controllers.insights_controller import add_new_insight_investigator
from app.controllers.transaction_controller import get_transaction_title_by_id
from app.core.database import SessionLocal # usado isso para rotinas automáticas
from app.models.balance_forecast import Balance_forecast
from app.models.expense import Expense
from app.models.expense_category import Expense_category
from app.models.user import User
from app.models.ia_insights import Ia_insights
from app.services.ai_processor import generate_behavioral_insights
from statsmodels.tsa.stattools import acf


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


def get_full_expenses_by_user_id(user_id: int, db: Session):
    try:
        thirty_days_ago = datetime.now() - timedelta(days=30)
        stmt = select(Expense).where(
            Expense.user_id == user_id,
            Expense.type_expense == False,
            Expense.is_activated == True,
            Expense.date >= thirty_days_ago
        )
        transacoes = db.execute(stmt).scalars().all()
        return transacoes
    except Exception as e:
        print(f"Error occurred while fetching full expenses for user {user_id}: {e}")
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



def training_anomalies_model_detect():
    db = SessionLocal()
    try:
        ids_users = get_data_users(db)
        for user_id in ids_users:
            transactions_user = get_full_expenses_by_user_id(user_id, db)
            if not transactions_user or len(transactions_user) < 8:
                print(f"⚠️ Usuário {user_id} tem poucas ou nenhuma despesa, pulando...")
                continue

            anomalies = detect_anomalies(transactions_user)
            if anomalies:
                print(f"🚨 Anomalias detectadas para o usuário {user_id}: {anomalies}")
                # Aqui você pode adicionar lógica para salvar as anomalias no banco de dados ou enviar alertas
                for anomalia in anomalies:
                    # Aqui você salva o insight no banco de dados do Onyx
                    novo_insight = Ia_insights(
                        user_id=user_id,
                        type_insight="anomalie",
                        text_content=f"Foi detectado um gasto incomum, nos últimos 30 dias, no valor de R$ {anomalia['valor']}, com título do gasto {get_transaction_title_by_id(db, int(anomalia['id_transacao']))}, na categoria {get_expense_category_by_id(anomalia['categoria_id'], user_id, db)}, com a descrição: \"{anomalia['descricao']}\"",
                        title="Alerta de Anomalia Financeira"
                    )
                    db.add(novo_insight)
                    db.commit()
            
            else:
                print(f"✅ Nenhuma anomalia detectada para o usuário {user_id}.")

    except Exception as e:
        db.rollback()
        print(f"🚨 Erro crítico na detecção de anomalias: {e}")
    finally:
        db.close()


def training_cycles_model_detect():
    db = SessionLocal()
    try:
        ids_users = get_data_users(db)
        for user_id in ids_users:
            debug_print(is_show=True, text=f"--- Iniciando análise de ciclos para o usuário {user_id} ---")
            
            # Reutilizando a função que busca o objeto Expense inteiro
            transactions_user = get_full_expenses_by_user_id(user_id, db)
            
            debug_print(is_show=True, text=f"Total de transações encontradas: {len(transactions_user)}")

            if not transactions_user:
                debug_print(is_show=True, text=f"Sem transações para o usuário {user_id}. Pulando.")
                continue

            ciclos_detectados = detect_hidden_cycles(transactions_user)
            
            if ciclos_detectados:
                print(f"🔄 Ciclos detectados para o usuário {user_id}: {ciclos_detectados}")
                
                for ciclo in ciclos_detectados:
                    texto_insight = (f"Notamos que a cada {ciclo['ciclo_dias']} dias você tem gastos nessa categoria. "
                                     f"Faltam {ciclo['dias_faltantes']} dias para o próximo ciclo provável. "
                                     f"O valor na última vez foi de R$ {ciclo['ultimo_valor']:.2f}.")
                    
                    novo_insight = Ia_insights(
                        user_id=user_id,
                        type_insight="ALERTA_CICLO",
                        text_content=texto_insight,
                        transacao_id=None,
                        title="Ciclo de Gasto Identificado"
                    )
                    db.add(novo_insight)
                
                db.commit() # Salvando no Onyx!
                debug_print(is_show=True, text=f"Insights de ciclo salvos com sucesso para o usuário {user_id}.")
            else:
                debug_print(is_show=True, text=f"Nenhum ciclo oculto validado para o usuário {user_id}.")
                
    except Exception as e:
        db.rollback()
        print(f"🚨 Erro crítico na detecção de ciclos: {e}")
    finally:
        db.close()


def detect_anomalies(transacoes: list):
    # 1. Se o usuário for muito novo e tiver poucas transações, 
    # o modelo não tem padrão suficiente para aprender.
    if len(transacoes) < 15:
        return []

    # 2. Transformando a lista de objetos do SQLAlchemy em um DataFrame do Pandas
    dados = []
    for t in transacoes:
        dados.append({
            'id_transacao': str(t.id),
            'valor': float(t.value),       
            'dia_do_mes': t.date.day,      
            'categoria_id': t.category,    
            'descricao': t.description     
        })
    
    df = pd.DataFrame(dados)

    # 3. Preparando os dados para a IA (O modelo só entende números)
    # Estamos cruzando o Valor do gasto com o Dia e a Categoria
    X = df[['valor', 'dia_do_mes', 'categoria_id']]

    # 4. Configurando e Treinando o Isolation Forest
    # contamination=0.02 significa que assumimos que, no máximo, 2% das transações são anômalas
    modelo = IsolationForest(contamination=0.03, random_state=42, n_estimators=200)

    # 5. O predict retorna '1' para normal e '-1' para anomalia
    df['is_anomalia'] = modelo.fit_predict(X)

    # 6. Filtramos apenas as bizarrices (onde o resultado foi -1)
    anomalias_df = df[df['is_anomalia'] == -1]

    # Convertendo de volta para uma lista de dicionários para facilitar o uso
    retorno_anomalias = anomalias_df.to_dict('records')
    
    return retorno_anomalias


def detect_hidden_cycles(transacoes: list):
    # Precisa de um histórico razoável para achar ciclos
    if len(transacoes) < 10:
        debug_print(is_show=True, text="Menos de 10 transações no total. Histórico insuficiente.")
        return []

    dados = []
    for t in transacoes:
        dados.append({
            'id_transacao': str(t.id),
            'dia_exato': pd.to_datetime(t.date).normalize(),
            'categoria_id': t.category, 
            'valor': float(t.value)
        })
    
    df = pd.DataFrame(dados)
    alertas = []

    categorias = df['categoria_id'].unique()
    debug_print(is_show=True, text=f"Analisando {len(categorias)} categorias únicas.")
    
    data_min = df['dia_exato'].min()
    data_max = df['dia_exato'].max()
    calendario_completo = pd.date_range(start=data_min, end=data_max, freq='D')

    for cat in categorias:
        df_cat = df[df['categoria_id'] == cat]
        
        if len(df_cat) < 3:
            debug_print(is_show=True, text=f"Cat {cat} ignorada: Apenas {len(df_cat)} transações (Mínimo 3).")
            continue
            
        serie_diaria = df_cat.groupby('dia_exato').size().reindex(calendario_completo, fill_value=0)
        
        lags_max = min(90, len(serie_diaria) - 1)
        
        if lags_max < 14:
            debug_print(is_show=True, text=f"Cat {cat} ignorada: Janela de tempo de {lags_max} dias é muito curta para ciclos.")
            continue
            
        debug_print(is_show=True, text=f"Calculando autocorrelação para cat {cat} com lags={lags_max}.")
        acf_valores = acf(serie_diaria, nlags=lags_max, fft=True)
        
        for lag in range(14, len(acf_valores)):
            correlacao = acf_valores[lag]
            
            if correlacao > 0.45:
                debug_print(is_show=True, text=f"🔥 Ciclo forte detectado na cat {cat}! Dias: {lag} | Força: {correlacao:.2f}")
                ultima_compra = df_cat['dia_exato'].max()
                proxima_provavel = ultima_compra + pd.Timedelta(days=lag)
                
                dias_faltantes = (proxima_provavel - pd.Timestamp.today().normalize()).days
                
                # Só gera o Insight se o ciclo estiver para estourar nos próximos 7 dias
                if 0 <= dias_faltantes <= 7:
                    alertas.append({
                        'categoria_id': cat,
                        'ciclo_dias': lag,
                        'dias_faltantes': dias_faltantes,
                        'proxima_data': proxima_provavel.strftime('%d/%m/%Y'),
                        'ultimo_valor': df_cat[df_cat['dia_exato'] == ultima_compra]['valor'].sum()
                    })
                    break 
                else:
                    debug_print(is_show=True, text=f"Cat {cat}: Ciclo ocorre em {dias_faltantes} dias. Fora da janela de alerta (0-7 dias).")
    
    return alertas



def debug_print(is_show: bool = False, text: str = ""):
    if is_show:
        print(f"Debug mode is ON - {text}")
    else:
        print("Debug mode is OFF")