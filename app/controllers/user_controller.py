from fastapi import HTTPException, status, Response
from sqlalchemy import delete, insert, select, update
from app.controllers.user_temp_controller import associate_email_with_code, generate_new_otp
from app.core.auth import create_access_token, ACCESS_TOKEN_DURATION_TIME
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import compare_password, hash_password
from app.models.user_crendentials import User_crendentials
from app.schemas.user_schema import UserCreate, UserResponse
from webauthn import generate_authentication_options, generate_registration_options, verify_authentication_response, verify_registration_response, options_to_json, base64url_to_bytes
from webauthn.helpers.structs import AuthenticatorSelectionCriteria, ResidentKeyRequirement, UserVerificationRequirement, RegistrationCredential, AuthenticationCredential, PublicKeyCredentialType, PublicKeyCredentialDescriptor
from webauthn.helpers import generate_challenge, bytes_to_base64url
from app.core.security import BIOMETRIC_ORIGIN, BIOMETRIC_RP_ID, BIOMETRIC_RP_NAME
import base64

from app.services.mail_service import send_email

def authenticate_user(email:str, password: str ,db: Session, response: Response):
    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise HTTPException(status_code=400, detail="Email incorreto")
    
    if not compare_password(password, user.password):
        raise HTTPException(status_code=400, detail="Senha incorreta")

    
    data_user = {'id': user.id}
    access_token_expires = timedelta(seconds=ACCESS_TOKEN_DURATION_TIME)
    refresh_token_expires = timedelta(days=ACCESS_TOKEN_DURATION_TIME)
    #create token for long time
    access_token = create_access_token(data=data_user, expires_delta=access_token_expires)
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
        'user_data': user
    }


def create_user(user: UserCreate, db: Session, response: Response):
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
        second_factor_auth = False
    )
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        data_user = {'id': new_user.id}
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
    except:
        raise HTTPException(status_code=400, detail='error in database')

    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user_data': new_user
    }


def verify_user_exist(db: Session, email: str, telephone: str, name: str):
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
    
    associate_email_with_code(db=db, email=email, name=name)
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
        print(now_balance)
        print(value)
        if(type):
            new_value = now_balance + value
        else:
            new_value = now_balance - value

        print(new_value)
        stmt = (update(User)
                .where(User.id == user_id)
                .values(balance=new_value))

        result = db.execute(stmt)

        db.commit()

        stmt = (select(User).where(User.id == user_id))
        print(db.execute(stmt).first()[0].balance)

        
    except Exception as e:
        raise HTTPException(status_code=400, detail='error in database')
    if result.rowcount == 0:
        raise HTTPException(status_code=400, detail='error in update balance')
    

def get_user_by_id(db: Session, user_id: int):
    try:
        stmt = select(User).where(User.id == user_id)
        user_founded = db.execute(stmt).first()[0]
        print(user_founded)
        return user_founded
    except:
        return None
    

def get_options(user_id_now: int, user_name_now: str):
    
    options = generate_registration_options(
        rp_id=BIOMETRIC_RP_ID,
        rp_name=BIOMETRIC_RP_NAME,
        user_id=str(user_id_now).encode(),
        user_name=user_name_now,
        authenticator_selection=AuthenticatorSelectionCriteria(
            user_verification=UserVerificationRequirement.PREFERRED,
            authenticator_attachment=None,
            resident_key=ResidentKeyRequirement.REQUIRED
        )
    )
    return (options, options_to_json(options))


def save_current_chalenge(db: Session, user_id: int, chalenge):

    chalenge_str = base64.urlsafe_b64encode(chalenge).decode("utf-8").rstrip("=")
    stmt = update(User).where(User.id == user_id).values(current_chalenge = chalenge_str)
    db.execute(stmt)
    db.commit()
    return True


def verify_registration_biometric(body, challenge_str):
    try:
        print("aaaaa")
        verification = verify_registration_response(
            credential=body,
            expected_challenge=base64url_to_bytes(challenge_str),
            expected_origin=BIOMETRIC_ORIGIN,
            expected_rp_id=BIOMETRIC_RP_ID,
            require_user_verification=True
        )
        print('bbbbbbb')
        return verification
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'falha na validação {str(e)}')
    

def add_new_credential(db: Session, user_id: int, device_id: str, verification):
    
    credencial_id_text = bytes_to_base64url(verification.credential_id)
    new_credential = User_crendentials(
        user_id=user_id,
        credential_id=credencial_id_text,
        public_key=verification.credential_public_key,
        sign_count=verification.sign_count,
        device_name='new device',
        device_id=device_id
    )
    db.add(new_credential)
    

def remove_current_challenge_of_user(db: Session, user_id: int):
    stmt = update(User).where(User.id == user_id).values(current_chalenge= None)
    db.execute(stmt)
    
    db.commit()
    


def get_user_by_email(db: Session, email:str):
    try:
        stmt = select(User).where(User.email == email)
        user_found = db.execute(stmt).first()
        if(user_found):
            return user_found[0]
        else:
            return None
    except:
        return None


def get_options_biometric_auth(user: User):


    list_of_credentials = [
        PublicKeyCredentialDescriptor(
            id=cred.credential_id, 
            type=PublicKeyCredentialType.PUBLIC_KEY 
        ) 
        for cred in user.credentials
    ]
    options = generate_authentication_options(
        rp_id=BIOMETRIC_RP_ID,
        allow_credentials=list_of_credentials,
        user_verification=UserVerificationRequirement.PREFERRED
    )

    return (options, options_to_json(options))


