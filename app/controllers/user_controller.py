from fastapi import HTTPException, status
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
        subscriber=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print('AAAAAAAAAAAAAA')
    print(new_user.__str__)
    return new_user