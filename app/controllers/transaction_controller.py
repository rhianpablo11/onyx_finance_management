from sqlalchemy import desc, or_, select
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import date
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
    stmt_categories = select(Expense_category.name).where(Expense_category.user_id == user_id)
    categorys_of_user = db.execute(stmt_categories).scalars().all()
    

    # 2. Seleciona todos os nomes de tipos de cobrança
    stmt_charges = select(Charge_type.name)
    charge_types_existing = db.execute(stmt_charges).scalars().all()
    
    ia_response = analyze_transaction_text(text=text_typed, user_categories=categorys_of_user, charge_types=charge_types_existing)
    
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
        new_expense_fixed = Expenses_fixed(
            user_id=user_id,
            name=ia_response['name'],
            value=ia_response['amount'],
            start_date=ia_response['first_payment_date'],
            end_date=ia_response['last_payment_date'],
            charge=charge_id,
            category_id=category_id,
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

    stmt_get = (select(Expense.value, Expense.name, Expense.category, Expense.id)
                .where(Expense.user_id == user_id)
                .where(Expense.date.between(start_date, end_date))
                .where(Expense.type_expense == True))
    list_received = db.execute(stmt_get).all()


    stmt_get_fixed = (select(Expenses_fixed.value, Expenses_fixed.name, Expenses_fixed.category, Expenses_fixed.id)
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
            'id': item.id
        })

    for item in list_receiveds_fixed:
        formatted_list.append({
            'value': item.value,
            'nameExpense': item.name,
            'category' : item.category,
            'type': True,
            'id': item.id
        })

    return formatted_list


#pegar os proximos pagamentos a ser feitos
def get_next_payments(db: Session, user_id: int):
    pass


#pegar o saldo em um periodo especifico
def get_balance_in_period(db: Session, user_id: int):


    pass


#pegar as movimentações dentro de um periodo
def get_transactions_in_period():
    pass