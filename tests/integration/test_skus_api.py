def test_create_sku_success(client, operator_headers):
    resp = client.post(
        "/api/v1/skus",
        headers=operator_headers,
        json={
            "sku_code": "SKU-TEST-001",
            "name": "Cloud Subscription Basic",
            "description": "Monthly recurring SaaS license",
            "price_cents": 2999,  # $29.99
            "currency": "USD",
            "stock_quantity": 100,
        },
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["sku_code"] == "SKU-TEST-001"
    assert data["price_cents"] == 2999
    assert data["stock_quantity"] == 100
    assert data["is_active"] is True


def test_create_sku_duplicate_code_conflict(client, operator_headers):
    payload = {
        "sku_code": "SKU-DUP-1",
        "name": "Item 1",
        "price_cents": 1000,
        "stock_quantity": 10,
    }
    r1 = client.post("/api/v1/skus", headers=operator_headers, json=payload)
    assert r1.status_code == 200

    r2 = client.post("/api/v1/skus", headers=operator_headers, json=payload)
    assert r2.status_code == 409
    assert "already exists" in r2.json()["error"]["message"]


def test_create_sku_invalid_price_rejected(client, operator_headers):
    resp = client.post(
        "/api/v1/skus",
        headers=operator_headers,
        json={
            "sku_code": "SKU-BAD-PRICE",
            "name": "Bad Price Item",
            "price_cents": -100,
        },
    )
    assert resp.status_code == 422


def test_update_sku(client, operator_headers):
    # Create
    r = client.post(
        "/api/v1/skus",
        headers=operator_headers,
        json={
            "sku_code": "SKU-UPDATE-1",
            "name": "Old Name",
            "price_cents": 1500,
            "stock_quantity": 5,
        },
    )
    sku_id = r.json()["data"]["id"]

    # Update price and stock
    update_resp = client.put(
        f"/api/v1/skus/{sku_id}",
        headers=operator_headers,
        json={
            "name": "New Name",
            "price_cents": 1800,
            "stock_quantity": 25,
        },
    )
    assert update_resp.status_code == 200
    updated_data = update_resp.json()["data"]
    assert updated_data["name"] == "New Name"
    assert updated_data["price_cents"] == 1800
    assert updated_data["stock_quantity"] == 25


def test_standard_user_cannot_create_sku(client, user_headers):
    resp = client.post(
        "/api/v1/skus",
        headers=user_headers,
        json={
            "sku_code": "SKU-UNAUTH",
            "name": "Unauth Item",
            "price_cents": 500,
        },
    )
    assert resp.status_code == 403

