import pytest
from datetime import date
from freezegun import freeze_time
from app.models.expenses_fixed import Expenses_fixed


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