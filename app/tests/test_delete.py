import pytest
from datetime import date, timedelta
from freezegun import freeze_time
from app.models.expenses_fixed import Expenses_fixed
from app.models.expense import Expense
from app.services.sync_service import sync_user_finances

# =========================================================================
# 🧪 TESTES DE EXCLUSÃO (DELETE) - AS 4 ESTRATÉGIAS
# =========================================================================

def test_delete_colisao_de_ids_cabuloso(auth_client, db_session, test_user):
    """
    O TESTE MAIS IMPORTANTE:
    Uma despesa simples (Pão) tem ID 10.
    Uma mãe (Netflix) tem ID 10.
    O front manda deletar a projeção da Netflix (que vem com ID 10).
    O sistema NÃO PODE deletar o pão. Tem que criar o fantasma da Netflix!
    """
    with freeze_time("2026-08-01"):
        # 1. Cria a Despesa Simples (Forçando ID 10)
        pao = Expense(id=10, user_id=test_user.id, category=1, value=5.0, type_expense=False, 
                      date=date(2026, 8, 1), name="Pão", description="Padaria", is_activated=True)
        db_session.add(pao)
        test_user.balance -= 5

        # 2. Cria a Despesa Mãe (Forçando ID 10)
        netflix = Expenses_fixed(id=10, user_id=test_user.id, name="Netflix", value=50.0,
                                 start_date=date(2026, 8, 1), payment_date=date(2026, 8, 1),
                                 charge=2, category=1, type_expense=False, activated=True)
        db_session.add(netflix)
        db_session.commit()

        # 3. O usuário quer PULAR a Netflix do mês que vem (Projeção de Setembro)
        # O Front manda a requisição para o ID 10 (que é o ID da mãe/projeção)
        payload = {
            "delete_type": "this",
            "come_of_fixed": 10,
            "date": "2026-09-01T00:00:00Z" # Mês que vem
        }
        
        # O 'httpx' do TestClient precisa usar o 'request' pra mandar json no DELETE
        response = auth_client.request("DELETE", "/transactions/10", json=payload)
        assert response.status_code == 200

        db_session.refresh(pao)
        
        # PROVA 1: O pão tem que estar intacto e vivinho da silva!
        assert pao.is_deleted == False
        assert float(pao.value) == 5.0
        
        # PROVA 2: A Projeção virou um FANTASMA no banco!
        fantasma = db_session.query(Expense).filter(
            Expense.fixed_expense_id == 10, Expense.date == date(2026, 9, 1)
        ).first()
        
        assert fantasma is not None
        assert float(fantasma.value) == 0.0 # R$ 0,00
        assert "[PULADA]" in fantasma.name
        assert fantasma.is_deleted == False # Visível pro usuário!


def test_delete_somente_esta_com_estorno_real(auth_client, db_session, test_user):
    """
    Se a transação JÁ EXISTE (já foi descontada do saldo), 
    o delete 'this' tem que devolver o dinheiro e zerar o valor dela.
    """
    with freeze_time("2026-08-01"):
        mae = Expenses_fixed(user_id=test_user.id, name="Academia", value=100.0, start_date=date(2026, 8, 1), payment_date=date(2026, 8, 1), charge=2, category=1, type_expense=False, activated=True)
        db_session.add(mae)
        db_session.commit()

        # O Sync roda e cobra a academia (-100)
        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -100.0

        filha = db_session.query(Expense).filter(Expense.fixed_expense_id == mae.id).first()

        # Usuário clica em 'Pular' a parcela que já tava paga!
        payload = {"delete_type": "this", "come_of_fixed": mae.id, "date": "2026-08-01T00:00:00Z"}
        auth_client.request("DELETE", f"/transactions/{filha.id}", json=payload)

        db_session.refresh(test_user)
        db_session.refresh(filha)

        # Dinheiro voltou pro bolso!
        assert test_user.balance == 0.0
        # A conta virou R$ 0,00 e foi marcada
        assert float(filha.value) == 0.0
        assert "[PULADA]" in filha.name


def test_delete_somente_as_proximas(auth_client, db_session, test_user):
    """
    'As Próximas' (next): Mantém a conta de hoje paga, mas encerra o contrato hoje.
    """
    with freeze_time("2026-08-10"):
        mae = Expenses_fixed(user_id=test_user.id, name="Spotify", value=20.0, start_date=date(2026, 8, 10), payment_date=date(2026, 8, 10), charge=2, category=1, type_expense=False, activated=True)
        db_session.add(mae)
        db_session.commit()

        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        
        filha = db_session.query(Expense).filter(Expense.fixed_expense_id == mae.id).first()

        # Cancela do mês que vem em diante ('next')
        payload = {"delete_type": "next", "come_of_fixed": mae.id, "date": "2026-08-10T00:00:00Z"}
        auth_client.request("DELETE", f"/transactions/{filha.id}", json=payload)

        db_session.refresh(test_user)
        db_session.refresh(mae)
        db_session.refresh(filha)

        # O Saldo TEM que continuar -20, pois ele só cancelou o futuro!
        assert test_user.balance == -20.0
        assert filha.is_deleted == False
        
        # O contrato termina exatamente na data de hoje
        assert mae.end_date == date(2026, 8, 10)


