from sqlalchemy import desc, func, or_, select, update
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import date, timedelta
from app.controllers.user_controller import update_balance
from app.models.expense import Expense
from app.models.expense_category import Expense_category
from app.models.expenses_fixed import Expenses_fixed
from app.models.user import User
from app.services.ai_processor import analyze_transaction_text
from app.controllers.expense_category_controller import expense_category_analysis, get_expense_category_by_id
from app.controllers.charge_type_controller import get_charge_type_id
from app.models.charge_type import Charge_type
from app.controllers.chat_logs_controller import create_new_chat_log
from app.utils.utils import get_month_range


def create_new_expense(user_id: int, text_typed: str, db: Session):
    print('cheguei aq viu')
    try:
        stmt_categories = select(Expense_category.name).where(Expense_category.user_id == user_id)
        categorys_of_user = db.execute(stmt_categories).scalars().all()

        # 2. Seleciona todos os nomes de tipos de cobrança
        stmt_charges = select(Charge_type.name)
        charge_types_existing = db.execute(stmt_charges).scalars().all()

        ia_response = analyze_transaction_text(text=text_typed, user_categories=categorys_of_user, charge_types=charge_types_existing)
        if(ia_response == None):
            raise HTTPException(status_code=400, detail='IA fora de operação')
        
        
        category_id = expense_category_analysis(categorys_of_user=categorys_of_user,
                                                    user_id=user_id,
                                                    db=db,
                                                    category_for_verification=ia_response['category'],
                                                    )

        create_new_chat_log(text_typed=text_typed,
                            db=db,
                            user_id=user_id,
                            ai_json_response=ia_response)

        if(ia_response['is_recurrent'] == False and ia_response['is_installment'] == False):
            #work with table of Expense

            update_balance(db=db,
                           user_id=user_id,
                           value=ia_response['amount'],
                           type=ia_response['type'])

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
                category=category_id,
                payment_date=ia_response['first_payment_date'],
                activated=True,
                type_expense=ia_response['type'],
                installments_count=ia_response['installments_count']
            )

            db.add(new_expense_fixed)
            db.commit()
            db.refresh(new_expense_fixed)

            today = date.today()
            # Converte string pra date se necessário, ou usa direto se já for date
            first_payment = date.fromisoformat(str(ia_response['first_payment_date'])) 

            if first_payment == today:
                print(f"Despesa fixa começa hoje! Realizando débito imediato...")
                
                # 1. Atualiza Saldo
                value_to_add = ia_response['amount'] / ia_response['installments_count']
                update_balance(db=db, user_id=user_id, value=value_to_add, type=ia_response['type'])

                # 2. Cria o registro na tabela Expense (Fato) vinculando o ID da Fixa
                new_expense_realized = Expense(
                    user_id=user_id,
                    category=category_id,
                    value=value_to_add,
                    type_expense=ia_response['type'],
                    description=f"Recorrência (Inicial): {ia_response['description']}",
                    date=today,
                    payment_method=ia_response['payment_method'],
                    is_activated=True,
                    name=ia_response['name'],
                    fixed_expense_id=new_expense_fixed.id  # <--- VÍNCULO IMPORTANTE
                )
                db.add(new_expense_realized)
                db.commit()



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

# returns the total spent on interval of dates, the sum between installments and expenses
def get_total_spent_on_the_date(db: Session, user_id: int, start_date: date, end_date: date):
    # 1. Soma o que está na tabela Expense (Realizado)
    # Isso ja busca as transações que foram provenientes de transações fixas e foram cobradas a parcela
    try:
        stmt_realized = (select(func.sum(Expense.value))
                        .where(Expense.user_id == user_id)
                        .where(Expense.date.between(start_date, end_date))
                        .where(Expense.is_activated == True)
                        .where(Expense.type_expense == False)) # False = Gasto
        
        db_result = db.execute(stmt_realized).scalar()
        total_realized = float(db_result) if db_result else 0.0

        
        # # 2. Soma o Projetado (Futuro ou não sincronizado)
        # # Usamos a função que acabamos de criar, que já remove os duplicados!
        # projected_list = process_fixed_expenses_in_period(db, user_id, start_date, end_date)
        
        # # Filtra só o que é gasto (typeExpense == False) na lista projetada e soma
        # total_projected = sum([item['value'] for item in projected_list if item['typeExpense'] == False])


        total_projected = 0
        return {
            'value': total_realized + float(total_projected)
        }
    except:
        raise HTTPException(status_code=400, detail='error in request info in database')


