import requests
import random
import time
from datetime import date, timedelta

# ==========================================
# ⚙️ CONFIGURAÇÕES DA SUA API
# ==========================================
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/user/login" # Ajuste para a sua rota de login exata
TRANSACTION_URL = f"{BASE_URL}/transactions/create" # 🔥 Nova rota do seu Chat!

# Credenciais da sua conta de teste maluca
USER_EMAIL = "example@example.com" 
USER_PASSWORD = "1"

# Quantas transações você quer gerar no total?
TOTAL_TRANSACTIONS = 14

# Respiro de 5 segundos para a API do Gemini não te dar block por excesso de requisições (RPM)
DELAY_SECONDS = 5 

# ==========================================
# 🎲 DADOS FAKES PARA SORTEIO
# ==========================================
DESPESAS_NOMES = [
    ("Ifood Hambúrguer", 35.0, 80.0),
    ("Gasolina Posto Shell", 50.0, 250.0),
    ("Supermercado Atacadão", 300.0, 900.0),
    ("Compra Peça PC", 150.0, 400.0),
    ("Farmácia", 40.0, 120.0),
    ("Uber Volta Pra Casa", 15.0, 45.0),
    ("Cinema com a galera", 60.0, 100.0)
]

RECEITAS_NOMES = [
    ("Salário", 30000.0, 300000.0),
    ("Freela de Software", 5000.0, 20000.0),
    ("Venda de Peça Antiga", 1000.0, 30000.0),
    ("Pix do Amigo", 200000.0, 15000000.0)
]

PAYMENT_METHODS = ["PIX", "Cartão de crédito", "Dinheiro Físico", "Cartão de Débito"]

# ==========================================
# 🚀 FUNÇÕES PRINCIPAIS
# ==========================================
def get_random_date():
    # Gera uma data aleatória nos últimos 120 dias
    hoje = date.today()
    dias_atras = random.randint(1, 70)
    data_aleatoria = hoje - timedelta(days=dias_atras)
    # Mandamos no formato brasileiro para a IA do seu backend entender fácil
    return data_aleatoria.strftime("%d/%m/%Y")

def generate_human_message(is_income, name, value, payment_method, tx_date):
    """Gera uma frase natural como se o usuário estivesse digitando no chat do app"""
    if is_income:
        templates = [
            f"Recebi no dia {tx_date} um valor de R$ {value} referente a {name} via {payment_method}.",
            f"Entrou {value} reais de {name} no dia {tx_date} no {payment_method}.",
            f"Opa, anota aí: ganhei {value} com {name}. Foi no dia {tx_date} e recebi no {payment_method}."
        ]
    else:
        templates = [
            f"Eu gastei no dia {tx_date} com {name}, no valor de R$ {value}, e paguei com {payment_method}.",
            f"Comprei {name} no dia {tx_date}, custou {value} reais e passei no {payment_method}.",
            f"Despesa de {value} no {payment_method} com {name}, isso foi lá pro dia {tx_date}."
        ]
    # Retorna uma frase aleatória dentre as opções acima
    return random.choice(templates)

def authenticate():
    print("🔐 Fazendo login na API...")
    payload = {
        "username": USER_EMAIL, 
        "password": USER_PASSWORD
    }
    
    response = requests.post(LOGIN_URL, data=payload)
    
    if response.status_code in [200, 201]:
        token = response.json().get("access_token")
        print("✅ Login efetuado com sucesso!")
        return token
    else:
        print(f"❌ Erro no login: {response.status_code} - {response.text}")
        exit()

def run_seed():
    token = authenticate()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    print(f"🚀 Iniciando a criação de {TOTAL_TRANSACTIONS} transações via IA Chat...")

    for i in range(1, TOTAL_TRANSACTIONS + 1):
        # Sorteia se vai ser entrada (20% de chance) ou saída (80% de chance)
        is_income = random.random() < 0.4
        
        if is_income:
            name, val_min, val_max = random.choice(RECEITAS_NOMES)
        else:
            name, val_min, val_max = random.choice(DESPESAS_NOMES)
            
        valor_sorteado = round(random.uniform(val_min, val_max), 2)
        data_sorteada = get_random_date()
        metodo_pagamento = random.choice(PAYMENT_METHODS)
        
        # Cria a mensagem imitando o front-end
        texto_chat = generate_human_message(is_income, name, valor_sorteado, metodo_pagamento, data_sorteada)
        
        payload = {
            "message": texto_chat
        }

        print(f"\n[{i}/{TOTAL_TRANSACTIONS}] 💬 Enviando mensagem: '{texto_chat}'")
        
        try:
            response = requests.post(TRANSACTION_URL, json=payload, headers=headers)
            
            if response.status_code in [200, 201]:
                print(f"   ✅ Transação criada pela IA com sucesso!")
            else:
                print(f"   ❌ Falhou: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"   🚨 Erro de Conexão: {e}")

        # O Respiro Sênior pra não tomar Rate Limit do Gemini
        if i < TOTAL_TRANSACTIONS:
            print(f"   ⏳ Aguardando {DELAY_SECONDS}s para o Gemini esfriar a cabeça...")
            time.sleep(DELAY_SECONDS)
            
    print("\n🎉 Finalizado! IA treinada e banco de dados populado com sucesso.")

if __name__ == "__main__":
    run_seed()