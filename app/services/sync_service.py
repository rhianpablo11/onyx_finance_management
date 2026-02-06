from datetime import date, timedelta
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from app.models.expense import Expense
from app.models.expenses_fixed import Expenses_fixed
from app.models.charge_type import Charge_type
from app.controllers.user_controller import update_balance 

def sync_user_finances(db: Session, user_id: int):
    today = date.today()
    
    # Busca fixas ativas + Nome do tipo de cobrança (Mensal, etc)
    stmt = (select(Expenses_fixed, Charge_type.name.label('charge_name'))
            .join(Charge_type, Expenses_fixed.charge == Charge_type.id)
            .where(Expenses_fixed.user_id == user_id, Expenses_fixed.activated == True))
    
    fixed_expenses = db.execute(stmt).all()
    updates_count = 0
    
    for fixed, charge_name in fixed_expenses:
        current_check_date = fixed.start_date
        
        limit_date = today
        if fixed.end_date and fixed.end_date < today:
            limit_date = fixed.end_date

        while current_check_date <= limit_date:
            should_charge = False
            
            # --- Lógica de Data (Mensal) ---
            if charge_name.lower() == 'mensal':
                try:
                    target_day = fixed.payment_date.day
                    # Lógica para último dia do mês
                    next_month = current_check_date.replace(day=28) + timedelta(days=4)
                    last_day_of_month = next_month - timedelta(days=next_month.day)
                    
                    check_day = target_day if target_day <= last_day_of_month.day else last_day_of_month.day
                    
                    if current_check_date.day == check_day:
                        should_charge = True
                except ValueError:
                    pass
            
            # --- Lógica Semanal ---
            elif charge_name.lower() == 'semanal':
                 delta = current_check_date - fixed.start_date
                 if delta.days >= 0 and delta.days % 7 == 0:
                    should_charge = True
            
            if should_charge:
                # VERIFICA SE JÁ FOI PAGO
                # A chave agora é verificar se existe alguma Expense com esse fixed_expense_id nessa data
                existing_expense = db.execute(
                    select(Expense).where(
                        Expense.user_id == user_id,
                        Expense.fixed_expense_id == fixed.id, # Busca pelo vínculo!
                        Expense.date == current_check_date
                    )
                ).first()

                if not existing_expense:
                    
                    # tem erro nessa parte dq
                    value_to_add = fixed.value / fixed.installments_count
                    # 1. Atualiza Saldo
                    update_balance(db, user_id, float(value_to_add), fixed.type_expense)
                    # 2. Cria registro no Extrato COM O VÍNCULO
                    new_expense = Expense(
                        user_id=user_id,
                        category=fixed.category, # Ajuste conforme seu model (category ou category_id)
                        value=value_to_add,
                        type_expense=fixed.type_expense,
                        description=f"Recorrência Auto: {fixed.name}",
                        date=current_check_date,
                        name=fixed.name,
                        is_activated=True,
                        payment_method="automatico",
                        fixed_expense_id=fixed.id # <--- ISSO EVITA A DUPLICIDADE NA PROJEÇÃO
                    )
                    
                    db.add(new_expense)
                    updates_count += 1

            current_check_date += timedelta(days=1)
            
    if updates_count > 0:
        db.commit()
        