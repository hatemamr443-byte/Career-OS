"""Middleware for rate limiting and request tracking."""
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import get_settings
from app.redis_client import redis_client

settings = get_settings()

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware per user/plan."""

    async def dispatch(self, request: Request, call_next):
        if request.url.path in ['/health', '/', '/auth/login', '/auth/register', '/docs', '/redoc', '/openapi.json']:
            return await call_next(request)

        auth_header = request.headers.get('authorization', '')
        if auth_header.startswith('Bearer '):
            client_id = auth_header.split(' ')[1][:32]
        else:
            client_id = request.client.host if request.client else 'unknown'

        key = f"rate_limit:{client_id}"
        current = await redis_client.incr(key)
        if current == 1:
            await redis_client.expire(key, 60)

        if current > settings.RATE_LIMIT_PER_MINUTE:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")

        response = await call_next(request)
        response.headers['X-RateLimit-Limit'] = str(settings.RATE_LIMIT_PER_MINUTE)
        response.headers['X-RateLimit-Remaining'] = str(max(0, settings.RATE_LIMIT_PER_MINUTE - current))
        return response
