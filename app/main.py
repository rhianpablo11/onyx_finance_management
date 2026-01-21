from fastapi import FastAPI
from app.routers import user_router, transactions_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import user

app = FastAPI(
    title='Onyx API',
    description='API for finance management simplified and Inteligent',
    version='0.0.1'
)

origins = [
    "http://localhost:5173",      # A porta padrão do Vite (Frontend)
    "http://127.0.0.1:5173",      # O IP local padrão
    "http://localhost:3000",      # (Opcional) Caso mude a porta do front
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # Lista de quem pode chamar a API
    allow_credentials=True,       # Permite enviar Cookies/Tokens de Autenticação
    allow_methods=["*"],          # Permite GET, POST, PUT, DELETE (Tudo)
    allow_headers=["*"],          # Permite qualquer cabeçalho (Authorization, etc)
)

app.include_router(user_router.router, prefix='/user', tags=['user control'])
app.include_router(transactions_router.router, prefix='/transactions', tags=['expenses control'])

@app.get('/')
def root():
    return {
        'message': 'API is working'
    }