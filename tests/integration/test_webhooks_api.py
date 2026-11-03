from app.models.order import Order


def test_webhook_order_approved(client, db_session):
    order = Order(
        paypal_order_id="WH-ORDER-1",
        amount_cents=4500,
        currency="USD",
        status="CREATED",
    )
    db_session.add(order)
    db_session.commit()

    webhook_payload = {
        "id": "WH-EVENT-001",
        "event_type": "CHECKOUT.ORDER.APPROVED",
        "resource_type": "checkout-order",
        "summary": "An order has been approved by the buyer",
        "resource": {
            "id": "WH-ORDER-1",
            "status": "APPROVED",
        },
    }

    # First call: processes and updates order
    r1 = client.post("/api/v1/webhooks/paypal", json=webhook_payload)
    assert r1.status_code == 200
    assert r1.json()["processing_status"] == "PROCESSED"

    db_session.refresh(order)
    assert order.status == "APPROVED"

    # Second call with identical event ID: Idempotent deduplication
    r2 = client.post("/api/v1/webhooks/paypal", json=webhook_payload)
    assert r2.status_code == 200
    assert r2.json()["processing_status"] == "PROCESSED"


def test_webhook_capture_completed(client, db_session):
    order = Order(
        paypal_order_id="WH-ORDER-2",
        amount_cents=9900,
        currency="USD",
        status="APPROVED",
    )
    db_session.add(order)
    db_session.commit()

    webhook_payload = {
        "id": "WH-EVENT-002",
        "event_type": "PAYMENT.CAPTURE.COMPLETED",
        "resource_type": "capture",
        "summary": "Payment capture completed",
        "resource": {
            "id": "CAP-WH-2",
            "custom_id": order.id,
            "status": "COMPLETED",
            "amount": {"value": "99.00", "currency_code": "USD"},
        },
    }

    resp = client.post("/api/v1/webhooks/paypal", json=webhook_payload)
    assert resp.status_code == 200

    db_session.refresh(order)
    assert order.status == "COMPLETED"
    assert order.capture_id == "CAP-WH-2"

