from app.core.database import Base
from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = 'user'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(200), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    telephone = Column(String(20), nullable=False, unique=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    subscriber = Column(Boolean, default=False)