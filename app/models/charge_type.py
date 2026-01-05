from app.core.database import Base
from sqlalchemy import  Column, String, Integer

class Charge_type(Base):
    __tablename__ = 'charge_type'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(30))