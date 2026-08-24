from pydantic import BaseModel, EmailStr, Field, Json
from datetime import datetime, date
from typing import Optional

class Expense_create(BaseModel):
    message: str

class Expense_response_base(BaseModel):
    category: str
    value: float = Field(..., gt=0)
    type_expense: bool
    description: str
    date: datetime
    payment_method: str


class Expense_response_extended(Expense_response_base):
    start_date: datetime
    installments_count: int
    charge_type: str


class Expense_create_manual(BaseModel):
    name: str
    description: Optional[str] = ""
    value: float
    payment_method: str
    category_id: int
    date: date
    type_expense: bool # True = Entrada, False = Saída
    is_recurrent: bool
    is_continuous: Optional[bool] = False
    end_date: Optional[date] = None
    installments_count: Optional[int] = 1
    charge_type: Optional[str] = "Mensal"


