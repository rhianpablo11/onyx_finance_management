from datetime import datetime, timedelta

from sqlalchemy import Column, DateTime, Integer, String

from app.core.database import Base

class User_temp(Base):
    __tablename__ = 'users_temp'

    id = Column(Integer, autoincrement=True, primary_key=True)
    email = Column(String, nullable=False)
    verification_code = Column(Integer, nullable=False)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(minutes=5))
    