from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from app.core.auth import ACCESS_TOKEN_DURATION_TIME, create_access_token, get_current_user
from app.schemas.user_schema import UserCreate, UserResponse, UserResponseLogin
from app.controllers.user_controller import add_new_credential, create_user, authenticate_user, get_credential_used, get_options, get_options_biometric_auth, get_user_by_email, get_user_by_id, remove_current_challenge_of_user, save_current_chalenge, validate_signature, verify_registration_biometric, verify_user_exist
from app.core.database import get_db
from sqlalchemy.orm import Session
import json

router = APIRouter()

@router.post('/register', status_code=201)
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

@router.get('/verify-user', status_code=201)
def verify_user(db: Session = Depends(get_db),
                email: Optional[str] = None,
                telephone: Optional[str] = None):
    if(email == None):
        return {'message': 'not email in request'}
    if(telephone == None):
        return {'telephone': 'not telephone in request'}
    return verify_user_exist(email=email,
                             telephone=telephone,
                             db=db)


@router.get('/register/options-biometric', status_code=201)
def get_options_for_biometric(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:    
        user_now = get_user_by_id(db=db, user_id = current_user['user_id'])
        
        (options, options_json) = get_options(user_id_now=user_now.id,
                            user_name_now=user_now.name)
        

        save_current_chalenge(db=db,
                            user_id=current_user['user_id'],
                            chalenge=options.challenge)
        return json.loads(options_json)
    except:
        raise HTTPException(status_code=400, detail='erro ao pegar as opções')
    
    

@router.post('/register/register-biometric', status_code=201)
async def register_biometric(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user), request: Request = {}):
    body_requisition = await request.json()
    user_now = get_user_by_id(db=db, user_id = current_user['user_id'])
    if not user_now.current_chalenge:
        raise HTTPException(status_code=400, detail='nenhum desafio foi encontrado')

    print(user_now.current_chalenge)
    verification_return = verify_registration_biometric(body=body_requisition,
                                                        challenge_str=user_now.current_chalenge)
    print('ccccccccc')
    print(verification_return)
    add_new_credential(db=db,
                       user_id=current_user['user_id'],
                       verification=verification_return)
    print('dddddddd')
    remove_current_challenge_of_user(db=db,
                                     user_id=current_user['user_id'])
    print('eeeeeeeeee')
    return {'verified': True,
            'message': 'Biometria cadastrada com sucesso'}
    pass


@router.post('/login/options-biometric', status_code=201)
async def get_options_for_biometric_login(db: Session = Depends(get_db), request: Request = {}):
    body_requisition = await request.json()
    user_now = get_user_by_email(db=db, email=body_requisition['email'])
    if not user_now.credentials:
        raise HTTPException(status_code=400, detail='não ha biometria cadastrada')

    (options_return, options_return_json) = get_options_biometric_auth(user=user_now)
    save_current_chalenge(db=db,
                          user_id=user_now.id,
                          chalenge=options_return.challenge)
    return json.loads(options_return_json)


@router.post('/login/verify-biometric', status_code=201)
async def verify_biometric(db: Session = Depends(get_db), request: Request = {}):
    body_requisition = await request.json()
    email = body_requisition.get('email')
    credential = body_requisition.get('credential')

    user_now = get_user_by_email(db=db, email=email)
    if not user_now or not user_now.current_chalenge:
        raise HTTPException(status_code=400, detail='desafio invalido ou expirado')

    
    credential_id_used = credential.get('id')
    
    credential_founded = get_credential_used(user=user_now, credential_id_used=credential_id_used)
    
    verification_returned = validate_signature(credential_received=credential, user=user_now, credential_found=credential_founded)
    
    credential_founded.sign_count = verification_returned.new_sign_count

    remove_current_challenge_of_user(db=db, user_id=user_now.id)
    

    data_user = {'id': user_now.id}
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_DURATION_TIME)
    access_token = create_access_token(data=data_user, expires_delta=access_token_expires)

    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user_data': user_now
    }

