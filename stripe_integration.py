"""Stripe integration for SaaS monetization."""
from typing import Optional
import stripe
from app.config import get_settings

settings = get_settings()

if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    """Stripe service for subscription management."""

    @staticmethod
    def create_customer(email: str, name: Optional[str] = None) -> str:
        if not settings.STRIPE_SECRET_KEY:
            raise ValueError("Stripe not configured")
        customer = stripe.Customer.create(email=email, name=name)
        return customer.id

    @staticmethod
    def create_subscription(customer_id: str, price_id: str) -> dict:
        if not settings.STRIPE_SECRET_KEY:
            raise ValueError("Stripe not configured")
        subscription = stripe.Subscription.create(
            customer=customer_id,
            items=[{"price": price_id}],
            payment_behavior="default_incomplete",
            expand=["latest_invoice.payment_intent"],
        )
        return subscription

    @staticmethod
    def cancel_subscription(subscription_id: str) -> dict:
        if not settings.STRIPE_SECRET_KEY:
            raise ValueError("Stripe not configured")
        return stripe.Subscription.delete(subscription_id)

    @staticmethod
    def construct_event(payload: bytes, sig_header: str) -> dict:
        if not settings.STRIPE_WEBHOOK_SECRET:
            raise ValueError("Webhook secret not configured")
        return stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
