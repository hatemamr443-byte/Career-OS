"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=True),
        sa.Column('last_name', sa.String(length=100), nullable=True),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('stripe_customer_id', sa.String(length=100), nullable=True),
        sa.Column('stripe_subscription_id', sa.String(length=100), nullable=True),
        sa.Column('ai_requests_used', sa.Integer(), nullable=True),
        sa.Column('ai_requests_limit', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    op.create_table('user_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('skills', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('experience_years', sa.Integer(), nullable=True),
        sa.Column('preferred_location', sa.String(length=200), nullable=True),
        sa.Column('preferred_salary_min', sa.Integer(), nullable=True),
        sa.Column('preferred_salary_max', sa.Integer(), nullable=True),
        sa.Column('remote_preference', sa.String(length=50), nullable=True),
        sa.Column('resume_url', sa.String(length=500), nullable=True),
        sa.Column('linkedin_url', sa.String(length=500), nullable=True),
        sa.Column('portfolio_url', sa.String(length=500), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )

    op.create_table('jobs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('external_id', sa.String(length=255), nullable=True),
        sa.Column('title', sa.String(length=300), nullable=False),
        sa.Column('company', sa.String(length=200), nullable=False),
        sa.Column('location', sa.String(length=200), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('requirements', sa.Text(), nullable=True),
        sa.Column('salary_min', sa.Integer(), nullable=True),
        sa.Column('salary_max', sa.Integer(), nullable=True),
        sa.Column('salary_currency', sa.String(length=10), nullable=True),
        sa.Column('job_type', sa.String(length=50), nullable=True),
        sa.Column('remote_status', sa.String(length=50), nullable=True),
        sa.Column('url', sa.String(length=1000), nullable=True),
        sa.Column('posted_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ai_score', sa.Integer(), nullable=True),
        sa.Column('ai_decision', sa.String(length=20), nullable=True),
        sa.Column('ai_reasoning', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ai_tags', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('interview_probability', sa.Float(), nullable=True),
        sa.Column('offer_probability', sa.Float(), nullable=True),
        sa.Column('user_status', sa.String(length=20), nullable=True),
        sa.Column('user_notes', sa.Text(), nullable=True),
        sa.Column('applied_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('skipped_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_jobs_external_id'), 'jobs', ['external_id'], unique=False)
    op.create_index(op.f('ix_jobs_id'), 'jobs', ['id'], unique=False)
    op.create_index('idx_jobs_user_status', 'jobs', ['user_id', 'user_status'], unique=False)
    op.create_index('idx_jobs_ai_score', 'jobs', ['ai_score'], unique=False)

    op.create_table('emails',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('sender', sa.String(length=255), nullable=False),
        sa.Column('subject', sa.String(length=500), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('received_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ai_category', sa.String(length=50), nullable=True),
        sa.Column('ai_confidence', sa.Float(), nullable=True),
        sa.Column('ai_extracted_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=True),
        sa.Column('user_category', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_emails_user_category', 'emails', ['user_id', 'ai_category'], unique=False)

    op.create_table('gamification_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('xp', sa.Integer(), nullable=True),
        sa.Column('level', sa.Integer(), nullable=True),
        sa.Column('streak_days', sa.Integer(), nullable=True),
        sa.Column('longest_streak', sa.Integer(), nullable=True),
        sa.Column('last_activity_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('total_jobs_applied', sa.Integer(), nullable=True),
        sa.Column('total_jobs_skipped', sa.Integer(), nullable=True),
        sa.Column('total_emails_processed', sa.Integer(), nullable=True),
        sa.Column('badges', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )

    op.create_table('badge_definitions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('icon', sa.String(length=100), nullable=False),
        sa.Column('condition_type', sa.String(length=50), nullable=False),
        sa.Column('condition_value', sa.Integer(), nullable=False),
        sa.Column('xp_reward', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    op.create_table('user_activities',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('activity_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('xp_earned', sa.Integer(), nullable=True),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_activities_user_date', 'user_activities', ['user_id', 'created_at'], unique=False)

    op.create_table('subscription_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('stripe_price_id', sa.String(length=100), nullable=False),
        sa.Column('price_monthly', sa.Integer(), nullable=False),
        sa.Column('features', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ai_requests_limit', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('stripe_price_id')
    )

    # Seed badge definitions
    op.bulk_insert('badge_definitions', [
        {'name': 'first_application', 'description': 'Applied to your first job', 'icon': '📝', 'condition_type': 'jobs_applied', 'condition_value': 1, 'xp_reward': 50},
        {'name': 'serial_applier', 'description': 'Applied to 10 jobs', 'icon': '🚀', 'condition_type': 'jobs_applied', 'condition_value': 10, 'xp_reward': 100},
        {'name': 'job_hunter', 'description': 'Applied to 50 jobs', 'icon': '🎯', 'condition_type': 'jobs_applied', 'condition_value': 50, 'xp_reward': 250},
        {'name': 'career_champion', 'description': 'Applied to 100 jobs', 'icon': '🏆', 'condition_type': 'jobs_applied', 'condition_value': 100, 'xp_reward': 500},
        {'name': 'week_warrior', 'description': '7-day activity streak', 'icon': '🔥', 'condition_type': 'streak_days', 'condition_value': 7, 'xp_reward': 100},
        {'name': 'month_master', 'description': '30-day activity streak', 'icon': '⚡', 'condition_type': 'streak_days', 'condition_value': 30, 'xp_reward': 500},
        {'name': 'email_ninja', 'description': 'Processed 20 emails', 'icon': '📧', 'condition_type': 'emails_processed', 'condition_value': 20, 'xp_reward': 100},
        {'name': 'decision_maker', 'description': 'Scored 25 jobs with AI', 'icon': '🧠', 'condition_type': 'jobs_scored', 'condition_value': 25, 'xp_reward': 150},
    ])


def downgrade() -> None:
    op.drop_table('subscription_plans')
    op.drop_table('user_activities')
    op.drop_table('badge_definitions')
    op.drop_table('gamification_profiles')
    op.drop_index('idx_emails_user_category', table_name='emails')
    op.drop_table('emails')
    op.drop_index('idx_jobs_ai_score', table_name='jobs')
    op.drop_index('idx_jobs_user_status', table_name='jobs')
    op.drop_index(op.f('ix_jobs_id'), table_name='jobs')
    op.drop_index(op.f('ix_jobs_external_id'), table_name='jobs')
    op.drop_table('jobs')
    op.drop_table('user_profiles')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
