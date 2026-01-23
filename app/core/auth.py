from datetime import timedelta, datetime
from typing import Optional
from fastapi import Depends, HTTPException
from starlette import status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.security import SECRET_KEY_JWT


SECRET_KEY = SECRET_KEY_JWT
ALGORITHM = 'HS256'
ACCESS_TOKEN_DURATION_TIME = 300


def create_access_token(data:dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_DURATION_TIME)

    to_encode.update({'exp': expire})

    enconded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return enconded_jwt


oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/user/login')


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token=token, key=SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get('id')
        
        if user_id is None:
            raise credentials_exception
        
        return {'user_id': user_id}
    
    except JWTError:
        raise credentials_exception