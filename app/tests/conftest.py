import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date
from app.core.database import Base
from app.models.user import User
from app.models.expense import Expense
from app.models.expenses_fixed import Expenses_fixed
from app.models.expense_category import Expense_category
from app.models.charge_type import Charge_type
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB

@compiles(JSONB, 'sqlite')
def compile_jsonb_sqlite(type_, compiler, **kw):
    return 'TEXT'

# Cria um banco de dados SQLite temporário "na memória RAM" (muito rápido)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)




@pytest.fixture(scope="function")
def db_session():
    """
    Equivalente ao @BeforeEach do Java.
    Cria as tabelas, entrega a sessão pro teste e depois destrói tudo.
    """
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db  # Pausa aqui e entrega o banco pro teste rodar
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine) # Limpa tudo pro próximo teste!

@pytest.fixture(scope="function")
def test_user(db_session):
    """
    Cria um usuário fake, uma categoria e um tipo de cobrança no banco falso 
    para não precisarmos recriar isso em todo santo teste.
    """
    # 1. Cria um usuário de teste
    user = User(
        name="Test User",
        email="test@onyx.com",
        password="hashedpassword",
        telephone='123456',
        balance=0
    )
    db_session.add(user)
    
    # 2. Cria uma categoria de teste (ID 1)
    category = Expense_category(name="Moradia", user_id=1)
    db_session.add(category)
    
    # 3. Cria um tipo de cobrança Quinzenal (ID 1)
    db_session.add_all([
        Charge_type(name="Quinzenal"), # 1
        Charge_type(name="Mensal"),    # 2
        Charge_type(name="Semanal"),   # 3
        Charge_type(name="Anual"),     # 4
        Charge_type(name="Parcelado"), # 5
        Charge_type(name="Diário")     # 6
    ])
    
    db_session.commit()
    db_session.refresh(user)
    
    return user