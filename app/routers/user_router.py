from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user_schema import UserCreate, UserResponse, UserResponseLogin
from app.controllers.user_controller import create_user, authenticate_user
from app.core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

@router.post('/register', status_code=201, response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = create_user(user, db)
    
    return new_user


@router.post('/login', status_code=201, response_model=UserResponseLogin)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(
                            email=form_data.username,
                            password=form_data.password,
                            db=db)
    
    
    return user