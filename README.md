# Career OS — AI Career Decision Intelligence Platform

A complete production SaaS ecosystem with web dashboard, mobile app (Play Store ready), marketing website, gamification, and monetization.

## Architecture

```
career-os/
├── backend/          # FastAPI + PostgreSQL + Redis
├── web/              # Next.js Dashboard
├── mobile/           # React Native (Expo)
├── marketing-site/   # SEO Landing Page
└── docs/             # Documentation
```

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
alembic upgrade head
python seed.py
uvicorn app.main:app --reload
```

### Web Dashboard
```bash
cd web
npm install
npm run dev
```

### Mobile App
```bash
cd mobile
npm install
npx expo start
```

### Marketing Site
```bash
cd marketing-site
npm install
npm run dev
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy, PostgreSQL, Redis |
| Web | Next.js 14, Tailwind CSS, TypeScript |
| Mobile | React Native, Expo |
| AI | OpenAI GPT-4 (swappable) |
| Auth | JWT (access + refresh tokens) |
| Payments | Stripe (ready) |

## Features

- AI Job Scoring (0-100) with APPLY/SKIP/REVIEW decisions
- Interview & Offer probability prediction
- Email classification (Interview/Offer/Rejection/Negotiation)
- Gamification (XP, Levels, Streaks, Badges)
- Application tracking
- Profile management
- SaaS monetization (Free/Pro tiers)
- Rate limiting per plan

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Documentation](docs/API.md)
- [Mobile Build Guide](docs/MOBILE_BUILD.md)

## License

MIT
