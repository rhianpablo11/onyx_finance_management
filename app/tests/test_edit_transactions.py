import pytest
from datetime import date
from freezegun import freeze_time
from app.models.expense_category import Expense_category
from app.models.expenses_fixed import Expenses_fixed
from app.models.expense import Expense
from app.services.sync_service import sync_user_finances

# ==========================================
# 🧪 TESTES DE EDIÇÃO (SIMPLES E FIXA)
# ==========================================

def test_edit_despesa_simples_atualiza_saldo(auth_client, db_session, test_user):
    """
    CENÁRIO 1: Edição de Despesa Simples.
    Garante que se eu mudar o valor de um pão de R$ 10 para R$ 15, 
    o Onyx vai estornar os 10 e cobrar 15 no saldo.
    """
    with freeze_time("2026-08-17"):
        # 1. Cria a despesa original de R$ 10,00
        test_user.balance -= 10
        pao = Expense(
            user_id=test_user.id, category=1, value=10.0, type_expense=False, 
            date=date(2026, 8, 17), name="Pão na Padaria", description="Café", 
            is_activated=True, is_deleted=False
        )
        db_session.add(pao)
        db_session.commit()
        
        assert test_user.balance == -10.0

        # 2. O usuário errou e edita no front-end para R$ 15,00
        payload = {
            "value": 15.0,
            "category": 1,
            "paymentMethod": "Pix"
        }
        
        # Bate na rota (como é simples, o id é um int em formato string)
        response = auth_client.put(f"/transactions/{pao.id}", json=payload)
        
        assert response.status_code == 200
        db_session.refresh(test_user)
        db_session.refresh(pao)

        # 3. O saldo tem que ter sido ajustado para -15.0!
        assert test_user.balance == -15.0
        assert float(pao.value) == 15.0
        assert pao.payment_method == "Pix"


def test_edit_parcela_fixa_recalcula_mae_e_filha(auth_client, db_session, test_user):
    """
    CENÁRIO 2: Edição de uma Parcela Fixa FÍSICA (Que o usuário já pagou/gerou).
    Se editar o valor de uma parcela de carnê, o saldo da filha atualiza,
    e a tabela mãe (que guarda o total) deve multiplicar o novo valor.
    """
    with freeze_time("2026-08-17"):
        # 1. Cria a despesa mãe (Ex: Geladeira 10x de R$ 100) -> Total 1000
        mae = Expenses_fixed(
            user_id=test_user.id, name="Geladeira 10x", value=1000.0,
            start_date=date(2026, 8, 17), payment_date=date(2026, 8, 17),
            charge=2, category=1, type_expense=False, activated=True, installments_count=10
        )
        db_session.add(mae)
        db_session.commit()

        # 2. Cria a parcela gerada (A filha)
        test_user.balance -= 100
        filha = Expense(
            user_id=test_user.id, category=1, value=100.0, type_expense=False, 
            date=date(2026, 8, 17), name="Geladeira 10x", description="Parcela 1", 
            is_activated=True, is_deleted=False, fixed_expense_id=mae.id
        )
        db_session.add(filha)
        db_session.commit()

        # 3. Usuário renegociou, a parcela agora é R$ 80,00!
        payload = {
            "value": 800.0,
            "fixedExpenseID": mae.id,  # O front-end envia quem é a mãe!
            "category": 1
        }
        
        response = auth_client.put(f"/transactions/{filha.id}", json=payload)
        
        assert response.status_code == 200
        db_session.refresh(test_user)
        db_session.refresh(mae)
        db_session.refresh(filha)

        # O saldo deve estornar 100 e cobrar 80 (Fica -80)
        assert test_user.balance == -80.0
        assert float(filha.value) == 80.0
        
        # A MÁGICA: O valor total da mãe tem que ter virado 800 (80 * 10)
        assert float(mae.value) == 800.0


