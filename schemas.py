"""Pydantic schemas for request/response validation."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenRefresh(BaseModel):
    refresh_token: str

class TokenPayload(BaseModel):
    sub: int
    exp: datetime
    type: str

class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str = "free"
    is_active: bool = True

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ai_requests_used: int
    ai_requests_limit: int
    created_at: datetime

class UserProfileBase(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    experience_years: Optional[int] = None
    preferred_location: Optional[str] = None
    preferred_salary_min: Optional[int] = None
    preferred_salary_max: Optional[int] = None
    remote_preference: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    updated_at: Optional[datetime] = None

class UserProfileUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[int] = None
    preferred_location: Optional[str] = None
    preferred_salary_min: Optional[int] = None
    preferred_salary_max: Optional[int] = None
    remote_preference: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

class JobBase(BaseModel):
    title: str = Field(..., max_length=300)
    company: str = Field(..., max_length=200)
    location: Optional[str] = None
    description: str
    requirements: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "USD"
    job_type: Optional[str] = None
    remote_status: Optional[str] = None
    url: Optional[str] = None

class JobCreate(JobBase):
    external_id: Optional[str] = None
    posted_date: Optional[datetime] = None

class AIReasoning(BaseModel):
    strengths: List[str]
    gaps: List[str]
    risk: str
    next_step: str

class JobAIResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    decision: str
    reasoning: AIReasoning
    tags: List[str]
    interview_probability: float = Field(..., ge=0, le=1)
    offer_probability: float = Field(..., ge=0, le=1)

class JobResponse(JobBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    external_id: Optional[str] = None
    ai_score: Optional[int] = None
    ai_decision: Optional[str] = None
    ai_reasoning: Optional[Dict[str, Any]] = None
    ai_tags: List[str] = []
    interview_probability: Optional[float] = None
    offer_probability: Optional[float] = None
    user_status: str
    user_notes: Optional[str] = None
    applied_at: Optional[datetime] = None
    skipped_at: Optional[datetime] = None
    created_at: datetime

class JobScoreRequest(BaseModel):
    job_id: int

class JobActionRequest(BaseModel):
    job_id: int
    notes: Optional[str] = None

class JobListResponse(BaseModel):
    items: List[JobResponse]
    total: int
    page: int
    page_size: int

class EmailBase(BaseModel):
    sender: str
    subject: str
    body: str
    received_at: datetime

class EmailCreate(EmailBase):
    pass

class EmailClassifyRequest(BaseModel):
    email_id: int

class EmailAIResponse(BaseModel):
    category: str
    confidence: float
    extracted_data: Dict[str, Any]

class EmailResponse(EmailBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    ai_category: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_extracted_data: Optional[Dict[str, Any]] = None
    is_read: bool
    is_archived: bool
    created_at: datetime

class EmailListResponse(BaseModel):
    items: List[EmailResponse]
    total: int
    page: int
    page_size: int

class GamificationProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    xp: int
    level: int
    streak_days: int
    longest_streak: int
    last_activity_date: Optional[datetime] = None
    total_jobs_applied: int
    total_jobs_skipped: int
    total_emails_processed: int
    badges: List[str]
    next_level_xp: int
    xp_to_next_level: int

class GamificationEvent(BaseModel):
    event_type: str = Field(..., pattern="^(job_applied|job_skipped|email_opened|profile_updated|streak_maintained|badge_earned)$")
    metadata: Optional[Dict[str, Any]] = None

class BadgeResponse(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    xp_reward: int
    earned_at: Optional[datetime] = None

class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    activity_type: str
    description: Optional[str] = None
    xp_earned: int
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

class DashboardStats(BaseModel):
    total_jobs: int
    jobs_applied: int
    jobs_skipped: int
    jobs_saved: int
    emails_processed: int
    interviews_scheduled: int
    offers_received: int
    avg_ai_score: Optional[float] = None
    current_streak: int
    level: int
    xp: int
    xp_to_next_level: int
    badges_count: int
