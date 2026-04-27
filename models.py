"""SQLAlchemy database models."""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, 
    ForeignKey, Float, JSON, Enum, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    ADMIN = "admin"


class JobDecision(str, enum.Enum):
    APPLY = "APPLY"
    SKIP = "SKIP"
    REVIEW = "REVIEW"


class EmailCategory(str, enum.Enum):
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTION = "rejection"
    NEGOTIATION = "negotiation"
    OTHER = "other"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    role = Column(String(20), default=UserRole.FREE.value, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    stripe_customer_id = Column(String(100), nullable=True)
    stripe_subscription_id = Column(String(100), nullable=True)
    ai_requests_used = Column(Integer, default=0)
    ai_requests_limit = Column(Integer, default=50)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")
    emails = relationship("Email", back_populates="user", cascade="all, delete-orphan")
    gamification = relationship("GamificationProfile", back_populates="user", uselist=False)
    activities = relationship("UserActivity", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    title = Column(String(200), nullable=True)
    summary = Column(Text, nullable=True)
    skills = Column(JSON, default=list)
    experience_years = Column(Integer, nullable=True)
    preferred_location = Column(String(200), nullable=True)
    preferred_salary_min = Column(Integer, nullable=True)
    preferred_salary_max = Column(Integer, nullable=True)
    remote_preference = Column(String(50), nullable=True)
    resume_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="profile")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    external_id = Column(String(255), nullable=True, index=True)
    title = Column(String(300), nullable=False)
    company = Column(String(200), nullable=False)
    location = Column(String(200), nullable=True)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    salary_currency = Column(String(10), default="USD")
    job_type = Column(String(50), nullable=True)
    remote_status = Column(String(50), nullable=True)
    url = Column(String(1000), nullable=True)
    posted_date = Column(DateTime(timezone=True), nullable=True)

    ai_score = Column(Integer, nullable=True)
    ai_decision = Column(String(20), nullable=True)
    ai_reasoning = Column(JSON, nullable=True)
    ai_tags = Column(JSON, default=list)
    interview_probability = Column(Float, nullable=True)
    offer_probability = Column(Float, nullable=True)

    user_status = Column(String(20), default="new")
    user_notes = Column(Text, nullable=True)
    applied_at = Column(DateTime(timezone=True), nullable=True)
    skipped_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="jobs")

    __table_args__ = (
        Index('idx_jobs_user_status', 'user_id', 'user_status'),
        Index('idx_jobs_ai_score', 'ai_score'),
    )


class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=False)
    body = Column(Text, nullable=False)
    received_at = Column(DateTime(timezone=True), nullable=False)

    ai_category = Column(String(50), nullable=True)
    ai_confidence = Column(Float, nullable=True)
    ai_extracted_data = Column(JSON, nullable=True)

    is_read = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    user_category = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="emails")

    __table_args__ = (
        Index('idx_emails_user_category', 'user_id', 'ai_category'),
    )


class GamificationProfile(Base):
    __tablename__ = "gamification_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak_days = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(DateTime(timezone=True), nullable=True)
    total_jobs_applied = Column(Integer, default=0)
    total_jobs_skipped = Column(Integer, default=0)
    total_emails_processed = Column(Integer, default=0)
    badges = Column(JSON, default=list)

    user = relationship("User", back_populates="gamification")


class BadgeDefinition(Base):
    __tablename__ = "badge_definitions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(100), nullable=False)
    condition_type = Column(String(50), nullable=False)
    condition_value = Column(Integer, nullable=False)
    xp_reward = Column(Integer, default=0)


class UserActivity(Base):
    __tablename__ = "user_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    activity_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    xp_earned = Column(Integer, default=0)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="activities")

    __table_args__ = (
        Index('idx_activities_user_date', 'user_id', 'created_at'),
    )


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    stripe_price_id = Column(String(100), unique=True, nullable=False)
    price_monthly = Column(Integer, nullable=False)
    features = Column(JSON, default=list)
    ai_requests_limit = Column(Integer, default=50)
    is_active = Column(Boolean, default=True)
