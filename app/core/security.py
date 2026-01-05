import bcrypt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv('secret_key_password', 'CHAVE_ALEATORIA')
SECRET_KEY_JWT = os.getenv('secret_key_password', 'CHAVE_ALEATORIA')
ALGORITHM = 'HS256'


def hash_password(password: str):
    password_bytes = password.encode('utf-8')
    password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return password_hash.decode('utf-8')


def compare_password(password_to_compare: str, password_hash: str) -> bool:
    password_bytes = password_to_compare.encode('utf-8')
    password_hash = password_hash.encode('utf-8')

    return bcrypt.checkpw(password_bytes, password_hash)

