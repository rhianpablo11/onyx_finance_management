from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from app.core.database import SessionLocal
from app.models.user_temp import User_temp



def clean_db_user_temp_table():
    db = SessionLocal()
    
    try:
        now = datetime.utcnow()
        
        deleted = db.query(User_temp).filter(User_temp.expires_at < now).delete()
        db.commit()
        
        if(deleted > 0):
            print(f"{deleted} códigos OTP expirados foram removidos do banco.")
        else:
            print("Nenhum código expirado encontrado.")

    except Exception as e:
        print(f'Erro ao realizar limpeza. {e}')

    finally:
        db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(clean_db_user_temp_table, 'cron', hour=3, minute=0)

def get_scheduler():
    return scheduler
