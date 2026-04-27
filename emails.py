"""Email management routes."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional

from app.database import get_db
from app.models import User, Email
from app.schemas import EmailCreate, EmailResponse, EmailListResponse, EmailClassifyRequest, GamificationEvent
from app.auth import get_current_active_user
from ai_services.factory import AIServiceFactory
from app.gamification import GamificationEngine

router = APIRouter(prefix="/emails", tags=["Emails"])

@router.get("", response_model=EmailListResponse)
async def list_emails(category: Optional[str] = Query(None), is_read: Optional[bool] = Query(None),
                      page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
                      current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    query = select(Email).where(Email.user_id == current_user.id)
    if category: query = query.where(Email.ai_category == category)
    if is_read is not None: query = query.where(Email.is_read == is_read)

    count_query = select(func.count(Email.id)).where(Email.user_id == current_user.id)
    if category: count_query = count_query.where(Email.ai_category == category)
    total = (await db.execute(count_query)).scalar()

    query = query.offset((page-1)*page_size).limit(page_size).order_by(Email.received_at.desc())
    emails = (await db.execute(query)).scalars().all()

    return EmailListResponse(items=[EmailResponse.model_validate(e) for e in emails], total=total, page=page, page_size=page_size)

@router.post("", response_model=EmailResponse, status_code=201)
async def create_email(email_data: EmailCreate, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    new_email = Email(**email_data.model_dump(), user_id=current_user.id)
    db.add(new_email)
    await db.commit()
    await db.refresh(new_email)
    return new_email

@router.post("/classify")
async def classify_email(request: EmailClassifyRequest, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    if current_user.ai_requests_used >= current_user.ai_requests_limit:
        raise HTTPException(status_code=429, detail="AI request limit reached. Upgrade to Pro.")

    result = await db.execute(select(Email).where(and_(Email.id == request.email_id, Email.user_id == current_user.id)))
    email = result.scalar_one_or_none()
    if not email: raise HTTPException(status_code=404, detail="Email not found")

    ai_service = AIServiceFactory.get_service()
    classification = await ai_service.classify_email(email.subject, email.body)

    email.ai_category = classification["category"]
    email.ai_confidence = classification["confidence"]
    email.ai_extracted_data = classification["extracted_data"]
    current_user.ai_requests_used += 1

    await GamificationEngine.process_event(db, current_user.id, GamificationEvent(event_type="email_classified", metadata={"email_id": email.id, "category": classification["category"]}))
    await db.commit()
    await db.refresh(email)

    return {"email_id": email.id, "category": email.ai_category, "confidence": email.ai_confidence, "extracted_data": email.ai_extracted_data}
