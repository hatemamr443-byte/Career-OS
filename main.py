"""FastAPI application main entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import init_db
from app.routers import auth, jobs, emails, gamification, profile
from app.redis_client import redis_client
from app.middleware import RateLimitMiddleware

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await redis_client.close()

app = FastAPI(
    title="Career OS API",
    description="AI Career Decision Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.APP_URL, "https://career-os.app", "http://localhost:3000", "http://localhost:19006"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware)

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(emails.router)
app.include_router(gamification.router)
app.include_router(profile.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/")
async def root():
    return {"name": "Career OS API", "version": "1.0.0", "docs": "/docs", "health": "/health"}
