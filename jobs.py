"""Job management routes."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional

from app.database import get_db
from app.models import User, Job, UserProfile
from app.schemas import JobCreate, JobResponse, JobListResponse, JobScoreRequest, JobActionRequest, GamificationEvent
from app.auth import get_current_active_user
from app.gamification import GamificationEngine
from ai_services.factory import AIServiceFactory
from app.redis_client import redis_client
import json

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=JobListResponse)
async def list_jobs(status: Optional[str] = Query(None, regex="^(new|applied|skipped|saved)$"),
                    page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
                    current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    query = select(Job).where(Job.user_id == current_user.id)
    if status: query = query.where(Job.user_status == status)

    count_query = select(func.count(Job.id)).where(Job.user_id == current_user.id)
    if status: count_query = count_query.where(Job.user_status == status)
    total = (await db.execute(count_query)).scalar()

    query = query.offset((page-1)*page_size).limit(page_size).order_by(Job.created_at.desc())
    jobs = (await db.execute(query)).scalars().all()

    return JobListResponse(items=[JobResponse.model_validate(j) for j in jobs], total=total, page=page, page_size=page_size)

@router.post("", response_model=JobResponse, status_code=201)
async def create_job(job_data: JobCreate, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    new_job = Job(**job_data.model_dump(), user_id=current_user.id)
    db.add(new_job)
    await db.commit()
    await db.refresh(new_job)
    return new_job

@router.post("/score")
async def score_job(request: JobScoreRequest, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    if current_user.ai_requests_used >= current_user.ai_requests_limit:
        raise HTTPException(status_code=429, detail="AI request limit reached. Upgrade to Pro.")

    result = await db.execute(select(Job).where(and_(Job.id == request.job_id, Job.user_id == current_user.id)))
    job = result.scalar_one_or_none()
    if not job: raise HTTPException(status_code=404, detail="Job not found")

    cache_key = f"job_score:{current_user.id}:{job.id}"
    cached = await redis_client.get(cache_key)
    if cached: return json.loads(cached)

    result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    user_profile_data = {"title": profile.title if profile else "", "skills": profile.skills if profile else [],
                         "experience_years": profile.experience_years if profile else 0, "summary": profile.summary if profile else ""}

    ai_service = AIServiceFactory.get_service()
    ai_result = await ai_service.score_job(job.description, job.requirements or "", user_profile_data)

    job.ai_score = ai_result["score"]
    job.ai_decision = ai_result["decision"]
    job.ai_reasoning = ai_result["reasoning"]
    job.ai_tags = ai_result["tags"]
    job.interview_probability = ai_result["interview_probability"]
    job.offer_probability = ai_result["offer_probability"]

    current_user.ai_requests_used += 1
    await GamificationEngine.process_event(db, current_user.id, GamificationEvent(event_type="job_scored", metadata={"job_id": job.id, "score": ai_result["score"]}))
    await db.commit()

    response = {"job_id": job.id, "score": job.ai_score, "decision": job.ai_decision,
                "reasoning": job.ai_reasoning, "tags": job.ai_tags,
                "interview_probability": job.interview_probability, "offer_probability": job.offer_probability}
    await redis_client.setex(cache_key, 3600, json.dumps(response))
    return response

@router.post("/apply")
async def apply_to_job(request: JobActionRequest, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(and_(Job.id == request.job_id, Job.user_id == current_user.id)))
    job = result.scalar_one_or_none()
    if not job: raise HTTPException(status_code=404, detail="Job not found")

    from datetime import datetime, timezone
    job.user_status = "applied"
    job.applied_at = datetime.now(timezone.utc)
    job.user_notes = request.notes or job.user_notes

    gamification_result = await GamificationEngine.process_event(db, current_user.id, GamificationEvent(event_type="job_applied", metadata={"job_id": job.id}))
    await db.commit()
    return {"message": "Job marked as applied", "gamification": gamification_result}

@router.post("/skip")
async def skip_job(request: JobActionRequest, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(and_(Job.id == request.job_id, Job.user_id == current_user.id)))
    job = result.scalar_one_or_none()
    if not job: raise HTTPException(status_code=404, detail="Job not found")

    from datetime import datetime, timezone
    job.user_status = "skipped"
    job.skipped_at = datetime.now(timezone.utc)
    job.user_notes = request.notes or job.user_notes

    gamification_result = await GamificationEngine.process_event(db, current_user.id, GamificationEvent(event_type="job_skipped", metadata={"job_id": job.id}))
    await db.commit()
    return {"message": "Job marked as skipped", "gamification": gamification_result}
