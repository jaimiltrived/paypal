from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.schemas.common import BaseSchema


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user_id: str
    email: str
    role: str


class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2, max_length=100)
    role_name: str = "user"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class RoleRead(BaseSchema):
    id: str
    name: str
    description: Optional[str] = None


class UserRead(BaseSchema):
    id: str
    email: str
    full_name: str
    is_active: bool
    role: RoleRead
    created_at: datetime

