import pytest
from datetime import date
from freezegun import freeze_time
from app.models.expense import Expense
from app.models.expenses_fixed import Expenses_fixed

# =========================================================================================
# 🧪 BATERIA DE TESTES: CRIAÇÃO MANUAL DE TRANSAÇÕES (WIZARD)
# =========================================================================================

def test_create_manual_simple_expense_now(auth_client, db_session, test_user):
    """
    CENÁRIO 1: Despesa Simples no Dia Atual.
    Garante que comprar algo hoje desconta o valor total do saldo imediatamente.
    """
    with freeze_time("2026-08-24"):
        initial_balance = float(test_user.balance)
        payload = {
            "name": "Almoço",
            "description": "Prato feito",
            "value": 25.50,
            "payment_method": "Pix",
            "category_id": 1,
            "date": "2026-08-24",
            "type_expense": False, # False = Saída
            "is_recurrent": False,
            "is_continuous": False,
            "end_date": None,
            "installments_count": 1,
            "charge_type": "Mensal"
        }
        
        response = auth_client.post("/transactions/create-manual", json=payload)
        assert response.status_code == 200
        
        db_session.refresh(test_user)
        assert float(test_user.balance) == initial_balance - 25.50

        exp = db_session.query(Expense).filter(Expense.name == "Almoço").first()
        assert exp is not None
        assert exp.is_activated == True
        assert exp.fixed_expense_id is None # Não tem mãe


def test_create_manual_simple_income_future(auth_client, db_session, test_user):
    """
    CENÁRIO 2: Receita Simples Agendada para o Futuro.
    Garante que agendar um dinheiro pra cair no futuro NÃO altera o saldo hoje.
    """
    with freeze_time("2026-08-24"):
        initial_balance = float(test_user.balance)
        payload = {
            "name": "Salário Agendado",
            "description": "Pagamento da empresa",
            "value": 5000.0,
            "payment_method": "Pix",
            "category_id": 1,
            "date": "2026-09-05", # Data no futuro!
            "type_expense": True, # True = Entrada
            "is_recurrent": False,
            "is_continuous": False,
            "end_date": None,
            "installments_count": 1,
            "charge_type": "Mensal"
        }
        
        response = auth_client.post("/transactions/create-manual", json=payload)
        assert response.status_code == 200
        
        db_session.refresh(test_user)
        # O saldo tem que estar INTACTO
        assert float(test_user.balance) == initial_balance

        exp = db_session.query(Expense).filter(Expense.name == "Salário Agendado").first()
        assert exp is not None
        assert exp.is_activated == False # Nasce inativado!


def test_create_manual_carne_now(auth_client, db_session, test_user):
    """
    CENÁRIO 3: Carnê/Parcelamento iniciando hoje.
    Garante que o saldo debita apenas a primeira parcela (1000 / 10 = 100) 
    e que a data final é calculada automaticamente.
    """
    with freeze_time("2026-08-24"):
        initial_balance = float(test_user.balance)
        payload = {
            "name": "TV 10x",
            "description": "Casas Bahia",
            "value": 1000.0,
            "payment_method": "Cartão de Crédito",
            "category_id": 1,
            "date": "2026-08-24",
            "type_expense": False,
            "is_recurrent": True,
            "is_continuous": False, # Não é assinatura
            "end_date": None, # Front enviou nulo
            "installments_count": 10,
            "charge_type": "Mensal"
        }
        
        response = auth_client.post("/transactions/create-manual", json=payload)
        assert response.status_code == 200
        
        db_session.refresh(test_user)
        assert float(test_user.balance) == initial_balance - 100.0 # Descontou só R$ 100

        # Verifica a "Mãe"
        mae = db_session.query(Expenses_fixed).filter(Expenses_fixed.name == "TV 10x").first()
        assert mae is not None
        assert mae.installments_count == 10
        assert mae.end_date is not None # O motor calculou a data final!

        # Verifica a "Filha"
        filha = db_session.query(Expense).filter(Expense.fixed_expense_id == mae.id).first()
        assert filha is not None
        assert float(filha.value) == 100.0
        assert filha.is_activated == True


