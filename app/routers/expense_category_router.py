from fastapi import APIRouter, Depends, HTTPException, Request, Response
from requests import Session
from app.controllers.expense_category_controller import get_categories_of_user_by_id
from app.core.auth import get_current_user
from app.core.database import get_db

router = APIRouter()


@router.get('/get-categories')
def get_categories_of_user(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        user_id = current_user['user_id']
        categories = get_categories_of_user_by_id(user_id, db)
        return categories
    except Exception as e:
        print(f"Error occurred while fetching categories: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")