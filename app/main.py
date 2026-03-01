
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routers import user_router, transactions_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import user
from app.core.security import ORIGINS_ALLOWED_LIST
from app.services.scheculer_service import get_scheduler

from app.models.user import User
from app.models.charge_type import Charge_type
from app.models.chat_logs import Chat_logs
from app.models.expense_category import Expense_category
from app.models.expense import Expense
from app.models.expenses_fixed import Expenses_fixed
from app.models.user_crendentials import User_crendentials
from app.models.user_temp import User_temp

@asynccontextmanager
async def lifespan(app: FastAPI):
    print('initiated scheduler')
    scheduler = get_scheduler()
    scheduler.start()
    print('Criando tabelas do bd')
    #Base.metadata.create_all(bind=engine)
    yield

    print('shutdown scheduler')
    scheduler.shutdown()


app = FastAPI(
    title='Onyx API',
    description='API for finance management simplified and Inteligent',
    version='0.1.0',
    lifespan=lifespan
)

origins = [
    "http://localhost:5173",     
    "http://127.0.0.1:5173",      
    "http://localhost:3000",
    "https://onyxrp11.netlify.app"      
]
print(ORIGINS_ALLOWED_LIST)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS_ALLOWED_LIST,        # Lista de quem pode chamar a API
    allow_credentials=True,                    # Permite enviar Cookies/Tokens de Autenticação
    allow_methods=["*"],                       # Permite GET, POST, PUT, DELETE (Tudo)
    allow_headers=["*"],                       # Permite qualquer cabeçalho (Authorization, etc)
)



app.include_router(user_router.router, prefix='/user', tags=['user control'])
app.include_router(transactions_router.router, prefix='/transactions', tags=['expenses control'])

app.mount('/static', StaticFiles(directory='app/static'), name='static')


@app.get('/')
def root():
    return {
        'message': 'API is working'
    }