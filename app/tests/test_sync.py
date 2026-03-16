import pytest
from datetime import date
from freezegun import freeze_time
# from app.controllers.transaction_controller import process_fixed_expenses_in_period
from app.controllers.transaction_controller import process_fixed_expenses_in_period
from app.services.sync_service import sync_user_finances
from app.models.expenses_fixed import Expenses_fixed
from app.models.expense import Expense





def test_sync_quinzenal_no_futuro(db_session, test_user):
    with freeze_time("2026-03-16"):
        nova_faxina = Expenses_fixed(
            user_id=test_user.id, name="Faxina Quinzenal", value=60,
            start_date=date(2026, 3, 16), payment_date=date(2026, 3, 16),
            charge=1, category=1, type_expense=False, activated=True
        )
        db_session.add(nova_faxina)
        db_session.commit()
        
        test_user.balance -= 60
        db_session.add(Expense(user_id=test_user.id, category=1, value=60, type_expense=False, date=date(2026, 3, 16), is_activated=True, fixed_expense_id=nova_faxina.id, name="Faxina Quinzenal", description="Primeira parcela faxina"))
        db_session.commit()

    with freeze_time("2026-03-20"): # 4 dias
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -60 # Não cobra

    with freeze_time("2026-03-31"): # 15 dias
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -120 # Cobrou!

    with freeze_time("2026-04-15"): # 30 dias
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -180 # Cobrou!


def test_sync_semanal_no_futuro(db_session, test_user):
    with freeze_time("2026-04-01"):
        feira = Expenses_fixed(
            user_id=test_user.id, name="Feira", value=100,
            start_date=date(2026, 4, 1), payment_date=date(2026, 4, 1),
            charge=3, category=1, type_expense=False, activated=True
        )
        db_session.add(feira)
        db_session.commit()
        
        test_user.balance -= 100
        db_session.add(Expense(user_id=test_user.id, category=1, value=100, type_expense=False, date=date(2026, 4, 1), is_activated=True, fixed_expense_id=feira.id, name="Feira", description="Primeira parcela feira"))
        db_session.commit()

    with freeze_time("2026-04-05"): # 4 dias
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -100

    with freeze_time("2026-04-08"): # 7 dias
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -200
        
    with freeze_time("2026-04-15"): # 7 dias
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -300


def test_sync_anual_no_futuro(db_session, test_user):
    with freeze_time("2026-05-10"):
        ipva = Expenses_fixed(
            user_id=test_user.id, name="IPVA", value=1200,
            start_date=date(2026, 5, 10), payment_date=date(2026, 5, 10),
            charge=4, category=1, type_expense=False, activated=True
        )
        db_session.add(ipva)
        db_session.commit()
        
        test_user.balance -= 1200
        db_session.add(Expense(user_id=test_user.id, category=1, value=1200, type_expense=False, date=date(2026, 5, 10), is_activated=True, fixed_expense_id=ipva.id, name="IPVA", description="Cota anual IPVA"))
        db_session.commit()

    with freeze_time("2026-12-31"): # 7 meses depois
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -1200 # Continua intacto

    with freeze_time("2027-05-10"): # Exato 1 ano depois
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -2400 # Cobrou o novo IPVA!

    with freeze_time("2027-12-31"): # 19 meses depois
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -2400 # Continua intacto

    with freeze_time("2028-05-10"): # Exato 1 ano depois
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -3600 # Cobrou o novo IPVA!


def test_sync_mensal_mes_curto(db_session, test_user):
    # Teste extremo: Assinou dia 31 de Janeiro
    with freeze_time("2026-01-31"):
        netflix = Expenses_fixed(
            user_id=test_user.id, name="Netflix", value=50,
            start_date=date(2026, 1, 31), payment_date=date(2026, 1, 31),
            charge=2, category=1, type_expense=False, activated=True
        )
        db_session.add(netflix)
        db_session.commit()
        
        test_user.balance -= 50
        db_session.add(Expense(user_id=test_user.id, category=1, value=50, type_expense=False, date=date(2026, 1, 31), is_activated=True, fixed_expense_id=netflix.id, name="Netflix", description="Mensalidade base"))
        db_session.commit()

    # Fevereiro só tem 28 dias. O sistema tem que jogar a cobrança pro dia 28!
    with freeze_time("2026-02-28"): 
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -100

    # Março ele volta pro dia 31 original
    with freeze_time("2026-03-10"):
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -100

    # Março ele volta pro dia 31 original
    with freeze_time("2026-03-31"):
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -150


