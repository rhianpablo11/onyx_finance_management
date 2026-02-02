from fastapi import HTTPException, status
from sqlalchemy import select, update
from app.core.auth import create_access_token, ACCESS_TOKEN_DURATION_TIME
from datetime import timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import compare_password, hash_password
from app.schemas.user_schema import UserCreate

def authenticate_user(email:str, password: str ,db: Session):
    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise HTTPException(status_code=400, detail="Email incorreto")
    
    if not compare_password(password, user.password):
        raise HTTPException(status_code=400, detail="Senha incorreta")

    
    data_user = {'id': user.id}
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_DURATION_TIME)
    access_token = create_access_token(data=data_user, expires_delta=access_token_expires)

    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user_data': user
    }


def create_user(user: UserCreate, db: Session):
    verify_email = db.query(User).filter(User.email == user.email).first()
    if verify_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este email já está registrado"
        )
    
    verify_telephone = db.query(User).filter(User.telephone == user.telephone).first()
    if verify_telephone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este telefone já está registrado"
        )
    
    new_user = User(
        name=user.name,
        password=hash_password(user.password),
        email=user.email,
        telephone=user.telephone,
        subscriber=False,
        otp_code = None,
        second_factor_auth = False
    )
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        data_user = {'id': new_user.id}
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_DURATION_TIME)
        access_token = create_access_token(data=data_user, expires_delta=access_token_expires)
    except:
        raise HTTPException(status_code=400, detail='error in database')

    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user_data': new_user
    }


def verify_user_exist(db: Session, email: str, telephone: str):
    try:
        stmt = (select(User.id)
                .where(User.email == email))
        
        list_user = db.execute(stmt).all()

        stmt = (select(User.id)
                .where(User.telephone == telephone))
        
        list_user2 = db.execute(stmt).all()
    except:
        raise HTTPException(status_code=400, detail='error in database')
    
    if(len(list_user) > 0):
        raise HTTPException(status_code=400, detail='Email already in database')
    
    if(len(list_user2) > 0):
        raise HTTPException(status_code=400, detail='telephone alredy in database')
    
    return {'message': 'user not in database'}


def get_balance_user(db: Session, user_id: int):
    try:
        stmt = (select(User.balance)
                .where(User.id == user_id))
        balance_user = db.execute(stmt).scalars().first()
    except:
        raise HTTPException(status_code=400, detail='error in database')
    return balance_user


def update_balance(db: Session, user_id: int, value: float, type: bool):
    try:
        now_balance = float(get_balance_user(db=db, user_id=user_id))
        new_value = 0
        
        if(type):
            new_value = now_balance + value
        else:
            new_value = now_balance - value

        stmt = (update(User)
                .where(User.id == user_id)
                .values(balance=new_value))
        result = db.execute(stmt)
        db.commit()
    except:
        raise HTTPException(status_code=400, detail='error in database')
    if result.rowcount == 0:
        raise HTTPException(status_code=400, detail='error in update balance')