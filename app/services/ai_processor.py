from google import genai
import json
import os
from datetime import date
from app.core.security import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)


def validate_and_fix_json(data: dict):
    today_iso = date.today().isoformat()
    defaults = {
        "amount": 0.0,
        "is_installment": False,
        "installments_count": 1,
        "is_recurrent": False,
        "type": False, # False = Saída (gasto) por segurança
        "category": "Outros", # Categoria genérica
        "description": "Movimentação sem descrição",
        "first_payment_date": today_iso,
        "payment_method": "dinheiro fisico",
        "last_payment_date": today_iso,
        "type_of_installment": "mensal",
        "name": "Gasto Geral"
    }

    for key, default_value in defaults.items():
        if key not in data or data[key] is None:
            if (isinstance(default_value, str) and data.get(key) == '' or data.get(key) == 'null'):
                data[key] = default_value
            else:
                data[key] = default_value

    try:
        data['installments_count'] = int(data["installments_count"])
        if data['installments_count'] < 1:
            data['installments_count'] = 1
    except:
        data["installments_count"] = 1

    # 2. PROTEÇÃO DE VALOR (Nunca negativo)
    try:
        data['amount'] = abs(float(data['amount'])) 
    except:
        data['amount'] = 0.0

    return data


def analyze_transaction_text(text: str, user_categories: list[str] = None, charge_types: list[str] = None):
    """
    Recebe o texto do usuário e retorna um dicionário com os dados estruturados.
    """
    
   
    categorias_str = None
    if user_categories:
        categorias_str = ", ".join(user_categories)
    else :
        categorias_str = "Outros, Alimentação, Transporte"
        
    if charge_types:
        charge_types_str = ", ".join(charge_types)
    else:
        charge_types_str = "mensal, quinzenal"

    today_date = date.today().isoformat()

    
    prompt = f"""
    Você é um assistente financeiro. Hoje é {today_date}.
    Analise a frase: "{text}"
    
    Categorias disponíveis: [{categorias_str}]
    Tipos de recorrência disponíveis: [{charge_types_str}]

    Regras de Ouro:
    1. Se for uma compra parcelada (ex: "3x", "3 parcelas"), identifique o número de parcelas.
    2. Se o usuário disser "começa mês que vem", ajuste a data inicial.
    3. Se for assinatura mensal (Netflix, Spotify), é recorrente sem fim.
    4. Se o usuario não disser o tipo de parcelamento ele será mensal, mas pode ser quinzenal, ou em outro intervalo, extraia isso
    5. JAMAIS retorne null ou None. Use valores padrão (0 para numeros, false para booleanos, string vazia para textos)
    6. Se não souber a categoria, use "Outros".
    
    Retorne JSON com estes campos:
    - "amount": valor TOTAL da compra (se ele disser "3x de 100", o total é 300. Se disser "300 em 3x", total é 300), utilizando as casas decimais, se precisar aproximar algum valor aproxime para mais.
    - "is_installment": boolean (true se for parcelado).
    - "installments_count": int (número de parcelas. 1 se for à vista).
    - "is_recurrent": boolean (true se for assinatura tipo Netflix).
    - "type": True se for uma entrada de dinheiro ou False se for uma saida.
    - "category": Sugestão de categoria, veja primeiramente se esse texto se encaixa dentro de alguma categoria ja existente, as existentes são: [{categorias_str}], caso não encaixe nomeie uma nova categoria, bem como se a lista estiver vazia, dê um nome para essa nova categoria. Vale ressaltar que só porque existe uma categoria com o nome "Outros" tudo se encaixa lá.
    - "description": Resumo, com no MAXIMO de 255 caracteres, e no minimo 60 caracteres, tem que caber no banco de dados.
    - "first_payment_date": Data do PRIMEIRO pagamento (YYYY-MM-DD). Calcule baseado no contexto ("hoje", "mês que vem").
    - "payment_method": Se o usuario informar algo sobre o metodo de pagamento como credito, ou debito, ou dinheiro, ou pix, ou outros. Caso ele nao informe o padrão será dinheiro fisico. Os nomes para os metodos padrão são: "Cartão de crédito", "Cartão de debito", "Dinheiro Físico", "PIX", ao realizar a seleção utilize esses nomes da mesma forma que foi escrito entre aspas.
    - "last_payment_date": Data do ULTIMO pagamento (YYYY-MM-DD). Calcule baseado no contexto,
    - "type_of_installment": Indica se o parcelamento é mensal, quinzenal, ou outro tipo. Por padrão se não for informado é mensal, já essa lista no banco de dados, [{charge_types}], veja se o que usuario digitou se encaixa em alguma delas.
    - "name": Indica um nome curto para aquele gasto, ou entrada de dinheiro, contendo no maximo 2 palavras
    """
    
    try:
        
        response = client.models.generate_content(
                                                model="gemini-2.5-flash-lite",
                                                contents=prompt,
                                                config={
                                                    'response_mime_type': 'application/json'
                                                }
                                            )
        
        
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        
       
        transaction_data = json.loads(cleaned_text)
        final_data = validate_and_fix_json(transaction_data)
       
        return final_data
    
    except Exception as e:
        print(f"Erro na IA: {e}")
        return None