def test_sync_parcelado_4_vezes(db_session, test_user):
    with freeze_time("2026-08-05"):
        geladeira = Expenses_fixed(
            user_id=test_user.id, name="Geladeira 4x", value=400,
            start_date=date(2026, 8, 5), payment_date=date(2026, 8, 5), end_date=date(2026, 11, 5),
            charge=5, category=1, type_expense=False, activated=True, installments_count=4
        )
        db_session.add(geladeira)
        db_session.commit()
        
        # Parcela 1/4 (Agosto)
        test_user.balance -= 100 
        db_session.add(Expense(user_id=test_user.id, category=1, value=100, type_expense=False, date=date(2026, 8, 5), is_activated=True, fixed_expense_id=geladeira.id, name="Geladeira 4x", description="Parcela 1 de 4"))
        db_session.commit()
        assert test_user.balance == -100

    with freeze_time("2026-09-05"): # Parcela 2/4 (Setembro)
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -200

    with freeze_time("2026-10-05"): # Parcela 3/4 (Outubro)
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -300


    with freeze_time("2026-10-15"): # Parcela 3/4 (Outubro)
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -300

    with freeze_time("2026-11-05"): # Parcela 4/4 (Novembro) - A Última!
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -400

    with freeze_time("2026-12-05"): # ACABARAM AS PARCELAS! (Dezembro)
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        
        # O Saldo TEM que continuar -400, comprovando que o Onyx parou de cobrar!
        assert test_user.balance == -400
    
    with freeze_time("2026-12-25"): # ACABARAM AS PARCELAS! (Dezembro)
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        
        # O Saldo TEM que continuar -400, comprovando que o Onyx parou de cobrar!
        assert test_user.balance == -400


def test_sync_compra_simples_futuro(db_session, test_user):
    # 1. ESTAMOS NO DIA 16 DE MARÇO (Dia da compra)
    with freeze_time("2026-03-16"):
        # O usuário foi na loja e comprou o Videogame, mas agendou pro dia 10 de Abril.
        # Repare que NÃO usamos a tabela 'Expenses_fixed', vai direto pra 'Expense' normal!
        videogame = Expense(
            user_id=test_user.id,
            category=1,
            value=3000.00,
            type_expense=False, # Gasto
            date=date(2026, 4, 10), # Data no FUTURO!
            name="Videogame (PS5)",
            description="Compra na loja, cai mês que vem",
            is_activated=False, # CRUCIAL: Nasce desativado! Não mexe no saldo.
            payment_method="cartao_credito",
            fixed_expense_id=None
        )
        db_session.add(videogame)
        db_session.commit()
        
        # O saldo do usuário TEM que continuar intacto (começa com 0.0)
        assert test_user.balance == 0.0

    # 2. VIAJAMOS PARA 1º DE ABRIL (Ainda não chegou o dia)
    with freeze_time("2026-04-01"):
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        
        # O Saldo continua 0.0, pois o vencimento é só dia 10.
        assert test_user.balance == 0.0

    # 3. VIAJAMOS PARA 10 DE ABRIL (O Grande Dia!)
    with freeze_time("2026-04-10"):
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        
        # AGORA A MÁGICA ACONTECE! O Sync viu que o dia chegou e debitou.
        assert test_user.balance == -3000.00
        
        # Vamos verificar se o Sync mudou o status da transação no banco para True
        db_session.refresh(videogame)
        assert videogame.is_activated == True
        
    # 4. VIAJAMOS PARA 15 DE ABRIL (Passou o dia)
    with freeze_time("2026-04-15"):
        # Se o Sync rodar de novo, ele NÃO PODE cobrar o videogame duplicado.
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        
        # O Saldo TEM que continuar -3000.00
        assert test_user.balance == -3000.00

    
    with freeze_time("2026-05-15"):
        # Se o Sync rodar de novo, ele NÃO PODE cobrar o videogame duplicado.
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        
        # O Saldo TEM que continuar -3000.00
        assert test_user.balance == -3000.00


