import google.generativeai as genai
import json
import os
from datetime import date

GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
genai.configure(api_key=GEMINI_API_KEY)

def analyze_transaction_text(text: str, user_categories: list[str] = None):
    """
    Recebe o texto do usuário e retorna um dicionário com os dados estruturados.
    """
    
    # 1. Configura o modelo (O Flash é mais rápido e barato)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # 2. Prepara a lista de categorias para ajudar a IA (opcional, mas recomendado)
    categorias_str = None
    if user_categories:
        categorias_str = ", ".join(user_categories)
    else :
        categorias_str = "Nenhuma pré-definida"
    today_date = date.today().isoformat()

    # 3. O Prompt (A instrução mestre)
    prompt = f"""
    Você é um assistente financeiro. Hoje é {today_date}.
    Analise a frase: "{text}"
    
    Regras de Ouro:
    1. Se for uma compra parcelada (ex: "3x", "3 parcelas"), identifique o número de parcelas.
    2. Se o usuário disser "começa mês que vem", ajuste a data inicial.
    3. Se for assinatura mensal (Netflix, Spotify), é recorrente sem fim.
    4. Se o usuario não disser o tipo de parcelamento ele será mensal, mas pode ser quinzenal, ou em outro intervalo, extraia isso
    
    Retorne JSON com estes campos:
    - "amount": valor TOTAL da compra (se ele disser "3x de 100", o total é 300. Se disser "300 em 3x", total é 300), utilizando as casas decimais, se precisar aproximar algum valor aproxime para mais.
    - "is_installment": boolean (true se for parcelado).
    - "installments_count": int (número de parcelas. 1 se for à vista).
    - "is_recurrent": boolean (true se for assinatura tipo Netflix).
    - "type": True se for uma entrada de dinheiro ou False se for uma saida.
    - "category": Sugestão de categoria, veja primeiramente se esse texto se encaixa dentro de alguma categoria ja existente, as existentes são: [{categorias_str}].
    - "description": Resumo, com no maximo de 255 caracteres, tem que caber no banco de dados.
    - "first_payment_date": Data do PRIMEIRO pagamento (YYYY-MM-DD). Calcule baseado no contexto ("hoje", "mês que vem").
    - "payment_method": Se o usuario informar algo sobre o metodo de pagamento como credito, ou debito, ou dinheiro, ou pix, ou outros. Caso ele nao informe o padrão será dinheiro fisico.
    - "last_payment_date": Data do ULTIMO pagamento (YYYY-MM-DD). Calcule baseado no contexto
    """

    try:
        # 4. Chama a IA
        response = model.generate_content(prompt)
        
        # 5. Limpeza (Às vezes a IA manda ```json ... ```)
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        
        # 6. Converte texto para Dicionário Python
        transaction_data = json.loads(cleaned_text)
        
        return transaction_data
    
    except Exception as e:
        print(f"Erro na IA: {e}")
        return None