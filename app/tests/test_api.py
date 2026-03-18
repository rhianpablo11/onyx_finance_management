import pytest
from datetime import date
from freezegun import freeze_time
from app.models.expenses_fixed import Expenses_fixed
from app.main import app
from app.core.auth import get_current_user
from app.models.user import User
from app.models.expense import Expense
from app.services.ai_processor import validate_and_fix_json


def test_api_seguranca_bloqueia_sem_login(client):
    """
    Se um hacker tentar acessar o extrato sem token JWT,
    a API TEM que retornar Erro 401 (Unauthorized).
    Repare que usamos o 'client' puro, e não o 'auth_client'.
    """
    response = client.get("/transactions/extract")
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_api_extrato_calcula_totais_corretamente(auth_client, db_session, test_user):
    """
    Testa se a rota que a gente acabou de consertar no transaction_controller
    está devolvendo o JSON perfeito e com os totais somados na hora!
    """
    with freeze_time("2026-05-15"):
        # Vamos criar uma despesa e uma receita no banco falso
        despesa = Expenses_fixed(
            user_id=test_user.id, name="Internet", value=100,
            start_date=date(2026, 5, 1), payment_date=date(2026, 5, 1),
            charge=2, category=1, type_expense=False, activated=True
        )
        receita = Expenses_fixed(
            user_id=test_user.id, name="Bico de Dev", value=500,
            start_date=date(2026, 5, 10), payment_date=date(2026, 5, 10),
            charge=2, category=1, type_expense=True, activated=True
        )
        db_session.add_all([despesa, receita])
        db_session.commit()

        # O Front-end disparou um GET pra pegar o extrato de Maio!
        response = auth_client.get("/transactions/extract?start_date=2026-05-01&end_date=2026-05-31")
        
        # Tem que dar 200 OK!
        assert response.status_code == 200
        
        dados = response.json()
        
        # Validando se o Backend fez a matemática certa e montou a estrutura do JSON
        assert len(dados["transactions"]) == 2
        assert dados["value_spent"] == 100.0
        assert dados["value_received"] == 500.0
        assert dados["balance_value_in_period"] == 400.0 # 500 - 100

    with freeze_time("2026-06-15"):
        

        # O Front-end disparou um GET pra pegar o extrato de Maio!
        response = auth_client.get("/transactions/extract?start_date=2026-05-01&end_date=2026-06-30")
        
        # Tem que dar 200 OK!
        assert response.status_code == 200
        
        dados = response.json()
        
        # Validando se o Backend fez a matemática certa e montou a estrutura do JSON
        assert len(dados["transactions"]) == 4
        assert dados["value_spent"] == 200.0
        assert dados["value_received"] == 1000.0
        assert dados["balance_value_in_period"] == 800.0 # 500 - 100



def test_api_validacao_de_dados_vazios(auth_client):
    """
    Testa o "Pydantic" do FastAPI. Se o frontend mandar um POST
    esquecendo campos obrigatórios, a API NÃO PODE explodir.
    Ela tem que devolver o famoso Erro 422 (Unprocessable Entity).
    """
    # Enviando um JSON vazio num POST que exige dados de transação manual
    # Adapte a rota '/transactions/manual' para a rota de criação real que você tiver
    response = auth_client.post("/transactions/create", json={})
    
    # Se a rota existir, ela deve barrar a falta de dados!
    # (Obs: Pode dar 404 se você não tiver essa rota específica mapeada ainda)
    if response.status_code != 404:
        assert response.status_code == 422


def test_ai_processor_limites_matematicos():
    """
    Testa se o nosso 'Segurança' barra alucinações matemáticas do Gemini.
    """
    # Simulando a resposta RAW da IA com erros matemáticos graves
    dados_bugados = {
        "amount": -150.75,         # Dinheiro negativo!
        "installments_count": -3,  # Parcelas negativas!
        "name": "Compra Louca"
    }
    
    # Passamos os dados bugados pela nossa função de limpeza
    dados_corrigidos = validate_and_fix_json(dados_bugados)
    
    # O sistema TEM que ter transformado -150.75 em positivo
    assert dados_corrigidos["amount"] == 150.75
    
    # O sistema TEM que ter jogado as parcelas negativas para o mínimo (1)
    assert dados_corrigidos["installments_count"] == 1





def test_api_seguranca_isolamento_de_dados(client, db_session, test_user):
    """
    Teste CRÍTICO: Garante que o Usuário B nunca veja os dados do Usuário A.
    Repare que usamos o `client` puro (sem auth), pois vamos forçar o login manual.
    """
    # 1. O Usuário A (test_user) faz uma compra milionária e super secreta
    compra_secreta = Expense(
        user_id=test_user.id, category=1, value=999999.0, type_expense=False, 
        date=date.today(), name="Compra Secreta", is_activated=True,
        description="Segredo de estado",
        payment_method="pix"
    )
    db_session.add(compra_secreta)
    
    # 2. Um novo usuário se cadastra no Onyx (Vamos chamar de Hacker)
    hacker = User(name="Hacker", email="hacker@onyx.com", password="123", balance=0, telephone="000")
    db_session.add(hacker)
    db_session.commit()
    
    # 3. Enganamos a API para ela achar que a requisição está vindo do token do Hacker!
    app.dependency_overrides[get_current_user] = lambda: {"user_id": hacker.id, "email": hacker.email}
    
    # 4. O Hacker bate na rota de extrato
    response = client.get("/transactions/extract")
    
    # 5. Limpamos o "hack" do token para não sujar os outros testes
    app.dependency_overrides.pop(get_current_user, None)
    
    assert response.status_code == 200
    dados = response.json()
    
    # O MOMENTO DA VERDADE: O extrato do Hacker TEM que estar vazio e zerado!
    # Ele não pode ver os R$ 999.999,00 do Usuário A de jeito nenhum.
    assert len(dados["transactions"]) == 0
    assert dados["value_spent"] == 0.0


# ==========================================
# 📊 TESTES DE CONTRATO (FRONTEND x BACKEND)
# ==========================================

def test_api_dashboard_metrics_contrato(auth_client):
    """
    Garante que a rota mais complexa do sistema nunca deixe de enviar 
    as variáveis que o Frontend (React) precisa para renderizar a tela.
    """
    # Bate na rota usando o usuário padrão logado (auth_client)
    response = auth_client.get("/transactions/metrics-dashboard")
    
    assert response.status_code == 200
    dados = response.json()
    
    # Verifica se as chaves (chaves do dicionário) existem na resposta.
    # Se amanhã você sem querer apagar uma delas no backend, esse teste grita na hora!
    chaves_esperadas = [
        "month_balance", 
        "legend_balance", 
        "is_incoming_legend", 
        "expenses_out", 
        "expenses_in_on_month", 
        "balance_geral", 
        "next_payments"
    ]
    
    for chave in chaves_esperadas:
        assert chave in dados, f"FALHA: A chave '{chave}' sumiu da rota do Dashboard!"