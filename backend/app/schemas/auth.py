# backend/app/schemas/auth.py
from pydantic import BaseModel, EmailStr
from uuid import UUID

# Validates incoming registration data
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

# Validates incoming login data
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Formats the access token response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Formats the user profile response (safe to send to frontend)
class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str

    class Config:
        from_attributes = True