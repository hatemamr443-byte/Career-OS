"""Seed initial data."""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.models import BadgeDefinition, SubscriptionPlan

async def seed_badges():
    async with AsyncSessionLocal() as db:
        badges = [
            BadgeDefinition(name='first_application', description='Applied to your first job', icon='📝', condition_type='jobs_applied', condition_value=1, xp_reward=50),
            BadgeDefinition(name='serial_applier', description='Applied to 10 jobs', icon='🚀', condition_type='jobs_applied', condition_value=10, xp_reward=100),
            BadgeDefinition(name='job_hunter', description='Applied to 50 jobs', icon='🎯', condition_type='jobs_applied', condition_value=50, xp_reward=250),
            BadgeDefinition(name='career_champion', description='Applied to 100 jobs', icon='🏆', condition_type='jobs_applied', condition_value=100, xp_reward=500),
            BadgeDefinition(name='week_warrior', description='7-day activity streak', icon='🔥', condition_type='streak_days', condition_value=7, xp_reward=100),
            BadgeDefinition(name='month_master', description='30-day activity streak', icon='⚡', condition_type='streak_days', condition_value=30, xp_reward=500),
            BadgeDefinition(name='email_ninja', description='Processed 20 emails', icon='📧', condition_type='emails_processed', condition_value=20, xp_reward=100),
            BadgeDefinition(name='decision_maker', description='Scored 25 jobs with AI', icon='🧠', condition_type='jobs_scored', condition_value=25, xp_reward=150),
        ]
        for badge in badges:
            db.add(badge)

        plans = [
            SubscriptionPlan(name='Free', stripe_price_id='price_free', price_monthly=0, features=['50 AI requests/month', 'Basic job scoring', 'Email classification'], ai_requests_limit=50),
            SubscriptionPlan(name='Pro', stripe_price_id='price_pro_placeholder', price_monthly=1999, features=['Unlimited AI requests', 'Advanced analytics', 'Priority support', 'Custom job alerts'], ai_requests_limit=999999),
        ]
        for plan in plans:
            db.add(plan)

        await db.commit()
        print("✅ Seed data inserted")

if __name__ == "__main__":
    asyncio.run(seed_badges())
