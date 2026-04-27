# Career OS API Documentation

## Base URL
```
https://api.career-os.app
```

## Authentication

All endpoints (except auth) require Bearer token in Authorization header.

### Register
```
POST /auth/register
Body: { "email": "user@example.com", "password": "min8chars", "first_name": "John", "last_name": "Doe" }
```

### Login
```
POST /auth/login
Body: { "email": "user@example.com", "password": "password" }
Response: { "access_token": "...", "refresh_token": "...", "token_type": "bearer", "expires_in": 1800 }
```

### Refresh Token
```
POST /auth/refresh
Body: { "refresh_token": "..." }
```

## Jobs

### List Jobs
```
GET /jobs?status=new&page=1&page_size=20
Headers: Authorization: Bearer <token>
```

### Create Job
```
POST /jobs
Body: {
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "Remote",
  "description": "Job description...",
  "requirements": "Requirements...",
  "salary_min": 80000,
  "salary_max": 120000,
  "job_type": "full-time",
  "remote_status": "remote",
  "url": "https://example.com/job"
}
```

### Score Job (AI)
```
POST /jobs/score
Body: { "job_id": 1 }
Response: {
  "job_id": 1,
  "score": 82,
  "decision": "APPLY",
  "reasoning": {
    "strengths": ["Python", "FastAPI"],
    "gaps": ["Cloud missing"],
    "risk": "medium",
    "next_step": "Improve CV before applying"
  },
  "tags": ["remote", "senior", "python"],
  "interview_probability": 0.75,
  "offer_probability": 0.45
}
```

### Apply to Job
```
POST /jobs/apply
Body: { "job_id": 1, "notes": "Applied via company website" }
```

### Skip Job
```
POST /jobs/skip
Body: { "job_id": 1, "notes": "Salary too low" }
```

## Emails

### List Emails
```
GET /emails?category=interview&page=1&page_size=20
```

### Create Email
```
POST /emails
Body: {
  "sender": "recruiter@company.com",
  "subject": "Interview Invitation",
  "body": "Email body...",
  "received_at": "2024-01-15T10:00:00Z"
}
```

### Classify Email (AI)
```
POST /emails/classify
Body: { "email_id": 1 }
Response: {
  "email_id": 1,
  "category": "interview",
  "confidence": 0.95,
  "extracted_data": {
    "company": "Tech Corp",
    "position": "Software Engineer",
    "date": "2024-01-20",
    "next_steps": "Reply to confirm"
  }
}
```

## Gamification

### Get Profile
```
GET /gamification/me
Response: {
  "id": 1,
  "user_id": 1,
  "xp": 350,
  "level": 3,
  "streak_days": 5,
  "longest_streak": 12,
  "total_jobs_applied": 10,
  "total_jobs_skipped": 3,
  "total_emails_processed": 8,
  "badges": ["first_application", "week_warrior"],
  "next_level_xp": 600,
  "xp_to_next_level": 250
}
```

### Post Event
```
POST /gamification/events
Body: {
  "event_type": "job_applied",
  "metadata": { "job_id": 1 }
}
```

### Get Activities
```
GET /gamification/activities?page=1&page_size=20
```

### Get Badges
```
GET /gamification/badges
```

## Profile

### Get Profile
```
GET /profile
```

### Update Profile
```
PUT /profile
Body: {
  "title": "Senior Developer",
  "summary": "Experienced full-stack developer...",
  "skills": ["Python", "React", "Node.js"],
  "experience_years": 5,
  "preferred_location": "Remote",
  "preferred_salary_min": 100000,
  "preferred_salary_max": 150000,
  "remote_preference": "remote",
  "linkedin_url": "https://linkedin.com/in/...",
  "portfolio_url": "https://portfolio.com"
}
```

## Error Responses

```json
{
  "detail": "Error message",
  "status_code": 400
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Rate Limited
- 500: Server Error
