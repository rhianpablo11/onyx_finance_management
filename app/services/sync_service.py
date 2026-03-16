from datetime import date, timedelta
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.expense import Expense
from app.models.expenses_fixed import Expenses_fixed
from app.models.charge_type import Charge_type
from app.controllers.user_controller import update_balance 

def sync_user_finances(db: Session, user_id: int):
    today = date.today()
    updates_count = 0
    
    # 1. EFETIVAR COMPRAS SIMPLES DO FUTURO QUE VENCERAM HOJE (Ex: Videogame)
    stmt_pending = select(Expense).where(
        Expense.user_id == user_id,
        Expense.is_activated == False, 
        Expense.date <= today,
        Expense.fixed_expense_id == None
    )
    pending_simple_expenses = db.execute(stmt_pending).scalars().all()
    
    for exp in pending_simple_expenses:
        update_balance(db, user_id, float(exp.value), exp.type_expense)
        exp.is_activated = True
        updates_count += 1

    # 2. PROCESSAR DESPESAS RECORRENTES E PARCELADAS
    stmt_fixed = (select(Expenses_fixed, Charge_type.name.label('charge_name'))
            .join(Charge_type, Expenses_fixed.charge == Charge_type.id)
            .where(Expenses_fixed.user_id == user_id, Expenses_fixed.activated == True))
    
    fixed_expenses = db.execute(stmt_fixed).all()
    
    for fixed, charge_name in fixed_expenses:
        current_check_date = fixed.start_date
        
        limit_date = today
        if fixed.end_date and fixed.end_date < today:
            limit_date = fixed.end_date

        while current_check_date <= limit_date:
            should_charge = False
            charge_lower = charge_name.lower().strip() if charge_name else ""
            
            # O mesmo roteamento da API
            freq = 'mensal'
            if 'diari' in charge_lower or 'diári' in charge_lower:
                freq = 'diario'
            elif 'semanal' in charge_lower or 'semana' in charge_lower:
                freq = 'semanal'
            elif 'quinzenal' in charge_lower or 'quinzena' in charge_lower or '15 dias' in charge_lower:
                freq = 'quinzenal'
            elif 'anual' in charge_lower or 'ano' in charge_lower:
                freq = 'anual'
            
            # A mesma matemática exata
            if freq == 'diario':
                should_charge = True
            elif freq == 'semanal':
                delta = current_check_date - fixed.start_date
                if delta.days >= 0 and delta.days % 7 == 0:
                    should_charge = True
            elif freq == 'quinzenal':
                delta = current_check_date - fixed.start_date
                if delta.days >= 0 and delta.days % 15 == 0:
                    should_charge = True
            elif freq == 'anual':
                if current_check_date.month == fixed.payment_date.month:
                    target_day = fixed.payment_date.day
                    next_month = current_check_date.replace(day=28) + timedelta(days=4)
                    last_day_of_month = next_month - timedelta(days=next_month.day)
                    check_day = target_day if target_day <= last_day_of_month.day else last_day_of_month.day
                    if current_check_date.day == check_day:
                        should_charge = True
            else:
                target_day = fixed.payment_date.day
                next_month = current_check_date.replace(day=28) + timedelta(days=4)
                last_day_of_month = next_month - timedelta(days=next_month.day)
                check_day = target_day if target_day <= last_day_of_month.day else last_day_of_month.day
                if current_check_date.day == check_day:
                    should_charge = True

            # Lógica de salvar a parcela que faltava
            if should_charge:
                existing_expense = db.execute(
                    select(Expense).where(
                        Expense.user_id == user_id,
                        Expense.fixed_expense_id == fixed.id,
                        Expense.date == current_check_date
                    )
                ).first()

                if not existing_expense:
                    div = fixed.installments_count if fixed.installments_count and fixed.installments_count > 0 else 1
                    value_to_add = float(fixed.value) / div
                    
                    update_balance(db, user_id, value_to_add, fixed.type_expense)
                    
                    new_expense = Expense(
                        user_id=user_id,
                        category=fixed.category,
                        value=value_to_add,
                        type_expense=fixed.type_expense,
                        description=f"Recorrência: {fixed.name}",
                        date=current_check_date,
                        name=fixed.name,
                        is_activated=True,
                        payment_method=fixed.payment_method or "automatico",
                        fixed_expense_id=fixed.id 
                    )
                    db.add(new_expense)
                    updates_count += 1

            current_check_date += timedelta(days=1)
            
    if updates_count > 0:
        db.commit()