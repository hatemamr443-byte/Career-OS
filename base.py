"""Base AI service interface."""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseAIService(ABC):
    @abstractmethod
    async def score_job(self, job_description: str, job_requirements: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        pass
    @abstractmethod
    async def predict_interview_probability(self, job_description: str, user_profile: Dict[str, Any]) -> float:
        pass
    @abstractmethod
    async def classify_email(self, email_subject: str, email_body: str) -> Dict[str, Any]:
        pass
