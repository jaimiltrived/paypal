from app.models.order import Order
from app.models.refund import Refund


def test_ledger_summary_and_transactions(client, admin_headers, db_session):
    # Completed Order: $120.00 (12000 cents)
    order = Order(
        paypal_order_id="LEDGER-ORD-1",
        amount_cents=12000,
        currency="USD",
        status="COMPLETED",
        capture_id="CAP-LEDGER-1",
    )
    db_session.add(order)
    db_session.commit()

    # Completed Refund: $20.00 (2000 cents)
    refund = Refund(
        order_id=order.id,
        paypal_refund_id="LEDGER-REF-1",
        amount_cents=2000,
        currency="USD",
        status="COMPLETED",
        reason="Partial return",
    )
    db_session.add(refund)
    db_session.commit()

    # 1. Test Ledger Summary
    summary_resp = client.get("/api/v1/ledger/summary", headers=admin_headers)
    assert summary_resp.status_code == 200
    summary = summary_resp.json()["data"]
    assert summary["total_sales_cents"] == 12000
    assert summary["total_refunded_cents"] == 2000
    assert summary["net_revenue_cents"] == 10000
    assert summary["order_count"] == 1
    assert summary["refund_count"] == 1

    # 2. Test Ledger Transactions
    tx_resp = client.get("/api/v1/ledger/transactions", headers=admin_headers)
    assert tx_resp.status_code == 200
    tx_data = tx_resp.json()
    assert tx_data["total"] == 2
    types = {item["transaction_type"] for item in tx_data["items"]}
    assert "CREDIT" in types
    assert "DEBIT" in types


def test_audit_logs_endpoint(client, admin_headers, db_session):
    from app.services.audit_service import AuditService
    audit = AuditService(db_session)
    audit.log_action(
        action="TEST_ACTION",
        entity_type="order",
        entity_id="ORD-TEST-999",
    )

    resp = client.get("/api/v1/ledger/audit-logs", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1

