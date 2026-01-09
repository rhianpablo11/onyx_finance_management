from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user
from app.controllers.transaction_controller import create_new_expense, get_all_expenses_in_date,get_total_spent_on_the_date, get_monthly_balance_value
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.controllers.expense_category_controller import get_expense_category_by_id
from app.controllers.charge_type_controller import get_charge_type_by_id
from app.schemas.expense_schema import Expense_response_base, Expense_create, Expense_response_extended

router = APIRouter()

@router.post("/create", response_model=Expense_response_extended, response_model_include=Expense_response_base)
def create_expense(message:Expense_create, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"O usuário {current_user['user_id']} está criando uma despesa.")
    new_expense_created = create_new_expense(user_id=current_user['user_id'], text_typed=message.message, db=db)
    category_name = get_expense_category_by_id(id=id,
                                               user_id=current_user['user_id'],
                                               db=db)
    if(new_expense_created['type'] == 'simple'):
        return {
                'category': category_name,
                'value': new_expense_created['data'].value,
                'type_expense': new_expense_created['data'].type_expense,
                'description': new_expense_created['data'].description,
                'date': new_expense_created['data'].date,
                'payment_method': new_expense_created['data'].payment_method,
        }
    
    if(new_expense_created['type'] == 'fixed'):
        charge_type_name = get_charge_type_by_id(id=create_new_expense['data'].charge)
        return {
                    'category': category_name,
                    'value': new_expense_created['data'].value,
                    'type_expense': new_expense_created['data'].type_expense,
                    'description': new_expense_created['data'].description,
                    'date': new_expense_created['data'].date,
                    'payment_method': new_expense_created['data'].payment_method,
                    'installments_count': new_expense_created['data'].installments_count,
                    'charge_type': charge_type_name,
                    'start_date': new_expense_created['data'].start_date
            }
    

    


@router.get('/get-transactions/date')
def get_list_expenses_in_date(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_all_expenses_in_date(user_id=current_user['user_id'],
                                      db=db)


@router.get('/get-total-spent/date')
def get_total_spent_in_date(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_total_spent_on_the_date(user_id=current_user['user_id'],
                                       db=db)


@router.get('/mothly-balance/monthly')
def get_monthly_balance(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_monthly_balance_value(user_id=current_user['user_id'],
                                       db=db)