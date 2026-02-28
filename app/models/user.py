from datetime import datetime, timedelta

from app.core.database import Base
from sqlalchemy import Boolean, Column, Integer, Numeric, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(200), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    telephone = Column(String(20), nullable=False, unique=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    subscriber = Column(Boolean, default=False)
    otp_code_recovery_password = Column(Integer, nullable=True)
    otp_code_recovery_expires_at = Column(DateTime, nullable=True)
    second_factor_auth = Column(Boolean, nullable=False, default=False)
    balance = Column(Numeric(18, 2), default=0.0)
    current_chalenge = Column(String(255), nullable=True)
    credentials = relationship("User_crendentials", back_populates="user")