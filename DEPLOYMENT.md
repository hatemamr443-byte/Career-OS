# Career OS - Deployment Guide

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL 15+ (database)
- Redis 7+ (cache/queues)
- Expo CLI (for mobile)
- EAS CLI (for Play Store builds)

## Environment Setup

### Backend

1. Copy `.env.example` to `.env` and fill in your values:
```bash
cd backend
cp .env.example .env
```

2. Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SECRET_KEY` - Strong random string for JWT
- `OPENAI_API_KEY` - Your OpenAI API key
- `STRIPE_SECRET_KEY` - Stripe secret key (for payments)

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
alembic upgrade head
```

5. Seed initial data:
```bash
python seed.py
```

6. Start server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Web App

1. Install dependencies:
```bash
cd web
npm install
```

2. Set environment:
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

3. Build:
```bash
npm run build
```

4. Deploy to Vercel:
```bash
vercel --prod
```

### Marketing Site

```bash
cd marketing-site
npm install
npm run build
# Deploy dist/ folder to Vercel or Netlify
```

### Mobile App

1. Install dependencies:
```bash
cd mobile
npm install
```

2. Configure API URL in `.env`:
```
API_URL=https://your-api-url.com
```

3. Build for Play Store:
```bash
eas build --platform android
```

4. Submit to Play Store via EAS Submit:
```bash
eas submit --platform android
```

## Deployment Platforms

### Backend (Render/Railway)

**Render:**
1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env`

**Railway:**
1. Create new project
2. Add PostgreSQL and Redis plugins
3. Deploy from GitHub
4. Set environment variables

### Frontend (Vercel)

1. Import GitHub repo
2. Set root directory: `web` or `marketing-site`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `NEXT_PUBLIC_API_URL` environment variable

## Google Play Store Submission

### Requirements
- Android App Bundle (AAB)
- Privacy Policy URL
- App screenshots (phone + tablet)
- Feature graphic (1024x500)
- App icon (512x512)

### Build AAB
```bash
cd mobile
eas build --platform android --profile production
```

### Submit
```bash
eas submit --platform android
```

## API Documentation

After starting the backend, visit:
- Swagger UI: `https://api.career-os.app/docs`
- ReDoc: `https://api.career-os.app/redoc`

## Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Use HTTPS only
- [ ] Enable CORS for production domains only
- [ ] Set up rate limiting
- [ ] Configure Stripe webhooks
- [ ] Enable database SSL
- [ ] Set up monitoring (Sentry/DataDog)

## Monitoring

Recommended tools:
- Sentry for error tracking
- DataDog or New Relic for APM
- UptimeRobot for health checks

## Support

For issues or questions:
- Email: support@career-os.app
- GitHub Issues: [your-repo]/issues