def test_create_manual_carne_future(auth_client, db_session, test_user):
    """
    CENÁRIO 4: Carnê Agendado para o Futuro.
    Garante que cria a despesa mãe, mas NÃO debita saldo e não cria a filha de cara.
    """
    with freeze_time("2026-08-24"):
        initial_balance = float(test_user.balance)
        payload = {
            "name": "Carro Financiado",
            "description": "Banco",
            "value": 50000.0,
            "payment_method": "Pix",
            "category_id": 1,
            "date": "2026-10-10", # Só começa daqui 2 meses
            "type_expense": False,
            "is_recurrent": True,
            "is_continuous": False,
            "end_date": None,
            "installments_count": 50,
            "charge_type": "Mensal"
        }
        
        response = auth_client.post("/transactions/create-manual", json=payload)
        assert response.status_code == 200
        
        db_session.refresh(test_user)
        assert float(test_user.balance) == initial_balance # Saldo intocado
        
        mae = db_session.query(Expenses_fixed).filter(Expenses_fixed.name == "Carro Financiado").first()
        assert mae is not None

        # Como começa no futuro, o motor NÃO cria a primeira parcela ainda! O sync_service cuidará disso no futuro.
        filhas = db_session.query(Expense).filter(Expense.fixed_expense_id == mae.id).all()
        assert len(filhas) == 0


def test_create_manual_subscription_infinite(auth_client, db_session, test_user):
    """
    CENÁRIO 5: Assinatura Contínua Sem Fim (A Netflix).
    Garante que não divide o valor, seta parcelas para 1 e o end_date fica Nulo.
    """
    with freeze_time("2026-08-24"):
        initial_balance = float(test_user.balance)
        payload = {
            "name": "Netflix",
            "description": "Streaming",
            "value": 60.0,
            "payment_method": "Cartão de Crédito",
            "category_id": 1,
            "date": "2026-08-24",
            "type_expense": False,
            "is_recurrent": True,
            "is_continuous": True, # AQUI TÁ A CHAVE DE ASSINATURA
            "end_date": None,
            "installments_count": 1,
            "charge_type": "Mensal"
        }
        
        response = auth_client.post("/transactions/create-manual", json=payload)
        assert response.status_code == 200
        
        db_session.refresh(test_user)
        assert float(test_user.balance) == initial_balance - 60.0 # Descontou o valor cheio

        mae = db_session.query(Expenses_fixed).filter(Expenses_fixed.name == "Netflix").first()
        assert mae is not None
        assert mae.installments_count == 1
        assert mae.end_date is None # Infinito confirmado!

        filha = db_session.query(Expense).filter(Expense.fixed_expense_id == mae.id).first()
        assert float(filha.value) == 60.0


def test_create_manual_subscription_with_end_date(auth_client, db_session, test_user):
    """
    CENÁRIO 6: Assinatura Contínua COM Data de Término (Ex: Aluguel por contrato).
    Garante que não divide o valor, seta parcelas para 1, mas o end_date crava a data do Front.
    """
    with freeze_time("2026-08-24"):
        initial_balance = float(test_user.balance)
        payload = {
            "name": "Aluguel",
            "description": "Contrato de 1 ano",
            "value": 1500.0,
            "payment_method": "Pix",
            "category_id": 1,
            "date": "2026-08-24",
            "type_expense": False,
            "is_recurrent": True,
            "is_continuous": True,
            "end_date": "2027-08-24", # O front enviou a data de cancelamento
            "installments_count": 1,
            "charge_type": "Mensal"
        }
        
        response = auth_client.post("/transactions/create-manual", json=payload)
        assert response.status_code == 200
        
        db_session.refresh(test_user)
        assert float(test_user.balance) == initial_balance - 1500.0

        mae = db_session.query(Expenses_fixed).filter(Expenses_fixed.name == "Aluguel").first()
        assert mae is not None
        assert mae.installments_count == 1 # Não dividiu
        assert mae.end_date == date(2027, 8, 24) # Mas tem fim!