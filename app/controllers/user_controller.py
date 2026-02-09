from fastapi import HTTPException, status
from sqlalchemy import delete, insert, select, update
from app.core.auth import create_access_token, ACCESS_TOKEN_DURATION_TIME
from datetime import timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import compare_password, hash_password
from app.models.user_crendentials import User_crendentials
from app.schemas.user_schema import UserCreate, UserResponse
from webauthn import generate_authentication_options, generate_registration_options, verify_authentication_response, verify_registration_response, options_to_json, base64url_to_bytes
from webauthn.helpers.structs import AuthenticatorSelectionCriteria, UserVerificationRequirement, RegistrationCredential, AuthenticationCredential, PublicKeyCredentialType, PublicKeyCredentialDescriptor
from app.core.security import BIOMETRIC_ORIGIN, BIOMETRIC_RP_ID, BIOMETRIC_RP_NAME
import base64

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
    print('ccccccccccc')
    options = generate_registration_options(
        rp_id=BIOMETRIC_RP_ID,
        rp_name=BIOMETRIC_RP_NAME,
        user_id=str(user_id_now).encode(),
        user_name=user_name_now,
        authenticator_selection=AuthenticatorSelectionCriteria(
            user_verification=UserVerificationRequirement.PREFERRED,
            authenticator_attachment=None
        )
    )
    return (options, options_to_json(options))


def save_current_chalenge(db: Session, user_id: int, chalenge):
    print(chalenge)
    print('oiafaf')
    print(user_id)
    chalenge_str = base64.urlsafe_b64encode(chalenge).decode("utf-8").rstrip("=")
    print(chalenge_str)
    stmt = update(User).where(User.id == user_id).values(current_chalenge = chalenge_str)
    db.execute(stmt)
    print('oi')
    db.commit()
    return True


def verify_registration_biometric(body, challenge_str):
    try:
        verification = verify_registration_response(
            credential=body,
            expected_challenge=base64url_to_bytes(challenge_str),
            expected_origin=BIOMETRIC_ORIGIN,
            expected_rp_id=BIOMETRIC_RP_ID,
            require_user_verification=True
        )
        return verification
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'falha na validação {str(e)}')
    

def add_new_credential(db: Session, user_id: int, verification):
    new_credential = User_crendentials(
        user_id=user_id,
        credential_id=verification.credential_id,
        public_key=verification.credential_public_key,
        sign_count=verification.sign_count,
        device_name='new device'
    )
    db.add(new_credential)


def remove_current_challenge_of_user(db: Session, user_id: int):
    stmt = update(User).where(User.id == user_id).values(current_chalenge= None)
    db.execute(stmt)
    db.commit()


def get_user_by_email(db: Session, email:str):
    stmt = select(User).where(User.email == email)
    user_found = db.execute(stmt).first()[0]
    return user_found


def get_options_biometric_auth(user: User):

    print(user.credentials[0])
    print(user.credentials[0].credential_id)
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


def get_credential_used(user: User, credential_id_used):
    credential_found = None
    for cred in user.credentials:
        cred_id_str = base64.urlsafe_b64encode(cred.credential_id).decode("utf-8").rstrip("=")
        
        if(cred_id_str == credential_id_used):
            credential_found = cred
    
    if not credential_found:
        raise HTTPException(status_code=400, detail='credencial nao encontrada')
    return credential_found

def validate_signature(credential_received, user: User, credential_found):
    try:
        print('lllllllll')
        verification = verify_authentication_response(
            credential=credential_received,
            expected_challenge=base64.urlsafe_b64decode(user.current_chalenge + "=="),
            expected_rp_id=BIOMETRIC_RP_ID,
            expected_origin=BIOMETRIC_ORIGIN,
            credential_public_key=credential_found.public_key,
            credential_current_sign_count=credential_found.sign_count,
            require_user_verification=True
        )
        print('mmmmmmmmmmm')
        print(verification)
        return verification
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail='falha na autenticação')