def get_generic_options_biometric(challenge):
    try:
        options = generate_authentication_options(
            rp_id=BIOMETRIC_RP_ID,
            challenge=challenge
        )
        return (options, options_to_json(options))
    except Exception as e:
        print('ERRO AO GERAR OPTIONS GENERIC: ' + str(e))
        raise HTTPException(status_code=400, detail='error in generate options')


def get_challenge():
    try:
        challenge = generate_challenge()
        challenge_str = base64.urlsafe_b64encode(challenge).decode('utf-8').rstrip("=")
        return (challenge, challenge_str)
    except Exception as e:
        print('ERRO AO GERAR CHALLENGE: ' + str(e))
        raise HTTPException(status_code=400, detail='error in generate challenge')




def get_credential_used(user: User, credential_id_used):
    credential_found = None
    for cred in user.credentials:
        cred_id_str = base64.urlsafe_b64encode(cred.credential_id).decode("utf-8").rstrip("=")
        
        if(cred_id_str == credential_id_used):
            credential_found = cred
    
    if not credential_found:
        raise HTTPException(status_code=400, detail='credencial nao encontrada')
    return credential_found


def get_credential_by_cred_id(cred_id, db: Session) -> User_crendentials:
    try:
        stmt = (select(User_crendentials)
                .where(User_crendentials.credential_id == cred_id))
        cred = db.execute(stmt).first()[0]
        print(cred)
        return cred
    except:
        raise HTTPException(status_code=400, detail='credencial nao encontrada')
    

def get_user_by_credential_id(db: Session, cred_id_user):
    try:
        stmt = (select(User)
                .where(User.id == cred_id_user))
        user_founded = db.execute(stmt).first()[0]
        return user_founded
    except:
        raise HTTPException(status_code=400, detail='usuario nao encontrado')

def validate_signature(credential_received, expected_challenge_received, credential_found):
    try:
        
        verification = verify_authentication_response(
            credential=credential_received,
            expected_challenge=expected_challenge_received,
            expected_rp_id=BIOMETRIC_RP_ID,
            expected_origin=BIOMETRIC_ORIGIN,
            credential_public_key=credential_found.public_key,
            credential_current_sign_count=credential_found.sign_count,
            require_user_verification=True
        )
        
        
        return verification
    except Exception as e:
        print('VALIDATE SIGNATURE - ERRO: ' + str(e))
        
        
        raise HTTPException(status_code=400, detail='falha na autenticação - validação da assinatura')
    

def device_has_biometric_registered(db: Session, user_id: int, device_id_for_verify: str):
    stmt = (select(User_crendentials)
            .where(User_crendentials.user_id == user_id)
            .where(User_crendentials.device_id == device_id_for_verify))
    
    user_crendentials_founded = db.execute(stmt).first()
    
    if(user_crendentials_founded):
        return True
    
    return False


def delete_biometric_of_device_selected(db: Session, user_id: int, device_id_for_remove: str):
    stmt = (select(User_crendentials)
            .where(User_crendentials.user_id == user_id)
            .where(User_crendentials.device_id == device_id_for_remove))
    
    user_crendentials_founded = db.execute(stmt).first()
    if(user_crendentials_founded):
        stmt = (delete(User_crendentials)
            .where(User_crendentials.user_id == user_id)
            .where(User_crendentials.device_id == device_id_for_remove))
        result = db.execute(stmt)
        db.commit()
        
        return result
    return False


def send_email_recovery_password(db: Session, email: str, name_user: str):
    try:
        code_send = generate_new_otp()
        send_email(email=email, code=code_send, isRecovery=True, name=name_user)
        return code_send        
    except:
        return None


def save_code_of_recovery_password(db: Session, user_id: int, code: int):
    time_now = datetime.now(timezone.utc)
    time_expires_code = time_now + timedelta(minutes=5)

    stmt = (update(User)
                .where(User.id == user_id)
                .values(otp_code_recovery_password=code)
                .values(otp_code_recovery_expires_at=time_expires_code))
    db.execute(stmt)
    db.commit()
    return


def verify_code_of_recovery_password(db: Session, code: int, user_id: int):
    stmt = (select(User.otp_code_recovery_expires_at, User.otp_code_recovery_password)
            .where(User.id == user_id))
    user_info_found = db.execute(stmt).first()
    if(user_info_found == None):
        raise HTTPException(status_code=404, detail='user not found')
    print('0000000')
    print(user_info_found)
    print('AAAAA')
    print(user_info_found[0])
    print('BBBBB')
    print(datetime.now(timezone.utc))
    print('CCCCCCCCC')
    print(user_info_found[0] > datetime.now(timezone.utc))
    if(user_info_found[1] == code):
        if(user_info_found[0] > datetime.now(timezone.utc)):
            return True, 'everything ok'
        else:
            return False, 'otp code expires'
    else:
        return False, 'otp code invalid'
    

def delete_code_of_recovery_password(db: Session, user_id: int):

    stmt = (update(User)
                .where(User.id == user_id)
                .values(otp_code_recovery_password=None)
                .values(otp_code_recovery_expires_at=None))
    db.execute(stmt)
    db.commit()
    return


def update_password(db: Session, user_id: int, password: str):
    try:
        print('iqoriqo')
        print(password)
        stmt = (update(User)
                .where(User.id == user_id)
                .values(password = hash_password(password)))
        db.execute(stmt)
        print('gnkdslgkd')
        db.commit()
        print('kdgnlagk')
        return
    except:
        raise HTTPException(status_code=400, detail='error in update')