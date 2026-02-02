from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from app.controllers.user_controller import get_balance_user
from app.core.auth import get_current_user
from app.controllers.transaction_controller import create_new_expense, get_all_expenses_in_date, get_balance_in_period, get_day_and_last_transactions, get_monthly_receives, get_total_received_on_the_date,get_total_spent_on_the_date, get_monthly_balance_value, get_transactions_in_period
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.controllers.expense_category_controller import get_expense_category_by_id
from app.controllers.charge_type_controller import get_charge_type_by_id
from app.schemas.expense_schema import Expense_response_base, Expense_create, Expense_response_extended
from app.services.sync_service import sync_user_finances

router = APIRouter()

@router.post("/create")
def create_expense(message:Expense_create, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"O usuário {current_user['user_id']} está criando uma despesa.")
    new_expense_created = create_new_expense(user_id=current_user['user_id'], text_typed=message.message, db=db)
    category_name = get_expense_category_by_id(id=new_expense_created['data'].category,
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
                'text_response': f'Foi criada uma nova transação com valor de R$ {new_expense_created['data'].value} ela ta na categoria {category_name}, e foi marcada como efetuada na data {new_expense_created['data'].date} e paga utilizando {new_expense_created['data'].payment_method}'
        }
    
    if(new_expense_created['type'] == 'fixed'):
        charge_type_name = get_charge_type_by_id(id=new_expense_created['data'].charge,
                                                 db=db)
        return {
                    'category': category_name,
                    'value': new_expense_created['data'].value,
                    'type_expense': new_expense_created['data'].type_expense,
                    'description': new_expense_created['data'].description,
                    'installments_count': new_expense_created['data'].installments_count,
                    'charge_type': charge_type_name,
                    'start_date': new_expense_created['data'].start_date,
                    'text_response': f'Foi criada uma nova transação com valor de R$ {new_expense_created['data'].value} ela ta na categoria {category_name}, e foi marcada como efetuada na data inicial de {new_expense_created['data'].start_date} e a quantidade de parcelas é de {new_expense_created['data'].installments_count}'
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


@router.get('/metrics-dashboard')
def get_metrics_for_dashboard(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    sync_user_finances(db, current_user['user_id'])
    
    data_return = {}
    data_return['month_balance'] = get_monthly_balance_value(db=db,
                                                             user_id=current_user['user_id'])['value']
    
    data_return['expenses_out'] = get_day_and_last_transactions(db=db,
                                                                user_id=current_user['user_id'])
    
    data_return['expenses_in_on_month'] = get_monthly_receives(db=db,
                                                               user_id=current_user['user_id'])

    data_return['balance_geral'] = get_balance_user(db=db, user_id=current_user['user_id'])
    return data_return    


@router.get('/extract')
def get_extract(current_user: dict = Depends(get_current_user),
                db: Session = Depends(get_db),
                start_date: Optional[date]=None,
                end_date: Optional[date]=None,
                period_days: Optional[int] = None):
    
    start_date_search = start_date
    end_date_search = end_date
    if( period_days):
        end_date_search = date.today()
        start_date_search = end_date_search - timedelta(days=period_days)

    if not start_date_search or not end_date_search:
        today = date.today()
        start_date = date(today.year, today.month, 1)
        end_date = today # ou ultimo dia do mes

    # pegar o valor gasto naquela data
    # get_total_spent_on_the_date -> retorna o valor gasto
    value_spent = get_total_spent_on_the_date(db=db,
                                              user_id=current_user['user_id'],
                                              start_date=start_date_search,
                                              end_date=end_date_search)

    # pegar o valor recebido naquela data
    # get_total_received_on_the_date -> retorna o valor recebido
    value_received = get_total_received_on_the_date(db=db,
                                              user_id=current_user['user_id'],
                                              start_date=start_date_search,
                                              end_date=end_date_search)

    # pegar o saldo naquela data
    #get_balance_in_period -> retorna o saldo do periodo
    balance_data_period = get_balance_in_period(db=db,
                                                user_id=current_user['user_id'],
                                                start_date=start_date_search,
                                                end_date=end_date_search)
    # pegar a lista de transações em um periodo
    # get_transactions_in_period -> retorna uma lista de transações
    list_transactions = get_transactions_in_period(db=db,
                                                    user_id=current_user['user_id'],
                                                    start_date=start_date_search,
                                                    end_date=end_date_search)
    
    data_return = {
        'balance_value_in_period': balance_data_period['value'],
        'transactions': list_transactions,
        'value_received': value_received['value'],
        'value_spent': value_spent['value']
    }
    return data_return