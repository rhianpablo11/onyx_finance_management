from app.core.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey


class Expense_category(Base):
    __tablename__ = 'expenses_category'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)
    name = Column(String(200), nullable=False)