from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.order import Order
from app.models.refund import Refund
from app.models.payout import Payout
from app.schemas.ledger import LedgerSummaryResponse, LedgerTransaction


class LedgerService:
    def __init__(self, db: Session):
        self.db = db

    def get_ledger_summary(self) -> LedgerSummaryResponse:
        """Calculate high-level financial metrics from orders and refunds in integer cents."""
        # Total Sales: sum of completed orders
        sales_result = (
            self.db.query(
                func.coalesce(func.sum(Order.amount_cents), 0),
                func.count(Order.id),
            )
            .filter(Order.status == "COMPLETED")
            .first()
        )
        total_sales_cents = int(sales_result[0]) if sales_result else 0
        order_count = int(sales_result[1]) if sales_result else 0

        # Total Refunds: sum of completed refunds
        refund_result = (
            self.db.query(
                func.coalesce(func.sum(Refund.amount_cents), 0),
                func.count(Refund.id),
            )
            .filter(Refund.status == "COMPLETED")
            .first()
        )
        total_refunded_cents = int(refund_result[0]) if refund_result else 0
        refund_count = int(refund_result[1]) if refund_result else 0

        net_revenue_cents = total_sales_cents - total_refunded_cents

        return LedgerSummaryResponse(
            total_sales_cents=total_sales_cents,
            total_refunded_cents=total_refunded_cents,
            net_revenue_cents=net_revenue_cents,
            currency="USD",
            order_count=order_count,
            refund_count=refund_count,
        )

    def get_ledger_transactions(
        self,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[LedgerTransaction], int]:
        """Produce unified chronological double-entry style journal list."""
        # Fetch completed orders (Credits)
        completed_orders = (
            self.db.query(Order)
            .filter(Order.status == "COMPLETED")
            .all()
        )
        # Fetch completed refunds (Debits)
        completed_refunds = (
            self.db.query(Refund)
            .filter(Refund.status == "COMPLETED")
            .all()
        )
        # Fetch completed payouts (Debits)
        completed_payouts = (
            self.db.query(Payout)
            .filter(Payout.status == "SUCCESS")
            .all()
        )

        transactions: List[LedgerTransaction] = []

        for ord_item in completed_orders:
            transactions.append(
                LedgerTransaction(
                    id=f"TX-ORD-{ord_item.id}",
                    transaction_type="CREDIT",
                    order_id=ord_item.id,
                    external_reference=ord_item.capture_id or ord_item.paypal_order_id,
                    amount_cents=ord_item.amount_cents,
                    currency=ord_item.currency,
                    status="COMPLETED",
                    description=ord_item.description or "Order payment captured",
                    timestamp=ord_item.updated_at or ord_item.created_at,
                )
            )

        for ref_item in completed_refunds:
            transactions.append(
                LedgerTransaction(
                    id=f"TX-REF-{ref_item.id}",
                    transaction_type="DEBIT",
                    order_id=ref_item.order_id,
                    external_reference=ref_item.paypal_refund_id,
                    amount_cents=ref_item.amount_cents,
                    currency=ref_item.currency,
                    status=ref_item.status,
                    description=ref_item.reason or "Payment refund issued",
                    timestamp=ref_item.created_at,
                )
            )

        for p_item in completed_payouts:
            transactions.append(
                LedgerTransaction(
                    id=f"TX-PAY-{p_item.id}",
                    transaction_type="DEBIT",
                    order_id=p_item.payout_batch_id or p_item.id,
                    external_reference=p_item.payout_item_id,
                    amount_cents=p_item.amount_cents,
                    currency=p_item.currency,
                    status=p_item.status,
                    description=f"Partner disbursement: {p_item.recipient_email} ({p_item.note or ''})",
                    timestamp=p_item.created_at,
                )
            )

        # Sort all descending by timestamp
        transactions.sort(key=lambda x: x.timestamp, reverse=True)
        total = len(transactions)
        paged = transactions[skip : skip + limit]

        return paged, total
