from fastapi import APIRouter

from app.api.v1.endpoints import (
    ai,
    auth,
    disputes,
    health,
    invoices,
    judge,
    ledger,
    orders,
    paypal,
    payouts,
    pending_actions,
    refunds,
    skus,
    webhooks,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(paypal.router, prefix="/paypal", tags=["PayPal Gateway"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(refunds.router, prefix="/refunds", tags=["Refunds"])
api_router.include_router(payouts.router, prefix="/payouts", tags=["Payouts"])
api_router.include_router(skus.router, prefix="/skus", tags=["SKU Management"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["Invoice Management"])
api_router.include_router(disputes.router, prefix="/disputes", tags=["Dispute Management"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Document Extraction & Chat"])
api_router.include_router(judge.router, prefix="/judge", tags=["Judge Mode"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
api_router.include_router(ledger.router, prefix="/ledger", tags=["Ledger & Audit"])
api_router.include_router(pending_actions.router, prefix="/actions/pending", tags=["Pending Actions"])
