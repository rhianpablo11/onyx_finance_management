from app.core.database import Base
from sqlalchemy import Boolean, Column, Integer, String, Date, Numeric, ForeignKey

class Expense(Base):
    __tablename__ = 'expense'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    category = Column(Integer, ForeignKey('expenses_category.id'), nullable=False)
    value = Column(Numeric(10,2), nullable=False)
    type_expense = Column(Boolean, nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    payment_method = Column(String(200))
    is_activated = Column(Boolean, nullable=False)