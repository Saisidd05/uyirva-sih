from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from datetime import datetime, timedelta
from ..db import get_async_session
from ..models.user import User, UserRole
from ..core.config import settings
from ..utils import jwt

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegisterRequest(BaseModel):
    full_name: str = Field(..., example="John Doe")
    email: EmailStr
    phone: str = Field(..., example="+919876543210")
    password: str = Field(..., min_length=8)
    role: UserRole
    # role‑specific optional fields (simplified)
    farm_name: str | None = None
    organization_name: str | None = None
    location_lat: float | None = None
    location_lng: float | None = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str | None = None

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

@router.post("/register", response_model=TokenResponse)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_async_session)):
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == payload.email)
    )
    if result.first():
        raise HTTPException(status_code=400, detail="Email already registered")
    # Create user
    hashed = get_password_hash(payload.password)
    db_user = User(
        email=payload.email,
        full_name=payload.full_name,
        phone=payload.phone,
        hashed_password=hashed,
        role=payload.role,
        location="POINT({} {})".format(payload.location_lng or 0, payload.location_lat or 0) if payload.location_lat is not None else None,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    # Generate tokens
    access = jwt.create_access_token({"sub": str(db_user.id), "role": db_user.role.value})
    refresh = jwt.create_refresh_token({"sub": str(db_user.id)})
    return TokenResponse(access_token=access, refresh_token=refresh)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(
        select(User).where(User.email == payload.email)
    )
    db_user = result.scalar_one_or_none()
    if not db_user or not verify_password(payload.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access = jwt.create_access_token({"sub": str(db_user.id), "role": db_user.role.value})
    refresh = jwt.create_refresh_token({"sub": str(db_user.id)})
    return TokenResponse(access_token=access, refresh_token=refresh)

@router.get("/me")
async def me(current_user: User = Depends(jwt.get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "phone": current_user.phone,
    }
