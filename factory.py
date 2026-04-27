"""AI Service factory for provider swapping."""
from typing import Optional
from app.config import get_settings
from ai_services.base import BaseAIService
from ai_services.openai_service import OpenAIService

settings = get_settings()

class AIServiceFactory:
    _instance: Optional[BaseAIService] = None

    @classmethod
    def get_service(cls) -> BaseAIService:
        if cls._instance is None:
            provider = settings.DEFAULT_AI_PROVIDER.lower()
            if provider == "openai" and settings.OPENAI_API_KEY:
                cls._instance = OpenAIService()
            else:
                raise ValueError(f"AI provider '{provider}' not available")
        return cls._instance

    @classmethod
    def reset(cls):
        cls._instance = None
