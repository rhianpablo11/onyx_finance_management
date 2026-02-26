from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.orm import Session
import random
from app.models.user_temp import User_temp
from app.services.mail_service import send_email

def generate_new_otp():
    code = random.randint(111111,999999)
    return code


def associate_email_with_code(db: Session, email: str, name:str):
    try:
        
        code = generate_new_otp()
        print(code)
        respose = send_email(email, code, name)
        print(respose)
        if(respose == 'ok'):
            stmt = (select(User_temp)
                    .where(User_temp.email == email))
            user_founded = db.execute(stmt).first()
            if(user_founded):
                user_founded[0]
                db.delete(user_founded[0])
                db.commit()

            
            new_user_temp = User_temp(
                email=email,
                verification_code=code
            )

            db.add(new_user_temp)

            db.commit()
            return True     
        else:
            return False

    except:
        return False
    

def verify_code(db: Session, code: int, email: str):
    try:
        stmt = (select(User_temp)
                .where(User_temp.email == email))
        
        user_temp_founded = db.execute(stmt).first()

        if(user_temp_founded): 
            
            if(user_temp_founded[0].verification_code == code and user_temp_founded[0].expires_at > datetime.utcnow()):
                
                db.delete(user_temp_founded[0])
                db.commit()
                
                return True
                
        else:

            return False
        
    except Exception as e:
        print(e)
        return False
