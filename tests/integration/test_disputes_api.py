from unittest.mock import AsyncMock, patch
from app.models.order import Order


def test_sync_disputes_from_paypal(client, operator_headers, db_session):
    order = Order(
        paypal_order_id="PP-ORD-DISPUTED-1",
        amount_cents=7500,
        currency="USD",
        status="COMPLETED",
        capture_id="CAP-DISP-1",
    )
    db_session.add(order)
    db_session.commit()

    mock_paypal_disputes = {
        "items": [
            {
                "dispute_id": "PP-DISP-9999",
                "status": "OPEN",
                "reason": "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
                "dispute_amount": {"value": "75.00", "currency_code": "USD"},
                "disputed_transactions": [
                    {
                        "seller_transaction_id": "CAP-DISP-1",
                    }
                ],
            }
        ]
    }

    with patch("app.services.dispute_service.PayPalClient.list_disputes", new_callable=AsyncMock) as mock_list:
        mock_list.return_value = mock_paypal_disputes

        resp = client.post("/api/v1/disputes/sync", headers=operator_headers)
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["synced_count"] == 1
        assert data["items"][0]["paypal_dispute_id"] == "PP-DISP-9999"
        assert data["items"][0]["dispute_amount_cents"] == 7500
        assert data["items"][0]["status"] == "OPEN"


def test_submit_dispute_evidence(client, operator_headers, db_session):
    from app.models.dispute import Dispute

    order = Order(amount_cents=5000, status="COMPLETED")
    db_session.add(order)
    db_session.commit()

    dispute = Dispute(
        paypal_dispute_id="PP-DISP-EVID-1",
        order_id=order.id,
        status="OPEN",
        dispute_amount_cents=5000,
        currency="USD",
    )
    db_session.add(dispute)
    db_session.commit()
    db_session.refresh(dispute)

    with patch("app.services.dispute_service.PayPalClient.provide_dispute_evidence", new_callable=AsyncMock) as mock_ev:
        mock_ev.return_value = {}

        resp = client.post(
            f"/api/v1/disputes/{dispute.id}/evidence",
            headers=operator_headers,
            json={
                "note": "Package tracking confirms successful delivery to customer address.",
                "evidence_type": "PROOF_OF_DELIVERY",
            },
        )
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["status"] == "UNDER_REVIEW"
        assert "confirms successful delivery" in data["evidence_summary"]


def test_accept_dispute_claim(client, operator_headers, db_session):
    from app.models.dispute import Dispute

    order = Order(amount_cents=3000, status="COMPLETED")
    db_session.add(order)
    db_session.commit()

    dispute = Dispute(
        paypal_dispute_id="PP-DISP-ACCEPT-1",
        order_id=order.id,
        status="OPEN",
        dispute_amount_cents=3000,
        currency="USD",
    )
    db_session.add(dispute)
    db_session.commit()
    db_session.refresh(dispute)


    with patch("app.services.dispute_service.PayPalClient.accept_dispute_claim", new_callable=AsyncMock) as mock_acc:
        mock_acc.return_value = {}

        resp = client.post(
            f"/api/v1/disputes/{dispute.id}/accept",
            headers=operator_headers,
            json={"note": "Seller agreed to accept customer return request."},
        )
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["status"] == "RESOLVED"
        assert data["outcome"] == "ACCEPTED"


def test_webhook_dispute_created(client, db_session):
    order = Order(amount_cents=6000, status="COMPLETED")
    db_session.add(order)
    db_session.commit()

    webhook_payload = {
        "id": "WH-DISP-EV-01",
        "event_type": "CUSTOMER.DISPUTE.CREATED",
        "resource_type": "dispute",
        "summary": "Customer opened dispute",
        "resource": {
            "dispute_id": "PP-DISP-WH-1",
            "status": "OPEN",
            "reason": "UNAUTHORISED",
            "dispute_amount": {"value": "60.00", "currency_code": "USD"},
        },
    }

    resp = client.post("/api/v1/webhooks/paypal", json=webhook_payload)
    assert resp.status_code == 200

    from app.models.dispute import Dispute
    dispute = db_session.query(Dispute).filter(Dispute.paypal_dispute_id == "PP-DISP-WH-1").first()
    assert dispute is not None
    assert dispute.status == "OPEN"
    assert dispute.dispute_amount_cents == 6000
