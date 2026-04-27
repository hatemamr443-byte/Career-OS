"""Gamification routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, GamificationProfile, UserActivity, BadgeDefinition
from app.schemas import GamificationEvent, GamificationProfileResponse, ActivityResponse
from app.auth import get_current_active_user
from app.gamification import GamificationEngine

router = APIRouter(prefix="/gamification", tags=["Gamification"])

@router.get("/me", response_model=GamificationProfileResponse)
async def get_my_gamification(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GamificationProfile).where(GamificationProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = GamificationProfile(user_id=current_user.id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)

    stats = GamificationEngine.get_dashboard_stats(profile)
    return GamificationProfileResponse(
        id=profile.id, user_id=profile.user_id, xp=profile.xp, level=profile.level,
        streak_days=profile.streak_days, longest_streak=profile.longest_streak,
        last_activity_date=profile.last_activity_date, total_jobs_applied=profile.total_jobs_applied,
        total_jobs_skipped=profile.total_jobs_skipped, total_emails_processed=profile.total_emails_processed,
        badges=profile.badges, next_level_xp=stats["next_level_xp"], xp_to_next_level=stats["xp_to_next_level"])

@router.post("/events")
async def post_event(event: GamificationEvent, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    return await GamificationEngine.process_event(db, current_user.id, event)

@router.get("/activities")
async def get_activities(page: int = 1, page_size: int = 20,
                         current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    query = select(UserActivity).where(UserActivity.user_id == current_user.id).order_by(UserActivity.created_at.desc())
    query = query.offset((page-1)*page_size).limit(page_size)
    activities = (await db.execute(query)).scalars().all()
    return [ActivityResponse.model_validate(a) for a in activities]

@router.get("/badges")
async def get_badges(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GamificationProfile).where(GamificationProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    earned_badges = set(profile.badges) if profile else set()

    result = await db.execute(select(BadgeDefinition))
    all_badges = result.scalars().all()

    return [{"id": b.id, "name": b.name, "description": b.description, "icon": b.icon,
             "xp_reward": b.xp_reward, "earned": b.name in earned_badges} for b in all_badges]
