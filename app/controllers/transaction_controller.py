from sqlalchemy import or_, select
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
            is_activated=True
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


def get_total_spent_on_the_date(db:Session, user_id: int):
    start_date = date(2026, 1, 1)
    end_date = date(2026, 1, 31)
    stmt_expenses = select(Expense.value).where(Expense.user_id == user_id).where(Expense.date.between(start_date, end_date)).where(Expense.is_activated == True).where(Expense.type_expense == False)
    list_expenses = db.execute(stmt_expenses).scalars().all()
    
    print(list_expenses)
    list_with_values_as_float = [float(v) for v in list_expenses]
    amount = 0

    for expense in list_with_values_as_float:
        amount += expense


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
    print(list_expenses_fixed)
    list2_with_values_as_float = [float(v) for v in list_expenses_fixed]
    print(list2_with_values_as_float)
    for expense_fixed in list2_with_values_as_float:
        amount += expense_fixed

    print(amount)

    return {
        'value': amount
    }


def get_total_received_on_the_date(db:Session, user_id: int):
    start_date = date(2026, 1, 1)
    end_date = date(2026, 1, 31)
    stmt_expenses = select(Expense.value).where(Expense.user_id == user_id).where(Expense.date.between(start_date, end_date)).where(Expense.is_activated == True).where(Expense.type_expense == True)
    list_expenses = db.execute(stmt_expenses).scalars().all()
    
    print(list_expenses)
    list_with_values_as_float = [float(v) for v in list_expenses]
    amount = 0

    for expense in list_with_values_as_float:
        amount += expense


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
    print(list_expenses_fixed)
    list2_with_values_as_float = [float(v) for v in list_expenses_fixed]
    print(list2_with_values_as_float)
    for expense_fixed in list2_with_values_as_float:
        amount += expense_fixed

    print(amount)

    return {
        'value': amount
    }


def get_monthly_balance_value(db: Session, user_id: int):
    total_expenses = get_total_spent_on_the_date(db=db,
                                                 user_id=user_id)
    total_received = get_total_received_on_the_date(db=db,
                                                    user_id=user_id)
    
    return {
        'value': total_received['value'] - total_expenses['value']
    }