# returns the total received on interval of dates, the sum between installments and expenses
def get_total_received_on_the_date(db:Session, user_id: int, start_date: date, end_date: date):
    try:
        stmt_expenses = (select(Expense.value)
                            .where(Expense.user_id == user_id)
                            .where(Expense.date.between(start_date, end_date))
                            .where(Expense.is_activated == True)
                            .where(Expense.type_expense == True))
        list_expenses = db.execute(stmt_expenses).scalars().all()

        amount = sum([float(v) for v in list_expenses])


        #verify necessity of this
        # stmt_expenses_fixed = (
        #     select(Expenses_fixed.value)
        #     .where(
        #         Expenses_fixed.user_id == user_id,
        #         Expenses_fixed.activated == True,
        #         # Regra 1: Começou antes do fim do mês pesquisado
        #         Expenses_fixed.start_date <= end_date,
        #         # Regra 2: Não terminou, ou terminou depois que o mês começou
        #         or_(
        #             Expenses_fixed.end_date == None,
        #             Expenses_fixed.end_date >= start_date
        #         )
        #     )
        #     .where(Expenses_fixed.type_expense == True)
        # )

        # list_expenses_fixed = db.execute(stmt_expenses_fixed).scalars().all()

        # amount += sum([float(v) for v in list_expenses_fixed])
        return {
            'value': amount
        }
    except:
        raise HTTPException(status_code=400, detail='error in request data in database')


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
    
    stmt_get = (select(Expense.id, Expense.name, Expense.type_expense, Expense.value, Expense.date, Expense.category, Expense.payment_method, Expense.description)
                .where(Expense.user_id == user_id)
                .where(Expense.date == today)
                .where(Expense.type_expense == False)
                .order_by(desc(Expense.id)))
    list_expenses = db.execute(stmt_get).all()


    stmt_get_fixed = (select(Expenses_fixed.value, Expenses_fixed.name, Expenses_fixed.category, Expenses_fixed.id, Expenses_fixed.type_expense, Expenses_fixed.start_date, Expenses_fixed.payment_method, Expenses_fixed.description)
                      .where(Expenses_fixed.user_id == user_id)
                      .where(Expenses_fixed.start_date == today)
                      .where(Expenses_fixed.type_expense == False)
                      .order_by(desc(Expenses_fixed.id)))
    list_expenses_fixed = db.execute(stmt_get_fixed).all()
    
    formatted_list = []
    for item in list_expenses:
        nameCategory = get_expense_category_by_id(id=item.category,
                                                  user_id=user_id,
                                                  db=db)
        formatted_list.append({
            "nameExpense": item.name,
            "value": item.value,
            "category": nameCategory,
            "id": item.id,
            "type": False,
            "description": item.description,
            "paymentMethod": item.payment_method,
            "typeExpense": item.type_expense,
            "date": item.date
        })

    for item in list_expenses_fixed:
        nameCategory = get_expense_category_by_id(id=item.category,
                                                  user_id=user_id,
                                                  db=db)
        formatted_list.append({
            "nameExpense": item.name,
            "value": item.value,
            "category": nameCategory,
            "id": item.id,
            "type": False,
            "description": item.description,
            "paymentMethod": item.payment_method,
            "typeExpense": item.type_expense,
            "date": item.date
        })

    return formatted_list
    


#pegar as entradas/recebimentos do mes
def get_monthly_receives(db: Session, user_id: int):
    today = date.today()
    target_month = today.month
    target_year = today.year
    start_date, end_date = get_month_range(target_month, target_year)

    stmt_get = (select(Expense.id, Expense.name, Expense.type_expense, Expense.value, Expense.date, Expense.category, Expense.payment_method, Expense.description)
                .where(Expense.user_id == user_id)
                .where(Expense.date.between(start_date, end_date))
                .where(Expense.type_expense == True))
    list_received = db.execute(stmt_get).all()


    stmt_get_fixed = (select(Expenses_fixed.value, Expenses_fixed.name, Expenses_fixed.category, Expenses_fixed.id, Expenses_fixed.type_expense, Expenses_fixed.start_date, Expenses_fixed.payment_method, Expenses_fixed.description)
                      .where(Expenses_fixed.user_id == user_id)
                      .where(Expense.date.between(start_date, end_date))
                      .where(Expenses_fixed.type_expense == True))
    list_receiveds_fixed = db.execute(stmt_get_fixed).all()
    
    formatted_list = []

    for item in list_received:
        nameCategory = get_expense_category_by_id(id=item.category,
                                                  user_id=user_id,
                                                  db=db)
        formatted_list.append({
            "nameExpense": item.name,
            "value": item.value,
            "category": nameCategory,
            "id": item.id,
            "type": False,
            "description": item.description,
            "paymentMethod": item.payment_method,
            "typeExpense": item.type_expense,
            "date": item.date
        })

    for item in list_receiveds_fixed:
        nameCategory = get_expense_category_by_id(id=item.category,
                                                  user_id=user_id,
                                                  db=db)
        formatted_list.append({
            "nameExpense": item.name,
            "value": item.value,
            "category": nameCategory,
            "id": item.id,
            "type": False,
            "description": item.description,
            "paymentMethod": item.payment_method,
            "typeExpense": item.type_expense,
            "date": item.date
        })

    return formatted_list


