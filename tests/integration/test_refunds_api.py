from unittest.mock import AsyncMock, patch
from app.models.order import Order


def test_standard_refund_execution(client, operator_headers, db_session):
    order = Order(
        paypal_order_id="PP-ORD-REF-1",
        amount_cents=8000,  # $80.00
        currency="USD",
        status="COMPLETED",
        capture_id="CAP-REF-1",
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)

    mock_pp_refund = {
        "id": "REF-PP-001",
        "status": "COMPLETED",
        "amount": {"value": "40.00", "currency_code": "USD"},
    }

    with patch("app.services.refund_service.PayPalClient.refund_capture", new_callable=AsyncMock) as mock_refund:
        mock_refund.return_value = mock_pp_refund

        response = client.post(
            "/api/v1/refunds",
            headers=operator_headers,
            json={
                "order_id": order.id,
                "amount_cents": 4000,  # $40.00 (< $100 threshold)
                "reason": "Customer requested partial refund",
            },
        )

        assert response.status_code == 200
        res = response.json()["data"]
        assert res["status"] == "COMPLETED"
        assert res["amount_cents"] == 4000
        assert res["refund_id"] is not None


def test_sensitive_high_value_refund_requires_confirmation(client, operator_headers, admin_headers, db_session):
    # Order for $250.00
    order = Order(
        paypal_order_id="PP-ORD-HIGH-1",
        amount_cents=25000,
        currency="USD",
        status="COMPLETED",
        capture_id="CAP-HIGH-1",
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)

    # 1. Operator requests $150.00 refund (>= $100 threshold)
    resp = client.post(
        "/api/v1/refunds",
        headers=operator_headers,
        json={
            "order_id": order.id,
            "amount_cents": 15000,
            "reason": "High-value chargeback dispute resolution",
        },
    )

    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["status"] == "PENDING_CONFIRMATION"
    pending_action_id = data["pending_action_id"]
    assert pending_action_id is not None

    # 2. Check pending actions list
    pending_resp = client.get("/api/v1/actions/pending", headers=operator_headers)
    assert pending_resp.status_code == 200
    assert pending_resp.json()["total"] >= 1

    # 3. Admin confirms the pending action
    mock_pp_refund = {
        "id": "REF-PP-HIGH-1",
        "status": "COMPLETED",
        "amount": {"value": "150.00", "currency_code": "USD"},
    }

    with patch("app.services.refund_service.PayPalClient.refund_capture", new_callable=AsyncMock) as mock_refund:
        mock_refund.return_value = mock_pp_refund

        confirm_resp = client.post(
            f"/api/v1/actions/pending/{pending_action_id}/confirm",
            headers=admin_headers,
        )
        assert confirm_resp.status_code == 200
        assert confirm_resp.json()["data"]["status"] == "CONFIRMED"


def test_refund_exceeding_order_rejected(client, operator_headers, db_session):
    order = Order(
        paypal_order_id="PP-ORD-EXCEED",
        amount_cents=3000,
        currency="USD",
        status="COMPLETED",
        capture_id="CAP-EXCEED",
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)

    resp = client.post(
        "/api/v1/refunds",
        headers=operator_headers,
        json={
            "order_id": order.id,
            "amount_cents": 5000,  # Exceeds 3000
        },
    )
    assert resp.status_code == 400
    assert "exceeds remaining refundable balance" in resp.json()["error"]["message"]


def test_standard_user_cannot_issue_refund(client, user_headers):
    resp = client.post(
        "/api/v1/refunds",
        headers=user_headers,
        json={"order_id": "dummy-id", "amount_cents": 1000},
    )
    assert resp.status_code == 403

