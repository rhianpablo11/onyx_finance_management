import bcrypt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv


from pathlib import Path
current_file_path = Path(__file__).resolve()

# 2. Navega até a raiz do projeto. 
# Se este arquivo está em app/main.py, precisa voltar 1 nível (.parent) ou 2 (.parent.parent)
# Ajuste os .parent até chegar na pasta onde o .env está
env_path = current_file_path.parent.parent / '.env'
(f"Tentando carregar .env de: {env_path}")
load_dotenv(dotenv_path=env_path)


SECRET_KEY = os.getenv('secret_key_password', 'CHAVE_ALEATORIA')
SECRET_KEY_JWT = os.getenv('secret_key_password', 'CHAVE_ALEATORIA')
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ALGORITHM = 'HS256'
DB_URL = os.getenv('DATABASE_URL')
DB_USER = os.getenv('DATABASE_USER')
DB_PASSWORD = os.getenv('DATABASE_PASSWORD')
DB_NAME = os.getenv('DATABASE_NAME')
BIOMETRIC_RP_ID = os.getenv('BIOMETRIC_RP_ID')
BIOMETRIC_RP_NAME = os.getenv('BIOMETRIC_RP_NAME')
BIOMETRIC_ORIGIN = os.getenv('BIOMETRIC_ORIGIN')


def hash_password(password: str):
    password_bytes = password.encode('utf-8')
    password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return password_hash.decode('utf-8')


def compare_password(password_to_compare: str, password_hash: str) -> bool:
    password_bytes = password_to_compare.encode('utf-8')
    password_hash = password_hash.encode('utf-8')

    return bcrypt.checkpw(password_bytes, password_hash)