def test_edit_projecao_mudando_recorrencia_sem_mexer_no_saldo(auth_client, db_session, test_user):
    """
    CENÁRIO 3: Edição de uma PROJEÇÃO DO FUTURO.
    Muda de "Mensal" para "Semanal".
    O Saldo NÃO pode ser alterado, pois a projeção não existe como dívida ainda.
    """
    with freeze_time("2026-08-17"):
        # 1. Cria a despesa mãe (Mensal - ID de charge = 2)
        mae = Expenses_fixed(
            user_id=test_user.id, name="Curso de Inglês", value=200.0,
            start_date=date(2026, 8, 17), payment_date=date(2026, 8, 17),
            charge=2, category=1, type_expense=False, activated=True
        )
        db_session.add(mae)
        db_session.commit()
        
        test_user.balance = 1000 # Usuário tem dinheiro na conta
        db_session.commit()

        # 2. O usuário clica na projeção de Dezembro no Front-end e edita para Semanal
        transaction_id_projetada = mae.id
        
        payload = {
            "value": 50.0,
            "fixedExpenseID": mae.id,
            "typeOfCharge": "Semanal" # Mudou a recorrência
        }
        
        response = auth_client.put(f"/transactions/{transaction_id_projetada}", json=payload)
        assert response.status_code == 200
        
        db_session.refresh(test_user)
        db_session.refresh(mae)

        # O saldo continua 1000, pois ele só editou o futuro
        assert test_user.balance == 1000.0
        
        # A mãe agora tem que apontar para Semanal (Charge ID = 3 de acordo com seu setup)
        assert mae.charge == 3
        # Como não tem número de parcelas (infinito), o valor total da mãe vira o da nova parcela
        assert float(mae.value) == 50.0


def test_edit_antecipar_data_fim_encerra_cobrancas(auth_client, db_session, test_user):
    """
    CENÁRIO 4: Usuário adiantou o término da conta e mudou a data_end da mãe.
    """
    with freeze_time("2026-08-17"):
        mae = Expenses_fixed(
            user_id=test_user.id, name="Financiamento", value=5000.0,
            start_date=date(2026, 1, 1), payment_date=date(2026, 1, 1), end_date=date(2028, 1, 1),
            charge=2, category=1, type_expense=False, activated=True
        )
        db_session.add(mae)
        db_session.commit()

        payload = {
            "fixedExpenseID": mae.id,
            "dateOfLastPayment": "2026-09-01T00:00:00Z" # Adiantou para mês que vem!
        }
        
        transaction_id_projetada = mae.id
        response = auth_client.put(f"/transactions/{transaction_id_projetada}", json=payload)
        
        assert response.status_code == 200
        db_session.refresh(mae)

        # O banco precisa ter salvo apenas a data limpa (Y-m-d)
        assert mae.end_date == date(2026, 9, 1)


