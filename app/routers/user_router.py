import base64
from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from app.controllers.user_temp_controller import associate_email_with_code, verify_code
from app.core.auth import ACCESS_TOKEN_DURATION_TIME, create_access_token, get_current_user, verify_token
from app.schemas.user_schema import UserCreate, UserResponse, UserResponseLogin
from app.controllers.user_controller import add_new_credential, create_user, authenticate_user, delete_biometric_of_device_selected, delete_code_of_recovery_password, device_has_biometric_registered, get_challenge, get_credential_by_cred_id, get_credential_used, get_generic_options_biometric, get_options, get_options_biometric_auth, get_user_by_credential_id, get_user_by_email, get_user_by_id, remove_current_challenge_of_user, save_code_of_recovery_password, save_current_chalenge, send_email_recovery_password, update_password, validate_signature, verify_code_of_recovery_password, verify_registration_biometric, verify_user_exist
from app.core.database import get_db
from sqlalchemy.orm import Session
import json

router = APIRouter()

@router.post('/register', status_code=201)
def register_user(user: UserCreate, db: Session = Depends(get_db), response: Response = {}):
    new_user = create_user(user, db, response)
    
    return new_user


@router.post('/login', status_code=201, response_model=UserResponseLogin)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db), response: Response = {}):
    user = authenticate_user(
                            email=form_data.username,
                            password=form_data.password,
                            db=db, 
                            response=response)
    
    return user


@router.post('/has-biometric', status_code=201)
async def verify_biometric_device_exists(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user), request: Request = {}):
    body_request = await request.json()
    biometric_registered_in_device = device_has_biometric_registered(db=db,
                                                                     user_id=current_user['user_id'],
                                                                     device_id_for_verify=body_request['idDevice'])
    return {'exists_biometric':biometric_registered_in_device}


@router.get('/verify-user', status_code=201)
def verify_user(db: Session = Depends(get_db),
                email: Optional[str] = None,
                telephone: Optional[str] = None,
                name: Optional[str] = None):
    if(email == None):
        return {'message': 'not email in request'}
    if(telephone == None):
        return {'telephone': 'not telephone in request'}
    return verify_user_exist(email=email,
                             telephone=telephone,
                             db=db,
                             name=name)


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
    verification_return = verify_registration_biometric(body=body_requisition['dataBiometric'],
                                                        challenge_str=user_now.current_chalenge)

    add_new_credential(db=db,
                       user_id=current_user['user_id'],
                       verification=verification_return,
                       device_id=body_requisition['idDevice'])

    remove_current_challenge_of_user(db=db,
                                     user_id=current_user['user_id'])

    return {'verified': True,
            'message': 'Biometria cadastrada com sucesso'}
    pass


@router.post('/login/options-biometric', status_code=201)
async def get_options_for_biometric_login(db: Session = Depends(get_db), request: Request = {}):
    body_requisition = await request.json()
    id = body_requisition.get('id')
    user_now = get_user_by_id(db=db, user_id=id)
    if not user_now.credentials:
        raise HTTPException(status_code=400, detail='não ha biometria cadastrada')

    (options_return, options_return_json) = get_options_biometric_auth(user=user_now)
    save_current_chalenge(db=db,
                          user_id=user_now.id,
                          chalenge=options_return.challenge)
    return json.loads(options_return_json)


@router.get('/login/options-generic-biometric', status_code=201)
def get_generic_options_for_biometric(response: Response):
    try:
        (challenge_generated, challenge_generated_str) = get_challenge()
        (options, options_json) = get_generic_options_biometric(challenge=challenge_generated)
        response.set_cookie(
            key='biometric_challenge',
            value=challenge_generated_str,
            httponly=True,
            secure=True,
            samesite='none',
            max_age=120
        )
        return json.loads(options_json)
    except:
        raise HTTPException(status_code=400, detail='erro ao pegar as opções')

    

@router.post('/login/verify-biometric', status_code=201)
async def verify_biometric(response: Response, request: Request = {}, db: Session = Depends(get_db)):
    body_requisition = await request.json()
    saved_challenge = request.cookies.get('biometric_challenge')
    if not saved_challenge:
        raise HTTPException(status_code=400, detail='Sessão de login expirada ou invalida')
    
    credential_received_in_request = body_requisition.get('credential')
    
    credential_id = credential_received_in_request['id']


    expected_challenge = base64.urlsafe_b64decode(saved_challenge + '==')

    credential_founded = get_credential_by_cred_id(credential_id, db)
    

    user_founded = get_user_by_credential_id(db, credential_founded.user_id)    
    
    verification_returned = validate_signature(credential_received=credential_received_in_request, expected_challenge_received=expected_challenge, credential_found=credential_founded)

    credential_founded.sign_count = verification_returned.new_sign_count

    data_user = {'id': user_founded.id}
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_DURATION_TIME)
    access_token = create_access_token(data=data_user, expires_delta=access_token_expires)

    refresh_token_expires = timedelta(days=ACCESS_TOKEN_DURATION_TIME)
    refresh_token = create_access_token(data=data_user, expires_delta=refresh_token_expires)
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite='none',
        max_age=ACCESS_TOKEN_DURATION_TIME * 24 * 60 * 60
    )

    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user_data': user_founded
    }


