from pydantic import BaseModel, EmailStr, Json
from datetime import datetime
from typing import Optional

class Expense_create(BaseModel):
    message: str

class Expense_response_base(BaseModel):
    category: str
    value: float
    type_expense: bool
    description: str
    date: datetime
    payment_method: str


class Expense_response_extended(Expense_response_base):
    start_date: datetime
    installments_count: int
    charge_type: str