def test_mega_jornada_despesa_fixa_mutante(auth_client, db_session, test_user):
    """
    Cria Mensal -> Cobra 2 meses -> Edita Categoria -> Cobra mais 2 meses -> 
    Muda pra Semanal (Auto-correção do Back-end entra em ação) -> Passam semanas -> 
    Muda pra Quinzenal -> Antecipa o Fim -> Prova que parou de cobrar.
    """
    cat_lazer = Expense_category(name="Lazer", user_id=test_user.id)
    db_session.add(cat_lazer)
    db_session.commit()

    with freeze_time("2026-01-01"):
        # 1. JANEIRO: CRIAÇÃO DA DESPESA MENSAL
        mae = Expenses_fixed(
            user_id=test_user.id, name="Assinatura Onyx", value=100.0,
            start_date=date(2026, 1, 1), payment_date=date(2026, 1, 1),
            charge=2, category=1, type_expense=False, activated=True
        ) # charge=2 -> Mensal
        db_session.add(mae)
        db_session.commit()

        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -100.0 

    with freeze_time("2026-02-01"):
        # 2. FEVEREIRO: COBRA NORMAL E EDITA A CATEGORIA
        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -200.0 
        
        filha_fev = db_session.query(Expense).filter(Expense.date == date(2026, 2, 1)).first()
        payload_edit = {"fixedExpenseID": mae.id, "category": cat_lazer.id}
        auth_client.put(f"/transactions/{filha_fev.id}", json=payload_edit)

        db_session.refresh(mae)
        assert mae.category == cat_lazer.id

    with freeze_time("2026-03-01"):
        # 3. MARÇO: COBRANÇA NORMAL
        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -300.0 

    with freeze_time("2026-04-01"):
        # 4. ABRIL: MUDA DE MENSAL PARA SEMANAL
        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -400.0 

        filha_abr = db_session.query(Expense).filter(Expense.date == date(2026, 4, 1)).first()
        
        payload_semanal = {
            "fixedExpenseID": mae.id,
            "typeOfCharge": "Semanal",
            "dateOfThisPayment": "2026-04-01T00:00:00Z" 
            # O Front NÃO envia editedStartDate (pois travamos a edição de histórico).
            # O Backend tem que ser inteligente e pegar a dateOfThisPayment e resetar a mãe!
        }
        auth_client.put(f"/transactions/{filha_abr.id}", json=payload_semanal)
        
        db_session.refresh(mae)
        # O Controller Inteligente TEM que ter mudado a charge e resetado a data de início!
        assert mae.charge == 3 # ID 3 = Semanal
        assert mae.start_date == date(2026, 4, 1)

    with freeze_time("2026-04-08"): 
        # 5. PASSANDO A PRIMEIRA SEMANA
        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -500.0 # 400 + 100 da semana 1

    with freeze_time("2026-04-15"): 
        # 6. PASSANDO A SEGUNDA SEMANA E MUDANDO PRA QUINZENAL
        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -600.0 # 500 + 100 da semana 2

        filha_sem_2 = db_session.query(Expense).filter(Expense.date == date(2026, 4, 15)).first()
        payload_quinzenal = {
            "fixedExpenseID": mae.id,
            "typeOfCharge": "Quinzenal",
            "dateOfThisPayment": "2026-04-15T00:00:00Z"
        }
        auth_client.put(f"/transactions/{filha_sem_2.id}", json=payload_quinzenal)
        
        db_session.refresh(mae)
        assert mae.charge == 1 # ID 1 = Quinzenal
        assert mae.start_date == date(2026, 4, 15)

    with freeze_time("2026-04-30"): 
        # 7. PASSANDO A QUINZENA E ANTECIPANDO O FIM
        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -700.0 # Cobrou a 1ª quinzena!

        filha_quinzena = db_session.query(Expense).filter(Expense.date == date(2026, 4, 30)).first()
        payload_fim = {
            "fixedExpenseID": mae.id,
            "dateOfLastPayment": "2026-04-30T00:00:00Z"
        }
        auth_client.put(f"/transactions/{filha_quinzena.id}", json=payload_fim)

        db_session.refresh(mae)
        assert mae.end_date == date(2026, 4, 30)

    with freeze_time("2026-08-09"): 
        # 8. O FUTURO DISTANTE: VERIFICANDO SE A COBRANÇA REALMENTE PAROU
        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        # O SALDO TEM QUE CONTINUAR -700! 
        assert test_user.balance == -700.0


# =========================================================================
# 🧪 MEGA JORNADA 3: O CARNÊ RENEGOCIADO (Parcelamento com Quitação)
# =========================================================================
def test_mega_jornada_parcelamento_quitado(auth_client, db_session, test_user):
    """
    Compra em 5x. Paga 2x. Na terceira, ele abate a dívida e cancela as últimas 2.
    """
    with freeze_time("2026-01-01"):
        # Mãe: TV em 5x de 200 (Total 1000)
        tv_mae = Expenses_fixed(
            user_id=test_user.id, name="TV 5x", value=1000.0,
            start_date=date(2026, 1, 1), payment_date=date(2026, 1, 1), end_date=date(2026, 5, 1),
            charge=2, category=1, type_expense=False, activated=True, installments_count=5
        )
        db_session.add(tv_mae)
        db_session.commit()

        # Parcela 1/5
        test_user.balance -= 200
        db_session.add(Expense(
            user_id=test_user.id, category=1, value=200, type_expense=False, 
            date=date(2026, 1, 1), is_activated=True, fixed_expense_id=tv_mae.id,
            name="TV 5x", description="Parcela 1/5" # 🔥 O BANCO BARROU A GENTE AQUI! AGORA TEM NOME E DESCRIÇÃO.
        ))
        db_session.commit()

    with freeze_time("2026-02-01"):
        # Fevereiro: Parcela 2/5
        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -400.0

    with freeze_time("2026-03-01"):
        # Março: O Usuário decide quitar tudo com desconto! Ele paga 400 na 3ª parcela e cancela o resto.
        sync_user_finances(db_session, test_user.id) 
        
        parcela_3 = db_session.query(Expense).filter(Expense.date == date(2026, 3, 1)).first()
        
        payload_quitacao = {
            "fixedExpenseID": tv_mae.id,
            "value": 2000.0, 
            "dateOfLastPayment": "2026-03-01T00:00:00Z"
        }
        auth_client.put(f"/transactions/{parcela_3.id}", json=payload_quitacao)
        
        db_session.refresh(test_user)
        db_session.refresh(tv_mae)
        
        # Saldo: -400 (Jan e Fev) - 400 (Quitação de Março) = -800
        assert test_user.balance == -800.0
        
        # A mãe tem que ter ajustado o valor total (400 * 5)
        assert float(tv_mae.value) == 2000.0

    with freeze_time("2026-04-01"):
        # Abril: A prova de fogo. O motor NÃO PODE gerar a parcela 4/5!
        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        assert test_user.balance == -800.0 # Ficou intacto!