def test_sync_abandono_tres_meses(db_session, test_user):
    # Assinou a Netflix no dia 10 de Janeiro
    with freeze_time("2026-01-10"):
        netflix = Expenses_fixed(
            user_id=test_user.id, name="Netflix (Abandono)", value=50,
            start_date=date(2026, 1, 10), payment_date=date(2026, 1, 10),
            charge=2, category=1, type_expense=False, activated=True
        )
        db_session.add(netflix)
        db_session.commit()
        
        test_user.balance -= 50
        db_session.add(Expense(user_id=test_user.id, category=1, value=50, type_expense=False, date=date(2026, 1, 10), is_activated=True, fixed_expense_id=netflix.id, name="Netflix (Abandono)", description="Jan"))
        db_session.commit()

    # O usuário sumiu! Só abriu o app no dia 15 de ABRIL!
    with freeze_time("2026-04-15"):
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        
        # Tem que ter cobrado FEV (-50), MAR (-50) e ABRIL (-50) de uma vez só!
        # Saldo esperado: -50 (Jan) - 150 = -200
        assert test_user.balance == -200
        
        # Verifica se lançou exatamente 4 transações no extrato (Jan, Fev, Mar, Abr)
        transacoes = db_session.query(Expense).filter(Expense.fixed_expense_id == netflix.id).all()
        assert len(transacoes) == 4


def test_sync_dedo_nervoso_idempotencia(db_session, test_user):
    with freeze_time("2026-05-01"):
        academia = Expenses_fixed(
            user_id=test_user.id, name="Academia", value=100,
            start_date=date(2026, 5, 1), payment_date=date(2026, 5, 1),
            charge=2, category=1, type_expense=False, activated=True
        )
        db_session.add(academia)
        db_session.commit()
        
        test_user.balance -= 100
        db_session.add(Expense(user_id=test_user.id, category=1, value=100, type_expense=False, date=date(2026, 5, 1), is_activated=True, fixed_expense_id=academia.id, name="Academia", description="Maio"))
        db_session.commit()

    # Chegou o mês seguinte (Junho)
    with freeze_time("2026-06-01"):
        # O Front-end bugou e chamou o Sync 10 vezes no mesmo segundo!
        for _ in range(10):
            sync_user_finances(db=db_session, user_id=test_user.id)
            
        db_session.refresh(test_user)
        # O Saldo não pode ser -1100. Tem que ser apenas -200!
        assert test_user.balance == -200


def test_sync_cancelamento_end_date(db_session, test_user):
    with freeze_time("2026-07-01"):
        # Assinatura com data de fim para Agosto!
        curso = Expenses_fixed(
            user_id=test_user.id, name="Curso Rápido", value=200,
            start_date=date(2026, 7, 1), payment_date=date(2026, 7, 1),
            end_date=date(2026, 8, 31), # Acaba em Agosto
            charge=2, category=1, type_expense=False, activated=True
        )
        db_session.add(curso)
        db_session.commit()
        
        test_user.balance -= 200
        db_session.add(Expense(user_id=test_user.id, category=1, value=200, type_expense=False, date=date(2026, 7, 1), is_activated=True, fixed_expense_id=curso.id, name="Curso Rápido", description="Julho"))
        db_session.commit()

    with freeze_time("2026-08-01"): # Agosto (Mês do cancelamento)
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -400 # Cobrou

    with freeze_time("2026-09-01"): # Setembro (Já tá cancelado)
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -400 # Continua intacto!


