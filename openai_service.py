"""OpenAI implementation of AI service."""
import json, httpx
from typing import Dict, Any, Optional
from app.config import get_settings
from ai_services.base import BaseAIService

settings = get_settings()

class OpenAIService(BaseAIService):
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = "https://api.openai.com/v1"
        self.model = "gpt-4-turbo-preview"

    async def _call_api(self, messages: list, response_format: Optional[str] = None) -> str:
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = {"model": self.model, "messages": messages, "temperature": 0.3, "max_tokens": 2000}
        if response_format == "json":
            payload["response_format"] = {"type": "json_object"}
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]

    async def score_job(self, job_description: str, job_requirements: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""You are an expert career coach. Analyze this job against the candidate's profile.

JOB DESCRIPTION:
{job_description}

JOB REQUIREMENTS:
{job_requirements}

CANDIDATE PROFILE:
- Title: {user_profile.get('title', 'Not specified')}
- Skills: {', '.join(user_profile.get('skills', []))}
- Experience: {user_profile.get('experience_years', 0)} years
- Summary: {user_profile.get('summary', 'Not provided')}

Respond with JSON:
{{"score": <integer 0-100>, "decision": "APPLY" | "SKIP" | "REVIEW", "reasoning": {{"strengths": ["matching skills"], "gaps": ["missing requirements"], "risk": "low" | "medium" | "high", "next_step": "actionable advice"}}, "tags": ["relevant tags"], "interview_probability": <float 0.0-1.0>, "offer_probability": <float 0.0-1.0>}}"""
        response = await self._call_api([
            {"role": "system", "content": "You are a career decision intelligence system. Always respond with valid JSON."},
            {"role": "user", "content": prompt}
        ], response_format="json")
        return json.loads(response)

    async def predict_interview_probability(self, job_description: str, user_profile: Dict[str, Any]) -> float:
        result = await self.score_job(job_description, "", user_profile)
        return result.get("interview_probability", 0.5)

    async def classify_email(self, email_subject: str, email_body: str) -> Dict[str, Any]:
        prompt = f"""Classify this job-related email.

SUBJECT: {email_subject}
BODY:
{email_body[:3000]}

Respond with JSON:
{{"category": "interview" | "offer" | "rejection" | "negotiation" | "other", "confidence": <float 0.0-1.0>, "extracted_data": {{"company": "name if found", "position": "title if found", "date": "important date", "salary": "salary info", "next_steps": "action items", "contact_person": "recruiter name"}}}}"""
        response = await self._call_api([
            {"role": "system", "content": "You are an email classification system. Always respond with valid JSON."},
            {"role": "user", "content": prompt}
        ], response_format="json")
        return json.loads(response)