def test_delete_esta_e_as_proximas_encerra_ontem(auth_client, db_session, test_user):
    """
    'Esta e as Próximas' (this_and_next): Deleta e estorna a de hoje, e cancela as futuras.
    """
    with freeze_time("2026-08-15"):
        mae = Expenses_fixed(user_id=test_user.id, name="Internet", value=150.0, start_date=date(2026, 8, 15), payment_date=date(2026, 8, 15), charge=2, category=1, type_expense=False, activated=True)
        db_session.add(mae)
        db_session.commit()

        sync_user_finances(db_session, test_user.id)
        filha = db_session.query(Expense).filter(Expense.fixed_expense_id == mae.id).first()

        # Cancela tudo a partir de agora!
        payload = {"delete_type": "this_and_next", "come_of_fixed": mae.id, "date": "2026-08-15T00:00:00Z"}
        auth_client.request("DELETE", f"/transactions/{filha.id}", json=payload)

        db_session.refresh(test_user)
        db_session.refresh(mae)
        db_session.refresh(filha)

        # Dinheiro de volta!
        assert test_user.balance == 0.0
        # A parcela desaparece do extrato
        assert filha.is_deleted == True
        # Contrato encerrou "ontem"
        assert mae.end_date == date(2026, 8, 14)


def test_delete_todas_a_bomba_atomica_financeira(auth_client, db_session, test_user):
    """
    'Todas' (all): Apaga o passado inteiro, estorna todo o dinheiro, some com a mãe.
    """
    with freeze_time("2026-01-01"):
        mae = Expenses_fixed(user_id=test_user.id, name="Curso Fake", value=500.0, start_date=date(2026, 1, 1), payment_date=date(2026, 1, 1), charge=2, category=1, type_expense=False, activated=True)
        db_session.add(mae)
        db_session.commit()
        
        # O cara paga em Janeiro, Fevereiro e Março (-1500)
        sync_user_finances(db_session, test_user.id)
    
    with freeze_time("2026-02-01"):
        sync_user_finances(db_session, test_user.id)
        
    with freeze_time("2026-03-01"):
        sync_user_finances(db_session, test_user.id)
        
        db_session.refresh(test_user)
        assert test_user.balance == -1500.0

        # Pega a parcela de março (id 3)
        filha_mar = db_session.query(Expense).filter(Expense.date == date(2026, 3, 1)).first()

        # Explode tudo ('all')
        payload = {"delete_type": "all", "come_of_fixed": mae.id, "date": "2026-03-01T00:00:00Z"}
        auth_client.request("DELETE", f"/transactions/{filha_mar.id}", json=payload)

        db_session.refresh(test_user)
        db_session.refresh(mae)

        # O dinheiro dos 3 meses VOLTA!
        assert test_user.balance == 0.0
        
        # A Mãe some
        assert mae.is_deleted == True
        
        # As 3 filhas do passado somem
        filhas = db_session.query(Expense).filter(Expense.fixed_expense_id == mae.id).all()
        for f in filhas:
            assert f.is_deleted == True


def test_delete_despesa_simples_com_estorno(auth_client, db_session, test_user):
    """
    CENÁRIO SIMPLES 1:
    Garante que uma despesa simples ativada (já cobrada no saldo)
    seja deletada fisicamente (is_deleted=True) e o dinheiro volte pro bolso.
    """
    with freeze_time("2026-08-17"):
        # Setup inicial (Saldo começa a sofrer)
        test_user.balance -= 50
        pao = Expense(
            user_id=test_user.id, category=1, value=50.0, type_expense=False, 
            date=date(2026, 8, 17), name="Pão", description="Padaria", 
            is_activated=True, is_deleted=False, fixed_expense_id=None
        )
        db_session.add(pao)
        db_session.commit()
        
        # O dinheiro saiu da conta
        assert test_user.balance == -50.0

        # O front não envia 'come_of_fixed' para despesas simples
        payload = {
            "delete_type": "simple"
        }
        
        response = auth_client.request("DELETE", f"/transactions/{pao.id}", json=payload)
        assert response.status_code == 200
        
        db_session.refresh(test_user)
        db_session.refresh(pao)
        
        # O dinheiro voltou!
        assert test_user.balance == 0.0
        # Despesa desaparece pro sistema
        assert pao.is_deleted == True


def test_delete_despesa_simples_futura_sem_estorno(auth_client, db_session, test_user):
    """
    CENÁRIO SIMPLES 2 (A Pegadinha):
    Garante que uma despesa futura (ainda não cobrada, is_activated=False)
    seja deletada SEM alterar o saldo atual do usuário.
    """
    with freeze_time("2026-08-17"):
        # Gasto agendado pro mês que vem! (Não mexe no saldo agora)
        videogame = Expense(
            user_id=test_user.id, category=1, value=3000.0, type_expense=False, 
            date=date(2026, 9, 17), name="PS5", description="Loja", 
            is_activated=False, is_deleted=False, fixed_expense_id=None
        )
        db_session.add(videogame)
        db_session.commit()
        
        # Saldo continua 0.0 (intacto)
        assert test_user.balance == 0.0 

        # Simulando que o front enviou um JSON vazio sem querer
        # A dedução do Back-end tem que saber que é uma despesa simples!
        payload = {} 
        
        response = auth_client.request("DELETE", f"/transactions/{videogame.id}", json=payload)
        assert response.status_code == 200
        
        db_session.refresh(test_user)
        db_session.refresh(videogame)
        
        # O saldo tem que CONTINUAR 0.0!
        # Se o sistema estornasse cego, o usuário ia ficar com + R$ 3000 do nada!
        assert test_user.balance == 0.0
        assert videogame.is_deleted == True