# backend/app/routes/auth.py
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.database.connection import get_db
from app.database.models import User, StylePreference
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class GoogleAuthRequest(BaseModel):
    credential: str  # Google's signed ID Token (JWT)

# 1. STANDARD PASSWORD REGISTRATION
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email address is already registered."
        )
    
    hashed = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed,
        full_name=user_data.full_name
    )
    db.add(new_user)
    db.flush()

    preferences = StylePreference(user_id=new_user.id)
    db.add(preferences)
    
    db.commit()
    db.refresh(new_user)
    return new_user

# 2. STANDARD PASSWORD LOGIN
@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    token_data = {"sub": str(user.id), "email": user.email}
    access_token = create_access_token(token_data)
    return {"access_token": access_token}

# 3. NEW: SECURE GOOGLE OAUTH SIGN-IN/SIGN-UP
@router.post("/google", response_model=Token)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GOOGLE_CLIENT_ID is not configured on the server."
        )
        
    try:
        # A. Cryptographically verify the Google ID Token
        idinfo = id_token.verify_oauth2_token(
            payload.credential, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # B. Extract validated user information
        email = idinfo["email"]
        full_name = idinfo.get("name", "Google User")
        
        # C. Check if user already exists in PostgreSQL
        user = db.query(User).filter(User.email == email).first()
        is_new_signup = False
        
        if not user:
            is_new_signup = True
            # Automatically create account on first login
            random_password = uuid.uuid4().hex
            hashed = hash_password(random_password)
            
            user = User(
                email=email,
                password_hash=hashed,
                full_name=full_name
            )
            db.add(user)
            db.flush()
            
            # Initialize blank style preferences
            preferences = StylePreference(user_id=user.id)
            db.add(preferences)
            db.commit()
            db.refresh(user)
            
        # D. Generate local JWT access token for StyleMatch AI session
        token_data = {"sub": str(user.id), "email": user.email}
        access_token = create_access_token(token_data)
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google credentials: {str(e)}"
        )