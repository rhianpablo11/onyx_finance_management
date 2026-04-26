import pandas as pd
from sqlalchemy import select
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules

# Importando os modelos exatos do Onyx!
from app.core.database import SessionLocal
from app.models.expense import Expense
from app.models.expense_category import Expense_category

def rodar_detetive_real():
    # ==========================================
    # 1. PUXANDO DADOS (COM JOIN DAS TABELAS)
    # ==========================================
    db = SessionLocal()
    user_id_teste = 1  # 🚨 Coloque o ID da sua conta real aqui
    
    print("🔍 Juntando despesas e categorias no banco de dados...")
    
    # O SEGREDO DO JOIN NO SQLALCHEMY:
    # Vamos puxar a data da despesa e o NOME da categoria da outra tabela
    stmt = select(Expense.date, Expense_category.name.label('category_name')).join(
        Expense_category, Expense.category == Expense_category.id
    ).where(
        Expense.user_id == user_id_teste,
        Expense.type_expense == False,  # Apenas saídas de dinheiro
        Expense.is_activated == True
    )
    
    transacoes = db.execute(stmt).all()
    db.close()

    if not transacoes:
        print("❌ Nenhuma despesa encontrada para esse usuário.")
        return

    # ==========================================
    # 2. ENGENHARIA DE DADOS (Criando as Cestas)
    # ==========================================
    df_cru = pd.DataFrame(transacoes, columns=['date', 'category_name'])
    
    # Padroniza a data para agrupar tudo que aconteceu no mesmo dia
    df_cru['date'] = pd.to_datetime(df_cru['date']).dt.date
    df_cru = df_cru.dropna(subset=['category_name'])

    # Amassa todas as categorias do mesmo dia em uma lista!
    cestas_por_dia = df_cru.groupby('date')['category_name'].apply(list).tolist()
    
    print(f"✅ Histórico processado! {len(cestas_por_dia)} dias agrupados.")

    # ==========================================
    # 3. TRANSFORMANDO PARA A IA
    # ==========================================
    te = TransactionEncoder()
    te_ary = te.fit(cestas_por_dia).transform(cestas_por_dia)
    df_ia = pd.DataFrame(te_ary, columns=te.columns_)

    # ==========================================
    # 4. MINERANDO OS PADRÕES (O DETETIVE)
    # ==========================================
    print("\n🧠 Procurando hábitos e vícios financeiros...")
    
    try:
        # A regra tem que ter acontecido em pelo menos 5% dos dias
        frequent_itemsets = apriori(df_ia, min_support=0.05, use_colnames=True)
        
        # Exigimos pelo menos 60% de certeza na repetição do hábito
        regras = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.60)
        # 🚨 O FILTRO SÊNIOR AQUI:
        # 1. Ordenamos por Lift (maior pro menor) e depois por Confidence (maior pro menor)
        regras = regras.sort_values(by=['lift', 'confidence'], ascending=[False, False])
        
        # 2. Pegamos APENAS a regra número 1 (A mais forte de todas do usuário)
        regras = regras.head(1)
    except Exception as e:
        print("🕵️‍♂️ Ainda não há padrões fortes o suficiente para gerar uma regra clara.")
        return

    if regras.empty:
        print("🕵️‍♂️ O detetive não encontrou padrões óbvios no seu comportamento financeiro ainda.")
        return

    # ==========================================
    # 5. O VEREDITO
    # ==========================================
    print("\n🚨 SEGREDOS REVELADOS DO SEU EXTRATO:")
    
    regras_para_gemini = []
    
    for index, row in regras.iterrows():
        causa = list(row['antecedents'])[0]
        consequencia = list(row['consequents'])[0]
        confianca = round(row['confidence'] * 100, 1)
        lift = round(row['lift'], 2)
        
        if lift > 1.0:
            regra_texto = f"{causa} -> {consequencia}"
            print(f"👉 Quando você gasta com '{causa}', há {confianca}% de chance de gastar com '{consequencia}'! (Lift: {lift})")
            
            # Formato pronto para o Batch Prompting!
            regras_para_gemini.append({"user_id": user_id_teste, "regra": regra_texto})

    print(f"\n📦 Lote pronto para envio ao Gemini: {regras_para_gemini}")

    print(f"\n📦 Lote pronto para envio ao Gemini: {regras_para_gemini}")

    # ==========================================
    # 6. O PORTA-VOZ (GEMINI API PADRONIZADA)
    # ==========================================
    from app.services.ai_processor import generate_behavioral_insights

    if regras_para_gemini:
        print("\n🤖 Chamando o ai_processor do Onyx (Batch Prompting)...")
        
        insights_finais = generate_behavioral_insights(regras_para_gemini)
        
        print("\n✨ INSIGHTS GERADOS (Prontos para salvar no banco):")
        for item in insights_finais:
            print(f"Usuário {item['user_id']}: {item['insight']}")

if __name__ == "__main__":
    rodar_detetive_real()