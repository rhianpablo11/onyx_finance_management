from sqlalchemy import desc, or_, select
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import date, timedelta
from app.models.expense import Expense
from app.models.expense_category import Expense_category
from app.models.expenses_fixed import Expenses_fixed
from app.services.ai_processor import analyze_transaction_text
from app.controllers.expense_category_controller import expense_category_analysis
from app.controllers.charge_type_controller import get_charge_type_id
from app.models.charge_type import Charge_type
from app.controllers.chat_logs_controller import create_new_chat_log
from app.utils.utils import get_month_range


def create_new_expense(user_id: int, text_typed: str, db: Session):
    
    try:
        stmt_categories = select(Expense_category.name).where(Expense_category.user_id == user_id)
        categorys_of_user = db.execute(stmt_categories).scalars().all()
        print(categorys_of_user)

        # 2. Seleciona todos os nomes de tipos de cobrança
        stmt_charges = select(Charge_type.name)
        charge_types_existing = db.execute(stmt_charges).scalars().all()
        print(charge_types_existing)

        ia_response = analyze_transaction_text(text=text_typed, user_categories=categorys_of_user, charge_types=charge_types_existing)
        if(ia_response == None):
            raise HTTPException(status_code=400, detail='IA fora de operação')
        
        print('aquiiii')
        category_id = expense_category_analysis(categorys_of_user=categorys_of_user,
                                                    user_id=user_id,
                                                    db=db,
                                                    category_for_verification=ia_response['category'],
                                                    )

        create_new_chat_log(text_typed=text_typed,
                            db=db,
                            user_id=user_id,
                            ai_json_response=ia_response)

        if(ia_response['is_recurrent'] == False):
            #work with table of Expense

            new_expense = Expense(
                user_id=user_id,
                category=category_id,
                value=ia_response['amount'],
                type_expense=ia_response['type'],
                description=ia_response['description'],
                date=ia_response['first_payment_date'],
                payment_method=ia_response['payment_method'],
                is_activated=True,
                name=ia_response['name']
            )
            db.add(new_expense)
            db.commit()
            db.refresh(new_expense)
            return {'type': 'simple',
                    'data': new_expense}
        else:
            #work with table of Expense_fixed
            charge_id = get_charge_type_id(ia_response['type_of_installment'], charge_types_existing, db)
            print(charge_id)
            new_expense_fixed = Expenses_fixed(
                user_id=user_id,
                name=ia_response['name'],
                value=ia_response['amount'],
                start_date=ia_response['first_payment_date'],
                end_date=ia_response['last_payment_date'],
                charge=charge_id,
                category=category_id,
                payment_date=ia_response['first_payment_date'],
                activated=True,
                type_expense=ia_response['type'],
                installments_count=ia_response['installments_count']
            )

            db.add(new_expense_fixed)
            db.commit()
            db.refresh(new_expense_fixed)
            return {'type': 'fixed',
                    'data':new_expense_fixed}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail='Error in create new transaction')
        


def get_all_expenses_in_date(db: Session, user_id: int):
    start_date = date(2026, 1, 1)
    end_date = date(2026, 1, 31)
    stmt_expenses = select(Expense.id).select(Expense.value).select(Expense.type_expense).select(Expense.payment_method).select(Expense.category).where(Expense.user_id == user_id).where(Expense.date.between(start_date, end_date)).where(Expense.is_activated == True)
    list_expenses = db.execute(stmt_expenses).scalars().all()

    return list_expenses


def get_total_spent_on_the_date(db:Session, user_id: int, start_date: date, end_date: date):
    
    stmt_expenses = (select(Expense.value)
                     .where(Expense.user_id == user_id)
                     .where(Expense.date.between(start_date, end_date))
                     .where(Expense.is_activated == True)
                     .where(Expense.type_expense == False))
    list_expenses = db.execute(stmt_expenses).scalars().all()
    
    amount = sum([float(v) for v in list_expenses])
    

    stmt_expenses_fixed = (
        select(Expenses_fixed.value)
        .where(
            Expenses_fixed.user_id == user_id,
            Expenses_fixed.activated == True,
            # Regra 1: Começou antes do fim do mês pesquisado
            Expenses_fixed.start_date <= end_date,
            # Regra 2: Não terminou, ou terminou depois que o mês começou
            or_(
                Expenses_fixed.end_date == None,
                Expenses_fixed.end_date >= start_date
            )
        )
        .where(Expenses_fixed.type_expense == False)
    )

    list_expenses_fixed = db.execute(stmt_expenses_fixed).scalars().all()

    amount += sum([float(v) for v in list_expenses_fixed])
    print(amount)

    return {
        'value': amount
    }


