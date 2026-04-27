"""Profile routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, UserProfile
from app.schemas import UserProfileCreate, UserProfileResponse, UserProfileUpdate, GamificationEvent
from app.auth import get_current_active_user
from app.gamification import GamificationEngine

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=UserProfileResponse)
async def get_profile(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("", response_model=UserProfileResponse)
async def update_profile(profile_data: UserProfileUpdate, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await GamificationEngine.process_event(db, current_user.id, GamificationEvent(event_type="profile_updated", metadata={"fields_updated": list(update_data.keys())}))
    await db.commit()
    await db.refresh(profile)
    return profile
