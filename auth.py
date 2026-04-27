"""Authentication routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, GamificationProfile
from app.schemas import UserRegister, UserLogin, TokenPair, TokenRefresh, UserResponse
from app.auth import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(email=user_data.email, hashed_password=get_password_hash(user_data.password),
                    first_name=user_data.first_name, last_name=user_data.last_name)
    db.add(new_user)
    await db.flush()
    db.add(GamificationProfile(user_id=new_user.id))
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenPair)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")

    return TokenPair(access_token=create_access_token(user.id), refresh_token=create_refresh_token(user.id), expires_in=30*60)

@router.post("/refresh", response_model=TokenPair)
async def refresh_token(token_data: TokenRefresh):
    payload = decode_token(token_data.refresh_token)
    if payload.type != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    return TokenPair(access_token=create_access_token(payload.sub), refresh_token=create_refresh_token(payload.sub), expires_in=30*60)

@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out"}
