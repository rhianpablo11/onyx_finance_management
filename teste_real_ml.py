import pandas as pd
from prophet import Prophet
import matplotlib.pyplot as plt
from datetime import date, timedelta
import calendar

# Importando a conexão real do seu banco de dados Onyx!
from app.core.database import SessionLocal
from app.models.expense import Expense
from sqlalchemy import select
from app.models.user_crendentials import User_crendentials
from app.models.user import User

def executar_previsao_real():
    # ==========================================
    # 1. CONEXÃO COM O BANCO DE DADOS
    # ==========================================
    db = SessionLocal()
    user_id_teste = 1  # 🚨 COLOQUE O SEU ID REAL AQUI!
    
    # Pegando dados de 1º de Janeiro até Hoje
    data_inicio = date(2026, 2, 25)
    data_fim = date.today()

    print("🔍 Buscando transações reais no banco...")
    # Buscamos todas as despesas e receitas ativas nesse período
    stmt = select(Expense.date, Expense.value, Expense.type_expense).where(
        Expense.user_id == user_id_teste,
        Expense.date.between(data_inicio, data_fim),
        Expense.is_activated == True
    )
    stmt_2 = select(User.name).where(User.id == user_id_teste)
    transacoes = db.execute(stmt).all()
    nome_usuario = db.execute(stmt_2).scalar()
    print(f"👋 Olá, {nome_usuario}! Encontramos {len(transacoes)} transações para analisar.")
    db.close()

    if not transacoes:
        print("❌ Nenhuma transação encontrada para esse usuário.")
        return

    # ==========================================
    # 2. ENGENHARIA DE DADOS (Transformando em Saldo)
    # ==========================================
    # Criamos um DataFrame do Pandas com os dados crus
    df_cru = pd.DataFrame(transacoes, columns=['date', 'value', 'type_expense'])
    
    # Garantimos que a data é do tipo 'datetime' e o valor é 'float'
    df_cru['date'] = pd.to_datetime(df_cru['date'])
    df_cru['value'] = df_cru['value'].astype(float)

    # O Segredo: Se for despesa (type_expense == False), o valor fica negativo!
    df_cru['net_value'] = df_cru.apply(lambda row: row['value'] if row['type_expense'] else -row['value'], axis=1)

    # Agrupamos por DIA (Somamos tudo que aconteceu no mesmo dia)
    df_diario = df_cru.groupby('date')['net_value'].sum().reset_index()

    # Criamos um calendário contínuo (Para preencher os dias que você não gastou nada com 0)
    calendario_completo = pd.date_range(start=data_inicio, end=data_fim)
    df_diario = df_diario.set_index('date').reindex(calendario_completo, fill_value=0).reset_index()
    df_diario.columns = ['ds', 'net_value']

    # Criamos a coluna 'y' que é a SOMA ACUMULADA do dinheiro (O Saldo)
    df_diario['y'] = df_diario['net_value'].cumsum()

    print(f"✅ Histórico processado! {len(df_diario)} dias analisados.")
    print(df_diario.tail()) # Mostra os últimos 5 dias reais

    # ==========================================
    # 3. TREINANDO A INTELIGÊNCIA ARTIFICIAL
    # ==========================================
    print("\n🧠 Treinando o Prophet com a sua vida financeira...")
    modelo = Prophet(daily_seasonality=True)
    modelo.fit(df_diario)

    # ==========================================
    # 4. PREVENDO ATÉ O FIM DO MÊS
    # ==========================================
    # Descobre quantos dias faltam para acabar o mês atual
    hoje = date.today()
    ultimo_dia = calendar.monthrange(hoje.year, hoje.month)[1]
    dias_restantes = ultimo_dia - hoje.day

    print(f"\n⏳ Faltam {dias_restantes} dias para o fim do mês. Gerando previsão...")
    futuro = modelo.make_future_dataframe(periods=dias_restantes)
    previsao = modelo.predict(futuro)

    # ==========================================
    # 5. GERANDO A IMAGEM E O INSIGHT
    # ==========================================
    tabela_detalhada = previsao[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(dias_restantes)
    
    print("\n🔮 PREVISÃO PARA O RESTO DO MÊS:")
    for index, linha in tabela_detalhada.iterrows():
        data_formatada = linha['ds'].strftime('%d/%m/%Y')
        oficial = round(linha['yhat'], 2)
        print(f"📅 {data_formatada} | Aposta: R$ {oficial}")

    fig = modelo.plot(previsao)
    plt.title("Previsão Real do Saldo - Onyx")
    plt.xlabel("Data")
    plt.ylabel("Variação de Saldo (R$)")
    plt.savefig("grafico_real_onyx.png", bbox_inches='tight')
    print("\n📸 Gráfico salvo! Abra 'grafico_real_onyx.png' para ver se o mês vai fechar no azul!")

if __name__ == "__main__":
    executar_previsao_real()