#pegar os proximos pagamentos a ser feitos
def get_next_payments(db: Session, user_id: int):
    #pegar as depesas fixas que estão para proxima data
    today = date.today()
    stmt = (select(Expenses_fixed.value, Expenses_fixed.name, Expenses_fixed.category, Expenses_fixed.id, Expenses_fixed.type_expense, Expenses_fixed.start_date, Expenses_fixed.payment_method, Expenses_fixed.description)
            .where(Expenses_fixed.user_id == user_id)
            .where(Expenses_fixed.start_date > today))
    
    list_next_payments = db.execute(stmt).all()
    list_formatted = []


    for item in list_next_payments:
        nameCategory = get_expense_category_by_id(id=item.category,
                                                  user_id=user_id,
                                                  db=db)
        list_formatted.append({
            "nameExpense": item.name,
            "value": item.value,
            "category": nameCategory,
            "id": item.id,
            "type": False,
            "description": item.description,
            "paymentMethod": item.payment_method,
            "typeExpense": item.type_expense,
            "date": item.date
        })

    return list_formatted



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

    # 2. BUSCA INTELIGENTE: Pega os IDs das fixas que JÁ foram pagas neste período
    # Isso evita ir no banco dentro do loop (Performance)
    stmt_paid = (select(Expense.fixed_expense_id, Expense.date)
                 .where(Expense.user_id == user_id)
                 .where(Expense.date.between(start_date, end_date))
                 .where(Expense.fixed_expense_id != None))
    
    # Cria um conjunto de assinaturas "ID_DA_FIXA + DATA" para checagem rápida
    # Ex: {'15_2026-02-15', '18_2026-02-10'}
    paid_map = {f"{row.fixed_expense_id}_{row.date}" for row in db.execute(stmt_paid).all()}
    
    projected_transactions = []

    for expense, charge_name in results:
        current_check_date = start_date
        
        while current_check_date <= end_date:
            should_add = False
            
            # --- Lógica de Data (Mensal) ---
            if charge_name.lower() == 'mensal':
                try:
                    # Ajuste fino para datas como dia 31
                    target_day = expense.payment_date.day
                    last_day_of_month = (date(current_check_date.year, current_check_date.month, 1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                    
                    check_day = target_day if target_day <= last_day_of_month.day else last_day_of_month.day
                    
                    if current_check_date.day == check_day:
                        should_add = True
                except ValueError:
                    pass

            # --- Lógica Semanal, etc... ---
            elif charge_name.lower() == 'semanal':
                 delta = current_check_date - expense.start_date
                 if delta.days >= 0 and delta.days % 7 == 0:
                    should_add = True

            if should_add:
                # 3. VERIFICAÇÃO DE DUPLICIDADE
                # Se já existe um pagamento registrado para essa fixa nesta data, NÃO PROJETA
                key = f"{expense.id}_{current_check_date}"
                
                if key not in paid_map:
                    projected_transactions.append({
                        "id": f"fixed_{expense.id}_{current_check_date}", 
                        "nameExpense": expense.name,
                        "value": expense.value,
                        "category": expense.category, 
                        "typeExpense": expense.type_expense,
                        "date": current_check_date,
                        "is_fixed": True
                    })

            current_check_date += timedelta(days=1)

    return projected_transactions


#pegar as movimentações dentro de um periodo
def get_transactions_in_period(db: Session, user_id: int, start_date: date, end_date: date = None):
    if(end_date):
        stmt_get = (select(Expense.id, Expense.name, Expense.type_expense, Expense.value, Expense.date, Expense.category, Expense.payment_method, Expense.description)
                    .where(Expense.user_id == user_id)
                    .where(Expense.date.between(start_date, end_date)))
    # else:
    #     stmt_get = (select(Expense.id, Expense.name, Expense.type_expense, Expense.value, Expense.date, Expense.category)
    #             .where(Expense.user_id == user_id)
    #             .where(Expense.date > start_date))
    stmt_get = (select(Expense.id, Expense.name, Expense.type_expense, Expense.value, Expense.date, Expense.category, Expense.payment_method, Expense.description)
                    .where(Expense.user_id == user_id)
                    .where(Expense.date.between(start_date, end_date)))
    list_transactions = db.execute(stmt_get).all()

    formatted_list = []
    
    for item in list_transactions:
        nameCategory = get_expense_category_by_id(id=item.category,
                                                  user_id=user_id,
                                                  db=db)
        print(nameCategory)
        print(item.category)
        print(user_id)
        formatted_list.append({
            'typeExpense': item.type_expense,
            'category': nameCategory,
            'nameExpense': item.name,
            'value': item.value,
            'id': item.id,
            'date': item.date,
            'is_fixed': False,
            'paymentMethod': item.payment_method,
            'description': item.description
        })
    
    # list_fixed = process_fixed_expenses_in_period(db=db,
    #                                               user_id=user_id, 
    #                                               start_date=start_date,
    #                                               end_date=end_date)
    #full_extract = formatted_list + list_fixed
    full_extract = formatted_list
    full_extract.sort(key=lambda x: x['date'], reverse=True)

    return full_extract



