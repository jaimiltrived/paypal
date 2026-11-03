import json
from app.models.order import Order


def test_create_and_send_invoice(client, operator_headers):
    # 1. Create SKU first
    sku_resp = client.post(
        "/api/v1/skus",
        headers=operator_headers,
        json={
            "sku_code": "SKU-INV-01",
            "name": "Consulting Hour",
            "price_cents": 15000,  # $150.00
            "stock_quantity": 50,
        },
    )
    sku_id = sku_resp.json()["data"]["id"]

    # 2. Create Invoice with 2 hours
    inv_resp = client.post(
        "/api/v1/invoices",
        headers=operator_headers,
        json={
            "currency": "USD",
            "items": [
                {
                    "sku_id": sku_id,
                    "name": "Consulting Hour",
                    "quantity": 2,
                    "unit_price_cents": 15000,
                }
            ],
            "notes": "Net 30 payment terms",
        },
    )
    assert inv_resp.status_code == 200
    inv_data = inv_resp.json()["data"]
    assert inv_data["total_amount_cents"] == 30000  # 2 * 15000 = 30000 cents ($300.00)
    assert inv_data["status"] == "DRAFT"
    invoice_id = inv_data["id"]

    # 3. Send invoice
    send_resp = client.post(f"/api/v1/invoices/{invoice_id}/send", headers=operator_headers)
    assert send_resp.status_code == 200
    assert send_resp.json()["data"]["status"] == "SENT"
    assert send_resp.json()["data"]["issued_date"] is not None


def test_pay_invoice_with_completed_order(client, operator_headers, db_session):
    # Setup SKU
    sku_resp = client.post(
        "/api/v1/skus",
        headers=operator_headers,
        json={
            "sku_code": "SKU-ITEM-INV",
            "name": "Physical Widget",
            "price_cents": 5000,
            "stock_quantity": 10,
        },
    )
    sku_id = sku_resp.json()["data"]["id"]

    # Setup Invoice for 2 widgets = 10000 cents
    inv_resp = client.post(
        "/api/v1/invoices",
        headers=operator_headers,
        json={
            "currency": "USD",
            "items": [
                {"sku_id": sku_id, "name": "Physical Widget", "quantity": 2, "unit_price_cents": 5000}
            ],
        },
    )
    invoice_id = inv_resp.json()["data"]["id"]

    # Setup Completed Order matching invoice amount (10000 cents)
    order = Order(
        paypal_order_id="PP-ORD-INV-MATCH",
        amount_cents=10000,
        currency="USD",
        status="COMPLETED",
        capture_id="CAP-INV-MATCH",
    )
    db_session.add(order)
    db_session.commit()

    # Pay invoice
    pay_resp = client.post(
        f"/api/v1/invoices/{invoice_id}/pay",
        headers=operator_headers,
        json={"order_id": order.id},
    )
    assert pay_resp.status_code == 200
    paid_inv = pay_resp.json()["data"]
    assert paid_inv["status"] == "PAID"
    assert paid_inv["order_id"] == order.id

    # Verify inventory was decremented (10 - 2 = 8)
    sku_check = client.get(f"/api/v1/skus/{sku_id}", headers=operator_headers)
    assert sku_check.json()["data"]["stock_quantity"] == 8


def test_pay_invoice_mismatched_amount_rejected(client, operator_headers, db_session):
    inv_resp = client.post(
        "/api/v1/invoices",
        headers=operator_headers,
        json={
            "currency": "USD",
            "items": [{"name": "Custom Service", "quantity": 1, "unit_price_cents": 2000}],
        },
    )
    invoice_id = inv_resp.json()["data"]["id"]

    # Order has 5000 cents, but invoice has 2000 cents
    order = Order(amount_cents=5000, status="COMPLETED")
    db_session.add(order)
    db_session.commit()

    pay_resp = client.post(
        f"/api/v1/invoices/{invoice_id}/pay",
        headers=operator_headers,
        json={"order_id": order.id},
    )
    assert pay_resp.status_code == 400
    assert "does not match invoice amount" in pay_resp.json()["error"]["message"]


def test_cancel_invoice(client, operator_headers):
    inv_resp = client.post(
        "/api/v1/invoices",
        headers=operator_headers,
        json={
            "currency": "USD",
            "items": [{"name": "Cancelled Service", "quantity": 1, "unit_price_cents": 1000}],
        },
    )
    invoice_id = inv_resp.json()["data"]["id"]

    cancel_resp = client.post(f"/api/v1/invoices/{invoice_id}/cancel", headers=operator_headers)
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["data"]["status"] == "CANCELLED"

