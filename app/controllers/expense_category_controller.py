from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.expense_category import Expense_category
from app.services.ai_processor import analyze_transaction_text


# verify if categorys conected with user exists, if not new category is created
def expense_category_analysis(categorys_of_user, user_id: int, db: Session, category_for_verification: str):
    if(categorys_of_user == None):
        new_category = Expense_category(
            user_id=user_id,
            name=category_for_verification
        )
        db.add(new_category)
        db.commit()
        db.refresh(new_category)
        return new_category.id
    elif(category_for_verification not in categorys_of_user):
        new_category = Expense_category(
            user_id=user_id,
            name=category_for_verification
        )
        db.add(new_category)
        db.commit()
        db.refresh(new_category)
        return new_category.id
    category_id = db.query(Expense_category.id).filter(Expense_category.name == category_for_verification).filter(Expense_category.user_id == user_id).first()[0]

    return category_id


def get_expense_category_by_id(id: int, user_id: int, db: Session):
    stmt = select(Expense_category.name).where(Expense_category.user_id == user_id).where(Expense_category.id == id)
    expense_name = db.execute(stmt).scalars().first()
    #colocar verificação caso n tenha nenhuma categoria
    print(expense_name)
    return expense_name