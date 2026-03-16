from pydantic import BaseModel, ConfigDict, EmailStr, Json
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr
    telephone: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    subscriber: bool
    created_date: datetime

    model_config = ConfigDict(from_attributes=True)


class UserResponseLogin(BaseModel):
    access_token: str
    token_type: str
    user_data: UserResponse