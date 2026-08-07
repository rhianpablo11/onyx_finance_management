import calendar
from datetime import date, timedelta

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.controllers.transaction_controller import get_total_received_on_the_date, get_total_spent_on_the_date
from app.controllers.transaction_controller import get_total_received_on_the_date
from app.models.balance_forecast import Balance_forecast
from app.models.expense import Expense
from app.models.expense_category import Expense_category
from app.models.ia_insights import Ia_insights


def get_prophet_insights(user_id: int, db: Session):
    
    try:
        today = date.today()
        year = today.year
        month = today.month

        last_day_of_month = calendar.monthrange(year, month)[1]
        start_date = date(year, month, 1)
        end_date = date(year, month, last_day_of_month)

        meses_ptbr = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

        stmt = (select(Balance_forecast)
                .where(Balance_forecast.user_id == user_id,
                       Balance_forecast.target_date >= start_date,
                       Balance_forecast.target_date <= end_date)
                .order_by(Balance_forecast.target_date.asc()))

        results_founded = db.execute(stmt).scalars().all()

        insight_formated = []

        for row in results_founded:
            date_formated = f"{row.target_date.day:02d} {meses_ptbr[row.target_date.month]}"
            
            band_array = None
            if row.band_min is not None and row.band_max is not None:
                band_array = [round(float(row.band_min), 2), round((float(row.band_max)),2)]
            insight_formated.append({
                "date": date_formated,
                "real": row.real_balance,
                "prev": round(float(row.predicted_balance),2),
                "band": band_array
            })

        stmt = (select(Balance_forecast.predicted_balance)
                .where(Balance_forecast.user_id == user_id,
                       Balance_forecast.target_date == end_date))

        value_predicted_to_end_month = db.execute(stmt).scalar()
        

        return {
            "graphic_data": insight_formated,
            "value_predicted_to_end_month": round(float(value_predicted_to_end_month),2) if value_predicted_to_end_month is not None else None
        }

    except Exception as e:
        print(f"Error occurred while fetching Prophet insights: {e}")
        return []


def get_investigator_insights(user_id: int, db: Session):
    
    try:
        stmt = (select(Ia_insights)
                .where(Ia_insights.user_id == user_id, Ia_insights.type_insight == 'investigator')
                .order_by(Ia_insights.created_at.desc()))
        insight = db.execute(stmt).scalars().first()
        return insight

    except Exception as e:
        print(f"Error occurred while fetching Investigator insights: {e}")
        return []


def get_anomalie_insights(user_id: int, db: Session):
    try:
        stmt = (select(Ia_insights)
                .where(Ia_insights.user_id == user_id, Ia_insights.type_insight == 'anomalie')
                .order_by(Ia_insights.created_at.desc()))
        insight = db.execute(stmt).scalars().first()
        return insight

    except Exception as e:
        print(f"Error occurred while fetching Anomalie insights: {e}")
        return []


def add_new_insight_prophet(user_id: int, title: str, text_content: str, db: Session):
    try:
        new_insight = Ia_insights(
            user_id=user_id,
            type_insight='prophet',
            title=title,
            text_content=text_content
        )
        db.add(new_insight)
        db.commit()
        db.refresh(new_insight)
        return new_insight

    except Exception as e:
        print(f"Error occurred while adding new Prophet insight: {e}")
        db.rollback()
        return None
    

def add_new_insight_investigator(user_id: int, title: str, text_content: str, db: Session):
    try:
        new_insight = Ia_insights(
            user_id=user_id,
            type_insight='investigator',
            title=title,
            text_content=text_content
        )
        db.add(new_insight)
        db.commit()
        db.refresh(new_insight)
        return new_insight

    except Exception as e:
        print(f"Error occurred while adding new Investigator insight: {e}")
        db.rollback()
        return None