# =========================================================================
# 🧪 MEGA JORNADA 1: A LOUCURA DA DESPESA SIMPLES (Edição e Estorno Duplo)
# =========================================================================
def test_mega_jornada_despesa_simples_caos(auth_client, db_session, test_user):
    """
    O usuário compra algo no futuro, edita antes de cobrar, 
    é cobrado, se arrepende, edita o valor de novo, e muda a data.
    """
    # 1. Compra um Celular à vista no dia 01, mas agendado pro dia 10
    with freeze_time("2026-05-01"):
        # Criando direto no banco simulando que a IA já processou
        celular = Expense(
            user_id=test_user.id, category=1, value=2000.0, type_expense=False, 
            date=date(2026, 5, 10), name="Celular", description="Eletrônico", 
            is_activated=False, is_deleted=False
        )
        db_session.add(celular)
        db_session.commit()
        
        assert test_user.balance == 0.0 # Nasceu desativado (no futuro), saldo intacto

    # 2. Dia 05: Ele lembra que usou cupom e o celular foi 1800. Ele edita ANTES de cobrar.
    with freeze_time("2026-05-05"):
        payload_edit_1 = {"value": 1800.0}
        response = auth_client.put(f"/transactions/{celular.id}", json=payload_edit_1)
        assert response.status_code == 200
        
        db_session.refresh(test_user)
        # O Saldo TEM que continuar zero, pois a despesa ainda não foi ativada pelo Sync!
        assert test_user.balance == 0.0

    # 3. Dia 10: O Sync roda e efetiva a compra
    with freeze_time("2026-05-10"):
        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        # Agora sim, o motor viu que o dia chegou e debitou os 1800!
        assert test_user.balance == -1800.0

    # 4. Dia 15: O usuário devolveu o celular e pegou um de 3000. Edita DEPOIS de cobrar.
    with freeze_time("2026-05-15"):
        payload_edit_2 = {"value": 3000.0, "date": "2026-05-15T00:00:00Z"}
        auth_client.put(f"/transactions/{celular.id}", json=payload_edit_2)
        
        db_session.refresh(test_user)
        db_session.refresh(celular)
        # O sistema tem que ter estornado os 1800 e cobrado os 3000
        assert test_user.balance == -3000.0
        assert celular.date == date(2026, 5, 15)


def test_edit_barrar_reducao_de_parcelas_invalidas(auth_client, db_session, test_user):
    with freeze_time("2026-01-01"):
        mae = Expenses_fixed(user_id=test_user.id, name="TV", value=1000.0, start_date=date(2026, 1, 1), payment_date=date(2026, 1, 1), charge=2, category=1, type_expense=False, activated=True, installments_count=5)
        db_session.add(mae)
        db_session.commit()
        
        test_user.balance -= 600
        # 🔥 NOME E DESCRIÇÃO ADICIONADOS
        db_session.add(Expense(user_id=test_user.id, category=1, value=200, type_expense=False, date=date(2026, 1, 1), is_activated=True, fixed_expense_id=mae.id, name="TV", description="1/5"))
        db_session.add(Expense(user_id=test_user.id, category=1, value=200, type_expense=False, date=date(2026, 2, 1), is_activated=True, fixed_expense_id=mae.id, name="TV", description="2/5"))
        db_session.add(Expense(user_id=test_user.id, category=1, value=200, type_expense=False, date=date(2026, 3, 1), is_activated=True, fixed_expense_id=mae.id, name="TV", description="3/5"))
        db_session.commit()

        parcela_mar = db_session.query(Expense).filter(Expense.date == date(2026, 3, 1)).first()
        payload = {
            "fixedExpenseID": mae.id,
            "installments_count": 2 
        }
        
        response = auth_client.put(f"/transactions/{parcela_mar.id}", json=payload)
        
        assert response.status_code == 400
        assert "não pode ser menor que as já pagas" in response.json()['detail']