@router.post('/biometric/delete', status_code=201)
async def remove_biometric_for_this_device(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user), request: Request ={}):
    id_of_device = await request.json()
    delete_biometric_of_device_selected(db=db,
                                        user_id=current_user['user_id'],
                                        device_id_for_remove=id_of_device['deviceId'])
    return True


@router.post('/refresh')
def refresh_token_user(request: Request, db: Session = Depends(get_db), response: Response = {}):
    refresh_token = request.cookies.get('refresh_token')
    if not refresh_token:
        raise HTTPException(status_code=401, detail='não autenticado')
    
    payload = verify_token(refresh_token)
    try:
        data_user = {'id': payload.get('id')}
        access_token_expires = timedelta(seconds=ACCESS_TOKEN_DURATION_TIME)
        new_access_token = create_access_token(data=data_user,
                                               expires_delta=access_token_expires)
        
        refresh_token_expires = timedelta(days=ACCESS_TOKEN_DURATION_TIME)
        new_refresh_token = create_access_token(data=data_user,
                                                expires_delta=refresh_token_expires)
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=ACCESS_TOKEN_DURATION_TIME * 24 * 60 * 60
        )


        return new_access_token
    except:
        raise HTTPException(status_code=401, detail='Token expirado ou invalido')


@router.get('/logout', status_code=201)
def logout_user(response: Response = {}):
    response.delete_cookie(
        key='refresh_token',
        httponly=True,
        secure=True,
        samesite='none'
    )

    return {'message': 'usuario deslogado e token removido!'}


@router.post('/register/verify-otp', status_code=200)
async def verify_otp_received(db: Session = Depends(get_db),  request: Request ={}):
    payload = await request.json()
    email = payload.get('email')
    otpCode = payload.get('otpCode')
    print('oi')
    if(verify_code(db=db,
                   code=otpCode,
                   email=email)):
        return {'message': 'everything is ok'}
    else:
        raise HTTPException(status_code=400, detail='otp code not correct')
    

@router.post('/register/get-new-otp-code', status_code=200)
async def get_new_otp_code(db: Session = Depends(get_db), request: Request = {}):
    payload = await request.json()
    email = payload.get('email')
    name = payload.get('name')
    if(email):
        if(name):
            if(associate_email_with_code(db=db, email=email, name=name)):
                return {'message': 'um novo codigo foi enviado'}
        
    raise HTTPException(status_code=400, detail='error')


@router.get('/request/recovery-password', status_code=200)
def recovery_password(email: Optional[str] = None,
                      db: Session = Depends(get_db)):
    if(email == None):
        raise HTTPException(status_code=400, detail='not email in request')
    user_founded = get_user_by_email(db=db, email=email)
    if(user_founded == None):
        raise HTTPException(status_code=404, detail='user not found')
    
    code_sended = send_email_recovery_password(db=db, email=email, name_user=user_founded.name)
    if(code_sended == None):
        raise HTTPException(status_code=400, detail='error in sending code of verification')
    
    save_code_of_recovery_password(db=db, user_id=user_founded.id, code=code_sended)

    return {'message': 'code sended'}


@router.post('/verify/recovery-password', status_code=200)
async def verify_recovery_password_code(response: Response,db: Session = Depends(get_db), request: Request = {}):
    payload = await request.json()
    email = payload.get('email')
    code = payload.get('code')
    if(email == None):
        raise HTTPException(status_code=400, detail='not email in request')

    if(code == None):
        raise HTTPException(status_code=400, detail='not code in request')
    
    user_founded = get_user_by_email(db=db, email=email)
    if(user_founded == None):
        raise HTTPException(status_code=404, detail='user not found')
    
    result  = verify_code_of_recovery_password(db=db, code=code, user_id=user_founded.id)
    print(result)
    if(result[0]):
        
        delete_code_of_recovery_password(db=db, user_id=user_founded.id)
        
        data_user = {'id': user_founded.id}
        update_password_token_expires = timedelta(seconds=300)
        new_update_password_token = create_access_token(data=data_user,
                                                expires_delta=update_password_token_expires)
        response.set_cookie(
            key='update_password_auth',
            value=new_update_password_token,
            httponly=True,
            secure=True,
            samesite='none',
            max_age=300
        )
        return {"message": result[1]}
    else:
        raise HTTPException(status_code=400, detail=result[1])
    

@router.post('/update-password', status_code=200)
async def update_password_recovered( db: Session = Depends(get_db), request: Request = {}):
    payload = await request.json()
    new_password = payload.get('password')
    if(new_password == None):
        raise HTTPException(status_code=401, detail='password is necessary but not but it didnt attive in the request')
    update_password_token = request.cookies.get('update_password_auth')
    if not update_password_token:
        raise HTTPException(status_code=401, detail='não autenticado')
    
    payload_token = verify_token(update_password_token)
    update_password(db=db, user_id=payload_token['id'], password=new_password)
    return {'message': 'password is updated, please log in'}