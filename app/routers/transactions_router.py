from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user


router = APIRouter()

@router.post("/create")
def create_expense( current_user: dict = Depends(get_current_user)):
    print(f"O usuário {current_user['email']} está criando uma despesa.")
    pass