def get_total_received_on_the_date(db:Session, user_id: int, start_date: date, end_date: date):

    stmt_expenses = (select(Expense.value)
                     .where(Expense.user_id == user_id)
                     .where(Expense.date.between(start_date, end_date))
                     .where(Expense.is_activated == True)
                     .where(Expense.type_expense == True))
    list_expenses = db.execute(stmt_expenses).scalars().all()
    
    print(list_expenses)
    amount = sum([float(v) for v in list_expenses])
    
    stmt_expenses_fixed = (
        select(Expenses_fixed.value)
        .where(
            Expenses_fixed.user_id == user_id,
            Expenses_fixed.activated == True,
            # Regra 1: Começou antes do fim do mês pesquisado
            Expenses_fixed.start_date <= end_date,
            # Regra 2: Não terminou, ou terminou depois que o mês começou
            or_(
                Expenses_fixed.end_date == None,
                Expenses_fixed.end_date >= start_date
            )
        )
        .where(Expenses_fixed.type_expense == True)
    )

    list_expenses_fixed = db.execute(stmt_expenses_fixed).scalars().all()

    amount += sum([float(v) for v in list_expenses_fixed])
    print(amount)

    return {
        'value': amount
    }


#retorna o saudo do mes atual
def get_monthly_balance_value(db: Session, user_id: int, month: int = None, year: int = None):
    today = date.today()
    target_month = month if month else today.month
    target_year = year if year else today.year

    start_date, end_date = get_month_range(target_month, target_year)
    total_expenses = get_total_spent_on_the_date(db=db,
                                                 user_id=user_id,
                                                 start_date=start_date,
                                                 end_date=end_date)
    total_received = get_total_received_on_the_date(db=db,
                                                    user_id=user_id,
                                                    start_date=start_date,
                                                    end_date=end_date)
    
    return {
        'value': total_received['value'] - total_expenses['value'],
        'period': f"{target_month}/{target_year}"
    }


#pegar as ultimas transações umas 10 no max
def get_day_and_last_transactions(db: Session, user_id: int):
    # pegar o dia de hoje
    # pegar as transações feitas no dia de hoje - fixas ou não
    # transações so de gasto
    # preciso: nome, valor, categoria

    today = date.today()

    stmt_get = (select(Expense.value, Expense.name, Expense.category, Expense.id)
                .where(Expense.user_id == user_id)
                .where(Expense.date == today)
                .where(Expense.type_expense == False)
                .order_by(desc(Expense.id)))
    list_expenses = db.execute(stmt_get).all()


    stmt_get_fixed = (select(Expenses_fixed.value, Expenses_fixed.name, Expenses_fixed.category, Expenses_fixed.id)
                      .where(Expenses_fixed.user_id == user_id)
                      .where(Expenses_fixed.start_date == today)
                      .where(Expenses_fixed.type_expense == False)
                      .order_by(desc(Expenses_fixed.id)))
    list_expenses_fixed = db.execute(stmt_get_fixed).all()
    
    formatted_list = []
    for item in list_expenses:
        formatted_list.append({
            "nameExpense": item.name,
            "value": item.value,
            "category": item.category,
            "id": item.id,
            "type": False
        })

    for item in list_expenses_fixed:
        formatted_list.append({
            "nameExpense": item.name,
            "value": item.value,
            "category": item.category,
            "id": item.id,
            "type": False
        })

    return formatted_list
    


#pegar as entradas/recebimentos do mes
def get_monthly_receives(db: Session, user_id: int):
    today = date.today()
    target_month = today.month
    target_year = today.year
    start_date, end_date = get_month_range(target_month, target_year)

    stmt_get = (select(Expense.value,Expense.date, Expense.name, Expense.category, Expense.id)
                .where(Expense.user_id == user_id)
                .where(Expense.date.between(start_date, end_date))
                .where(Expense.type_expense == True))
    list_received = db.execute(stmt_get).all()


    stmt_get_fixed = (select(Expenses_fixed.value, Expenses_fixed.start_date, Expenses_fixed.name, Expenses_fixed.category, Expenses_fixed.id)
                      .where(Expenses_fixed.user_id == user_id)
                      .where(Expense.date.between(start_date, end_date))
                      .where(Expenses_fixed.type_expense == True))
    list_receiveds_fixed = db.execute(stmt_get_fixed).all()
    
    formatted_list = []

    for item in list_received:
        formatted_list.append({
            'value': item.value,
            'nameExpense': item.name,
            'category' : item.category,
            'type': True,
            'id': item.id,
            'date':item.date
        })

    for item in list_receiveds_fixed:
        formatted_list.append({
            'value': item.value,
            'nameExpense': item.name,
            'category' : item.category,
            'type': True,
            'id': item.id,
            'date': item.start_date
        })

    return formatted_list


#pegar os proximos pagamentos a ser feitos
def get_next_payments(db: Session, user_id: int):
    pass


