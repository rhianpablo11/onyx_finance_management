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

            expense_date = date.fromisoformat(str(ia_response['first_payment_date']))
            today = date.today()
            
            # Se a data for no futuro, nasce desativado (não mexe no saldo agora)
            is_active = True
            if expense_date > today:
                is_active = False 

            new_expense = Expense(
                user_id=user_id,
                category=category_id,
                value=ia_response['amount'],
                type_expense=ia_response['type'],
                description=ia_response['description'],
                date=expense_date,
                payment_method=ia_response['payment_method'],
                is_activated=is_active,
                name=ia_response['name']
            )
            db.add(new_expense)
            
            # SÓ TIRA DO SALDO SE O DIA JÁ CHEGOU
            if is_active:
                update_balance(db=db, user_id=user_id, value=ia_response['amount'], type=ia_response['type'])
            
            db.commit()
            db.refresh(new_expense)
            return {'type': 'simple', 'data': new_expense}
        else:
            #work with table of Expense_fixed
            charge_id = get_charge_type_id(ia_response['type_of_installment'], charge_types_existing, db)
            
            # --- VACINA 1: NETFLIX INFINITA ---
            end_date_val = ia_response.get('last_payment_date')
            # Se for assinatura recorrente (mas não parcelado), forçamos o end_date para NULO (infinito)
            if ia_response.get('is_recurrent') and not ia_response.get('is_installment'):
                end_date_val = None

            new_expense_fixed = Expenses_fixed(
                user_id=user_id,
                name=ia_response['name'],
                value=ia_response['amount'],
                start_date=ia_response['first_payment_date'],
                end_date=end_date_val, # Variável tratada
                charge=charge_id,
                category=category_id,
                payment_date=ia_response['first_payment_date'],
                activated=True,
                type_expense=ia_response['type'],
                installments_count=ia_response['installments_count'],
                description=ia_response['description']
            )

            db.add(new_expense_fixed)
            db.commit()
            db.refresh(new_expense_fixed)

            today = date.today()
            # Converte string pra date se necessário, ou usa direto se já for date
            first_payment = date.fromisoformat(str(ia_response['first_payment_date'])) 

            """
            logica:
                1. verificar quantidade de parcelas
                2. criar a mesma quantidade de parcelas em despesas normal
                    2.1 vai ficar cada despesa normal com o valor da parcela e datas separadas
                    2.2 cada parcela vai ficar indexada a despesa fixa
                3. o delete da despesa terá 2 opções:
                    3.1 deletar toda a despesa fixa
                    3.2 deletar a parcela atual e as proximas
            """


            if first_payment <= today:
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
            "date": item.start_date
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
                      .where(Expenses_fixed.start_date.between(start_date, end_date))
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
    today = date.today()
    # Aumentado para 45 dias para NUNCA perder a parcela do mês que vem
    end_date_search = today + timedelta(days=45) 
    
    projected_list = process_fixed_expenses_in_period(
        db=db, 
        user_id=user_id, 
        start_date=today, 
        end_date=end_date_search
    )
    
    # Ordena da data mais próxima para a mais distante e devolve 5
    projected_list.sort(key=lambda x: x['date'])
    return projected_list[:5]



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
    stmt = (select(Expenses_fixed, Charge_type.name.label('charge_name'))
            .join(Charge_type, Expenses_fixed.charge == Charge_type.id)
            .where(Expenses_fixed.user_id == user_id)
            .where(Expenses_fixed.activated == True)
            .where(Expenses_fixed.start_date <= end_date) 
            .where(or_(Expenses_fixed.end_date == None, Expenses_fixed.end_date >= start_date)))
    
    results = db.execute(stmt).all() 

    stmt_paid = (select(Expense.fixed_expense_id, Expense.date)
                 .where(Expense.user_id == user_id)
                 .where(Expense.date.between(start_date, end_date))
                 .where(Expense.fixed_expense_id != None))
    paid_map = {f"{row.fixed_expense_id}_{row.date}" for row in db.execute(stmt_paid).all()}
    
    projected_transactions = []

    for expense, charge_name in results:
        current_check_date = max(start_date, expense.start_date)
        actual_end_date = end_date
        if expense.end_date and expense.end_date < end_date:
            actual_end_date = expense.end_date
            
        while current_check_date <= actual_end_date:
            should_add = False
            charge_lower = charge_name.lower().strip() if charge_name else ""
            
            # =======================================================
            # 🧠 ROTEAMENTO INTELIGENTE DE FREQUÊNCIA (Filtro Anti-IA)
            # =======================================================
            freq = 'mensal' # Padrão blindado
            if 'diari' in charge_lower or 'diári' in charge_lower:
                freq = 'diario'
            elif 'semanal' in charge_lower or 'semana' in charge_lower:
                freq = 'semanal'
            elif 'quinzenal' in charge_lower or 'quinzena' in charge_lower or '15 dias' in charge_lower:
                freq = 'quinzenal'
            elif 'anual' in charge_lower or 'ano' in charge_lower:
                freq = 'anual'

            # =======================================================
            # 🧮 MATEMÁTICA DO TEMPO (Cálculo Exato)
            # =======================================================
            if freq == 'diario':
                # Cobra todo santo dia
                should_add = True
                
            elif freq == 'semanal':
                # A cada 7 dias exatos a partir da data de início
                delta = current_check_date - expense.start_date
                if delta.days >= 0 and delta.days % 7 == 0:
                    should_add = True
                    
            elif freq == 'quinzenal':
                # A cada 15 dias exatos a partir da data de início
                delta = current_check_date - expense.start_date
                if delta.days >= 0 and delta.days % 15 == 0:
                    should_add = True
                    
            elif freq == 'anual':
                # Mesmo dia, no mesmo mês (Ex: IPVA, Anuidade do Cartão)
                if current_check_date.month == expense.payment_date.month:
                    target_day = expense.payment_date.day
                    next_month = current_check_date.replace(day=28) + timedelta(days=4)
                    last_day_of_month = next_month - timedelta(days=next_month.day)
                    check_day = target_day if target_day <= last_day_of_month.day else last_day_of_month.day
                    if current_check_date.day == check_day:
                        should_add = True
                        
            else: # freq == 'mensal'
                # Mesmo dia, todo mês (Proteção contra mês de 28/30/31 dias)
                target_day = expense.payment_date.day
                next_month = current_check_date.replace(day=28) + timedelta(days=4)
                last_day_of_month = next_month - timedelta(days=next_month.day)
                check_day = target_day if target_day <= last_day_of_month.day else last_day_of_month.day
                if current_check_date.day == check_day:
                    should_add = True

            # =======================================================
            # SALVANDO A PROJEÇÃO NA LISTA
            # =======================================================
            if should_add:
                key = f"{expense.id}_{current_check_date}"
                if key not in paid_map:
                    cat_name = get_expense_category_by_id(id=expense.category, user_id=user_id, db=db)
                    div = expense.installments_count if expense.installments_count and expense.installments_count > 0 else 1
                    parcel_value = float(expense.value) / div
                    desc = expense.description if expense.description else ""

                    projected_transactions.append({
                        "id": f"fixed_{expense.id}_{current_check_date}", 
                        "nameExpense": expense.name,
                        "value": parcel_value,
                        "category": cat_name, 
                        "typeExpense": expense.type_expense,
                        "date": current_check_date,
                        "is_fixed": True,
                        "paymentMethod": expense.payment_method,
                        "description": f"Agendado: {desc}" 
                    })

            current_check_date += timedelta(days=1)

    return projected_transactions


#pegar as movimentações dentro de um periodo
def get_transactions_in_period(db: Session, user_id: int, start_date: date, end_date: date = None):
    if not end_date:
        end_date = date.today()
        
    stmt_get = (select(Expense.id, Expense.name, Expense.type_expense, Expense.value, Expense.date, Expense.category, Expense.payment_method, Expense.description)
                    .where(Expense.user_id == user_id)
                    .where(Expense.date.between(start_date, end_date)))
    list_transactions = db.execute(stmt_get).all()
    
    formatted_list = []
    for item in list_transactions:
        nameCategory = get_expense_category_by_id(id=item.category, user_id=user_id, db=db)
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
    
    # LIGA A ENGENHARIA DE PROJEÇÃO NO EXTRATO AQUI!
    list_fixed_projected = process_fixed_expenses_in_period(
        db=db,
        user_id=user_id, 
        start_date=start_date,
        end_date=end_date
    )
    
    full_extract = formatted_list + list_fixed_projected
    full_extract.sort(key=lambda x: x['date'], reverse=True)

    return full_extract



