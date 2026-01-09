from fastapi import FastAPI
from app.routers import user_router, transactions_router
from app.core.database import engine, Base
from app.models import user

app = FastAPI(
    title='Finance Management AI API',
    description='API for finance management simplified and Inteligent',
    version='0.0.1'
)
app.include_router(user_router.router, prefix='/user', tags=['user control'])
app.include_router(transactions_router.router, prefix='/transactions', tags=['expenses control'])

@app.get('/')
def root():
    return {
        'message': 'API is working'
    }