#pegar o saldo em um periodo especifico
def get_balance_in_period(db: Session, user_id: int,start_date: date, end_date: date):
    # 1. Pega o total de ENTRADAS no período (já somando fixas + variáveis)
    total_received = get_total_received_on_the_date(
        db=db, 
        user_id=user_id, 
        start_date=start_date, 
        end_date=end_date
    )
    
    # 2. Pega o total de SAÍDAS no período
    total_spent = get_total_spent_on_the_date(
        db=db, 
        user_id=user_id, 
        start_date=start_date, 
        end_date=end_date
    )

    # 3. Calcula o saldo (Recebido - Gasto)
    balance = total_received['value'] - total_spent['value']

    return {
        'value': balance
    }

    



def process_fixed_expenses_in_period(db: Session, user_id: int, start_date: date, end_date: date):
    # 1. Busca todas as fixas ativas do usuário que começaram ANTES do fim da busca
    stmt = (select(Expenses_fixed, Charge_type.name.label('charge_name'))
            .join(Charge_type, Expenses_fixed.charge == Charge_type.id)
            .where(Expenses_fixed.user_id == user_id)
            .where(Expenses_fixed.activated == True)
            .where(Expenses_fixed.start_date <= end_date) # Começou antes do fim do filtro
            .where(or_(Expenses_fixed.end_date == None, Expenses_fixed.end_date >= start_date)) # Não acabou antes do inicio
           )
    
    # Retorna tuplas (Expenses_fixed, NomeDoTipo)
    results = db.execute(stmt).all() 
    
    projected_transactions = []

    for expense, charge_name in results:
        # A lógica aqui depende do tipo. Vou fazer MENSAL que é 99% dos casos.
        # Você pode expandir para Semanal depois.
        
        current_check_date = start_date
        
        # Vamos varrer dia a dia do período selecionado (ex: os 7 dias)
        # Se for um intervalo grande, existem formas matematicas mais rapidas, 
        # mas para extratos curtos, loop while é seguro e facil de entender.
        
        while current_check_date <= end_date:
            
            should_add = False
            
            # --- LÓGICA MENSAL ---
            if charge_name.lower() == 'mensal':
                # Se o dia da despesa (ex: dia 15) for igual ao dia que estamos checando no loop
                # E cuidado com fevereiro (dia 30 não existe, python trata isso)
                try:
                    # Verifica se no mes/ano do loop, o dia de pagamento bate
                    if current_check_date.day == expense.payment_date.day:
                        should_add = True
                except ValueError:
                    # Caso tente dia 30 em fevereiro, ignora ou ajusta pro dia 28
                    pass

            # --- LÓGICA SEMANAL ---
            elif charge_name.lower() == 'semanal':
                # Calcula a diferença de dias desde o inicio da despesa
                delta = current_check_date - expense.start_date
                # Se a diferença for multiplo de 7 (0, 7, 14, 21...)
                if delta.days >= 0 and delta.days % 7 == 0:
                    should_add = True

            # --- ADICIONA NA LISTA SE BATEU ---
            if should_add:
                projected_transactions.append({
                    "id": f"fixed_{expense.id}_{current_check_date}", # ID único falso pra frontend não bugar key
                    "real_id": expense.id,
                    "nameExpense": expense.name,
                    "value": expense.value,
                    "category": expense.category, # Ou pegar o nome da categoria com join
                    "typeExpense": expense.type_expense, # True/False
                    "date": current_check_date, # A data CALCULADA que caiu no periodo
                    "is_fixed": True
                })

            # Avança um dia no loop
            current_check_date += timedelta(days=1)

    return projected_transactions


#pegar as movimentações dentro de um periodo
def get_transactions_in_period(db: Session, user_id: int, start_date: date, end_date: date = None):
    if(end_date):
        stmt_get = (select(Expense.id, Expense.name, Expense.type_expense, Expense.value, Expense.date, Expense.category)
                    .where(Expense.user_id == user_id)
                    .where(Expense.date.between(start_date, end_date)))
    # else:
    #     stmt_get = (select(Expense.id, Expense.name, Expense.type_expense, Expense.value, Expense.date, Expense.category)
    #             .where(Expense.user_id == user_id)
    #             .where(Expense.date > start_date))
    stmt_get = (select(Expense.id, Expense.name, Expense.type_expense, Expense.value, Expense.date, Expense.category)
                    .where(Expense.user_id == user_id)
                    .where(Expense.date.between(start_date, end_date)))
    list_transactions = db.execute(stmt_get).all()

    formatted_list = []
    
    for item in list_transactions:
        formatted_list.append({
            'typeExpense': item.type_expense,
            'category': item.category,
            'nameExpense': item.name,
            'value': item.value,
            'id': item.id,
            'date': item.date,
            'is_fixed': False
        })
    
    list_fixed = process_fixed_expenses_in_period(db=db,
                                                  user_id=user_id, 
                                                  start_date=start_date,
                                                  end_date=end_date)
    full_extract = formatted_list + list_fixed
    full_extract.sort(key=lambda x: x['date'], reverse=True)

    return full_extract