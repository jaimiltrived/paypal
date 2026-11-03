from unittest.mock import AsyncMock, patch


def test_create_order_success(client, user_headers):
    mock_pp_response = {
        "id": "PP-ORDER-12345",
        "status": "CREATED",
        "links": [
            {
                "href": "https://www.sandbox.paypal.com/checkoutnow?token=PP-ORDER-12345",
                "rel": "approve",
                "method": "GET",
            }
        ],
    }

    with patch("app.services.order_service.PayPalClient.create_order", new_callable=AsyncMock) as mock_create:
        mock_create.return_value = mock_pp_response

        response = client.post(
            "/api/v1/orders",
            headers=user_headers,
            json={
                "amount_cents": 2500,  # $25.00
                "currency": "USD",
                "description": "Test SaaS Subscription",
            },
        )

        assert response.status_code == 200
        data = response.json()["data"]
        assert data["paypal_order_id"] == "PP-ORDER-12345"
        assert data["amount_cents"] == 2500
        assert data["currency"] == "USD"
        assert data["status"] == "CREATED"
        assert "sandbox.paypal.com" in data["approval_url"]


def test_create_order_negative_amount_rejected(client, user_headers):
    response = client.post(
        "/api/v1/orders",
        headers=user_headers,
        json={
            "amount_cents": -500,
            "currency": "USD",
        },
    )
    assert response.status_code == 422  # Pydantic validation rejected


def test_capture_order_success(client, user_headers, db_session):
    # Setup order in DB
    from app.models.order import Order
    order = Order(
        paypal_order_id="PP-ORDER-CAPTURE-1",
        amount_cents=5000,
        currency="USD",
        status="APPROVED",
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)

    mock_capture_response = {
        "id": "PP-ORDER-CAPTURE-1",
        "status": "COMPLETED",
        "purchase_units": [
            {
                "payments": {
                    "captures": [
                        {
                            "id": "CAPTURE-9999",
                            "status": "COMPLETED",
                            "amount": {"value": "50.00", "currency_code": "USD"},
                        }
                    ]
                }
            }
        ],
        "payer": {"email_address": "buyer@example.com"},
    }

    with patch("app.services.order_service.PayPalClient.capture_order", new_callable=AsyncMock) as mock_capture:
        mock_capture.return_value = mock_capture_response

        response = client.post(
            f"/api/v1/orders/{order.id}/capture",
            headers=user_headers,
        )

        assert response.status_code == 200
        res = response.json()["data"]
        assert res["status"] == "COMPLETED"
        assert res["capture_id"] == "CAPTURE-9999"
        assert res["amount_cents"] == 5000


def test_list_orders_filtering(client, admin_headers, db_session):
    from app.models.order import Order
    o1 = Order(amount_cents=1000, status="COMPLETED")
    o2 = Order(amount_cents=2000, status="CREATED")
    db_session.add_all([o1, o2])
    db_session.commit()

    resp = client.get("/api/v1/orders?status=COMPLETED", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["status"] == "COMPLETED"

