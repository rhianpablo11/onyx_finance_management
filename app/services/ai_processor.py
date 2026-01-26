from google import genai
import json
import os
from datetime import date
from app.core.security import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)


def analyze_transaction_text(text: str, user_categories: list[str] = None, charge_types: list[str] = None):
    """
    Recebe o texto do usuário e retorna um dicionário com os dados estruturados.
    """
    
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
    - "last_payment_date": Data do ULTIMO pagamento (YYYY-MM-DD). Calcule baseado no contexto,
    - "type_of_installment": Indica se o parcelamento é mensal, quinzenal, ou outro tipo. Por padrão se não for informado é mensal, já essa lista no banco de dados, [{charge_types}], veja se o que usuario digitou se encaixa em alguma delas.
    - "name": Indica um nome curto para aquele gasto, ou entrada de dinheiro, contendo no maximo 2 palavras
    """
    #tem um prob, categorias de pagamento tao se repetindo com nomes diferentes, mas sendo a mesma coisa
    try:
        # 4. Chama a IA
        response = client.models.generate_content(
                                                model="gemini-2.5-flash-lite",
                                                contents=prompt
                                            )
        
        # 5. Limpeza (Às vezes a IA manda ```json ... ```)
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        
        # 6. Converte texto para Dicionário Python
        transaction_data = json.loads(cleaned_text)
        
        # transaction_data = {'amount': 45.0,
        #                     'is_installment': False,
        #                     'installments_count': 1,
        #                     'is_recurrent': False,
        #                     'type': False,
        #                     'category': 'Transporte',
        #                     'description': 'Gasto de R$45 no Uber para ir comer no trabalho.',
        #                     'first_payment_date': '2026-01-05',
        #                     'payment_method': 'dinheiro fisico',
        #                     'last_payment_date': '2026-01-05'
        #                     }
        print('CCCCCCCCC')
        print(transaction_data)
        return transaction_data
    
    except Exception as e:
        print(f"Erro na IA: {e}")
        return None