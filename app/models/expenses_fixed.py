from app.core.database import Base
from sqlalchemy import Boolean, Column, Date, Integer, String, Numeric, ForeignKey

class Expenses_fixed(Base):
    __tablename__ = 'expenses_fixed'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    value = Column(Numeric(10,2), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    charge = Column(Integer, ForeignKey('charge_type.id'), nullable=False)
    category = Column(Integer, ForeignKey('expenses_category.id'), nullable=False)
    payment_date = Column(Date, nullable=False)
    activated = Column(Boolean, default=True)
    type_expense = Column(Boolean, nullable=False)
    installments_count = Column(Integer, nullable=True)
    description = Column(String(255), nullable=True)
    payment_method = Column(String(200))