def test_sync_protecao_divisao_por_zero(db_session, test_user):
    with freeze_time("2026-10-01"):
        # A IA mandou Parcelado (Charge=5), mas mandou installments_count=0 !
        celular = Expenses_fixed(
            user_id=test_user.id, name="Celular Bugado", value=1500,
            start_date=date(2026, 10, 1), payment_date=date(2026, 10, 1),
            charge=5, category=1, type_expense=False, activated=True,
            installments_count=0 # ERRO DA IA
        )
        db_session.add(celular)
        db_session.commit()
        
        test_user.balance -= 1500
        db_session.add(Expense(user_id=test_user.id, category=1, value=1500, type_expense=False, date=date(2026, 10, 1), is_activated=True, fixed_expense_id=celular.id, name="Celular Bugado", description="Bugado"))
        db_session.commit()

    with freeze_time("2026-11-01"):
        # O Sync NÃO PODE dar crash por tentar dividir 1500 / 0.
        # Ele deve cobrar o valor cheio ou dividir por 1.
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -3000


def test_negocio_receita_fixa_salario(db_session, test_user):
    # O usuário configurou o Salário para cair todo dia 5
    with freeze_time("2026-01-05"):
        salario = Expenses_fixed(
            user_id=test_user.id, name="Salário Mensal", value=5000,
            start_date=date(2026, 1, 5), payment_date=date(2026, 1, 5),
            charge=2, category=1, 
            type_expense=True, # TRUE = É UMA RECEITA (Entrada de dinheiro!)
            activated=True
        )
        db_session.add(salario)
        db_session.commit()
        # O Saldo aumenta (+) em vez de diminuir (-)
        test_user.balance += 5000
        db_session.add(Expense(user_id=test_user.id, category=1, value=5000, type_expense=True, date=date(2026, 1, 5), is_activated=True, fixed_expense_id=salario.id, name="Salário Mensal", description="Salário Janeiro"))
        db_session.commit()

    with freeze_time("2026-02-05"): # Mês seguinte
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        
        # O Motor tem que saber que era Receita e SOMAR! (5000 + 5000 = 10000)
        assert test_user.balance == 10000


def test_negocio_despesa_diaria(db_session, test_user):
    # O usuário toma um café de R$ 10 na padaria todo santo dia
    with freeze_time("2026-03-01"):
        cafe = Expenses_fixed(
            user_id=test_user.id, name="Café da Manhã", value=10,
            start_date=date(2026, 3, 1), payment_date=date(2026, 3, 1),
            charge=6, category=1, type_expense=False, activated=True # Charge 6 = Diário
        )
        db_session.add(cafe)
        db_session.commit()
        test_user.balance -= 10
        db_session.add(Expense(user_id=test_user.id, category=1, value=10, type_expense=False, date=date(2026, 3, 1), is_activated=True, fixed_expense_id=cafe.id, name="Café da Manhã", description="Dia 1"))
        db_session.commit()

    # Passaram-se 5 dias (Do dia 2 ao dia 6)
    with freeze_time("2026-03-06"):
        sync_user_finances(db=db_session, user_id=test_user.id)
        db_session.refresh(test_user)
        
        # Cobrou 5 dias atrasados (5 * 10 = 50). Saldo inicial -10. Total tem que ser -60.
        assert test_user.balance == -60


def test_negocio_projecao_dashboard_segura(db_session, test_user):
    # Esse teste não chama o Sync! Ele testa a função que manda os dados pro Frontend.
    with freeze_time("2026-01-01"):
        netflix = Expenses_fixed(
            user_id=test_user.id, name="Netflix Visual", value=50,
            start_date=date(2026, 1, 10), payment_date=date(2026, 1, 10),
            charge=2, category=1, type_expense=False, activated=True
        )
        db_session.add(netflix)
        db_session.commit()

        # O Frontend (Calendário) pediu a projeção de Janeiro até o fim de Março (3 meses)
        projecao = process_fixed_expenses_in_period(
            db=db_session, user_id=test_user.id, 
            start_date=date(2026, 1, 1), end_date=date(2026, 3, 31)
        )

        # O Backend tem que devolver uma lista com EXATAMENTE 3 parcelas falsas projetadas.
        assert len(projecao) == 3
        
        # Confere se a matemática do calendário visual bateu os dias certinhos
        assert projecao[0]["date"] == date(2026, 1, 10)
        assert projecao[1]["date"] == date(2026, 2, 10)
        assert projecao[2]["date"] == date(2026, 3, 10)

        # O MAIS IMPORTANTE: Garantir que a função visual NÃO roubou dinheiro do usuário
        assert test_user.balance == 0.0