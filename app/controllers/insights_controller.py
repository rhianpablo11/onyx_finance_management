from datetime import date, timedelta

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.expense import Expense
from app.models.expense_category import Expense_category
from app.models.ia_insights import Ia_insights


def get_prophet_insights(user_id: int, db: Session):
    
    try:
        stmt = (select(Ia_insights)
                .where(Ia_insights.user_id == user_id, Ia_insights.type_insight == 'prophet')
                .order_by(Ia_insights.created_at.desc()))
        insight = db.execute(stmt).scalars().first()
        return insight

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

        total_stmt = select(func.sum(Expense.value)).where(
            Expense.user_id == user_id,
            Expense.date >= ninety_days_ago,
            Expense.type_expense == True,
            Expense.is_activated == True
        )

        total_spent = db.execute(total_stmt).scalar() or 0.0 
        total_spent = float(total_spent)
        if total_spent == 0:
            return []


        ninety_days_ago = date.today() - timedelta(days=90)
        
        stmt = (
            select(
                Expense_category.name.label('category_name'), 
                func.sum(Expense.value).label('total_spent')
            )
            .join(Expense_category, Expense.category_id == Expense_category.id) 
            .where(
                Expense.user_id == user_id,
                Expense.date >= ninety_days_ago, 
                Expense.type_expense == True,    
                Expense.is_activated == True    
            )
            .group_by(Expense_category.name)      
            .order_by(func.sum(Expense.value).desc()) 
            .limit(3) 
        )

        results = db.execute(stmt).all()
        
        top_categories = []
        sum_of_top_3_percentage = 0.0
        sum_of_top_3_amount = 0.0

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