def test_edit_matematica_complexa_e_preservacao_do_passado(auth_client, db_session, test_user):
    with freeze_time("2026-01-01"):
        mae = Expenses_fixed(user_id=test_user.id, name="PC", value=1000.0, start_date=date(2026, 1, 1), payment_date=date(2026, 1, 1), charge=2, category=1, type_expense=False, activated=True, installments_count=5)
        db_session.add(mae)
        db_session.commit()
        
        test_user.balance -= 400
        # 🔥 NOME E DESCRIÇÃO ADICIONADOS
        db_session.add(Expense(user_id=test_user.id, category=1, value=200, type_expense=False, date=date(2026, 1, 1), is_activated=True, fixed_expense_id=mae.id, name="PC", description="1/5"))
        db_session.add(Expense(user_id=test_user.id, category=1, value=200, type_expense=False, date=date(2026, 2, 1), is_activated=True, fixed_expense_id=mae.id, name="PC", description="2/5"))
        db_session.commit()

    with freeze_time("2026-03-01"):
        sync_user_finances(db_session, test_user.id) 
        parcela_mar = db_session.query(Expense).filter(Expense.date == date(2026, 3, 1)).first()

        payload = {
            "fixedExpenseID": mae.id,
            "value": 3000.0,
            "installments_count": 10
        }
        response = auth_client.put(f"/transactions/{parcela_mar.id}", json=payload)
        assert response.status_code == 200

        db_session.refresh(test_user)
        db_session.refresh(mae)
        db_session.refresh(parcela_mar)

        assert float(mae.value) == 3000.0
        assert mae.installments_count == 10
        assert float(parcela_mar.value) == 300.0
        
        parcela_fev = db_session.query(Expense).filter(Expense.date == date(2026, 2, 1)).first()
        assert float(parcela_fev.value) == 200.0
        assert test_user.balance == -700.0


def test_edit_recorrencia_sem_bugar_passado(auth_client, db_session, test_user):
    with freeze_time("2026-05-01"):
        mae = Expenses_fixed(user_id=test_user.id, name="Academia", value=100.0, start_date=date(2026, 5, 1), payment_date=date(2026, 5, 1), charge=2, category=1, type_expense=False, activated=True)
        db_session.add(mae)
        db_session.commit()
        
        test_user.balance -= 200
        # 🔥 NOME E DESCRIÇÃO ADICIONADOS
        db_session.add(Expense(user_id=test_user.id, category=1, value=100, type_expense=False, date=date(2026, 5, 1), is_activated=True, fixed_expense_id=mae.id, name="Academia", description="Mensal"))
        db_session.add(Expense(user_id=test_user.id, category=1, value=100, type_expense=False, date=date(2026, 6, 1), is_activated=True, fixed_expense_id=mae.id, name="Academia", description="Mensal"))
        db_session.commit()

    with freeze_time("2026-07-01"):
        sync_user_finances(db_session, test_user.id) 
        parcela_julho = db_session.query(Expense).filter(Expense.date == date(2026, 7, 1)).first()

        payload = {
            "fixedExpenseID": mae.id,
            "typeOfCharge": "Semanal",
            "dateOfThisPayment": "2026-07-01T00:00:00Z"
        }
        auth_client.put(f"/transactions/{parcela_julho.id}", json=payload)
        db_session.refresh(mae)

        assert mae.start_date == date(2026, 7, 1)
        assert mae.charge == 3 

    with freeze_time("2026-07-08"): 
        sync_user_finances(db_session, test_user.id)
        db_session.refresh(test_user)
        
        assert test_user.balance == -400.0