def mark_insight_as_read(insight_id: int, user_id: int, db: Session):
    try:
        insight = db.query(Ia_insights).filter(Ia_insights.id == insight_id, Ia_insights.user_id == user_id).first()
        if not insight:
            raise HTTPException(status_code=404, detail="Insight not found")
        
        insight.is_read = True
        db.commit()
        return {"message": "Insight marked as read"}
    except Exception as e:
        print(f"Error occurred while marking insight as read: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


def get_main_categorys(user_id: int, db: Session):
    try:
        ninety_days_ago = date.today() - timedelta(days=30)
        total_stmt = select(func.sum(Expense.value)).where(
            Expense.user_id == user_id,
            Expense.date >= ninety_days_ago,
            Expense.type_expense == False,
            Expense.is_activated == True
        )

        total_spent = db.execute(total_stmt).scalar() or 0.0 
        total_spent = float(total_spent)
        if total_spent == 0:
            return []


        
        
        stmt = (
            select(
                Expense_category.name.label('category_name'), 
                func.sum(Expense.value).label('category_total')
            )
            .join(Expense_category, Expense.category == Expense_category.id) 
            .where(
                Expense.user_id == user_id,
                Expense.date >= ninety_days_ago, 
                Expense.type_expense == False,    
                Expense.is_activated == True    
            )
            .group_by(Expense_category.name)      
            .order_by(func.sum(Expense.value).desc()) 
            .limit(7)
        )

        results = db.execute(stmt).all()
        print("Menos de 7 categorias encontradas.") 
        print(total_spent)
        print(results)
        if len(results) < 7:
            for row in range(3, len(results)):
                print(f"Categoria: {results[row].category_name}, Total: {results[row].category_total}")
                #total_spent -= float(results[row].category_total)

        print("Menos de 7 categorias encontradas.") 
        print(total_spent)
        top_categories = []
        sum_of_top_3_percentage = 0.0
        sum_of_top_3_amount = 0.0

        if(len(results) < 7 ):
            for i in range(3):
                print(f'valor de I {i}')
                cat_total = float(results[i].category_total)
                percentage = round((cat_total / total_spent) * 100, 0) 
                
                sum_of_top_3_percentage += percentage
                sum_of_top_3_amount += cat_total

                top_categories.append({
                    "name": results[i].category_name,
                    "amount": cat_total,
                    "percentage": percentage
                })

        else:
            for row in results:
                cat_total = float(row.category_total)
                percentage = round((cat_total / total_spent) * 100, 0) 
                
                sum_of_top_3_percentage += percentage
                sum_of_top_3_amount += cat_total

                top_categories.append({
                    "name": row.category_name,
                    "amount": cat_total,
                    "percentage": percentage
                })

        others_percentage = round(100.0 - sum_of_top_3_percentage, 1)
        if others_percentage > 0.1:
            others_amount = total_spent - sum_of_top_3_amount
            top_categories.append({
                "name": "Outros",
                "amount": round(others_amount, 2),
                "percentage": others_percentage
            })


        return top_categories

    except Exception as e:
        print(f"Error occurred while fetching main category insights: {e}")
        return []


def get_balance_of_last_months(user_id: int, db: Session):
    try:
        # por enquanto ainda n tem a tabela de saldos mensais, mas tambem...acho q nem usaria
        # tem q pegar aquelas funcoes de saldo de entrada e saldo de saida
        # e passar o periodo q deseja, se tiver o maximo q apresenta é 6 meses, mas pode ser menos
        # pq o usuario pode ter menos, ent...tem q se atentar a isso
        results = []
        today = date.today()

        months_pt_br = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        
        for _ in range(6):
            year = today.year
            month = today.month

            last_day_of_month = calendar.monthrange(year, month)[1]
            start_date = date(year, month, 1)
            end_date = date(year, month, last_day_of_month)

            amount_out = get_total_spent_on_the_date(db, user_id, start_date, end_date)
            amount_in = get_total_received_on_the_date(db, user_id, start_date, end_date)

            amount_out = amount_out.get('value', 0.0)
            amount_in = amount_in.get('value', 0.0)

            if(amount_out > 0.0 or amount_in > 0.0):
                results.append({
                    "month": months_pt_br[month],
                    "amount_in": amount_in,
                    "amount_out": amount_out
                })
            
            today = start_date - timedelta(days=1)

        results.reverse()

        
        return results

    except Exception as e:
        print(f"Error occurred while fetching balance insights: {e}")
        return []