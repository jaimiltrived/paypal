import json
from unittest.mock import AsyncMock, patch


def test_ai_status_endpoint(client, user_headers):
    mock_health = {
        "connected": True,
        "available_models": ["llama3.2:1b", "qwen2.5-vl:3b"],
    }
    with patch("app.ai.ollama_client.OllamaClient.check_health", new_callable=AsyncMock) as mock_chk:
        mock_chk.return_value = mock_health

        resp = client.get("/api/v1/ai/status", headers=user_headers)
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["ollama_connected"] is True
        assert "llama3.2:1b" in data["available_models"]
        assert "qwen2.5-vl:3b" in data["available_models"]


def test_extract_document_text_success(client, operator_headers):
    mock_ai_json = json.dumps(
        {
            "vendor_name": "Acme Cloud Services Inc.",
            "invoice_number": "INV-ACME-9021",
            "invoice_date": "2026-10-15",
            "due_date": "2026-11-15",
            "currency": "USD",
            "line_items": [
                {
                    "name": "Database Cluster Hosting",
                    "quantity": 2,
                    "unit_price": "45.00",
                    "line_total": "90.00",
                },
                {
                    "name": "Bandwidth Overage",
                    "quantity": 1,
                    "unit_price": "10.00",
                    "line_total": "10.00",
                },
            ],
            "subtotal": "100.00",
            "tax_amount": "8.50",
            "total_amount": "108.50",
            "notes": "Payment due within 30 days.",
        }
    )

    with patch("app.ai.ollama_client.OllamaClient.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = f"```json\n{mock_ai_json}\n```"

        resp = client.post(
            "/api/v1/ai/extract/document",
            headers=operator_headers,
            json={
                "document_text": "INVOICE #INV-ACME-9021\nVendor: Acme Cloud Services\nTotal: $108.50",
            },
        )
        assert resp.status_code == 200
        extracted = resp.json()["data"]
        assert extracted["vendor_name"] == "Acme Cloud Services Inc."
        assert extracted["invoice_number"] == "INV-ACME-9021"
        assert extracted["total_amount_cents"] == 10850  # $108.50 in cents
        assert extracted["subtotal_cents"] == 10000
        assert extracted["tax_amount_cents"] == 850
        assert extracted["is_arithmetic_valid"] is True
        assert len(extracted["line_items"]) == 2
        assert extracted["line_items"][0]["line_total_cents"] == 9000


def test_extract_and_create_invoice(client, operator_headers):
    mock_ai_json = json.dumps(
        {
            "vendor_name": "Global Office Supplies",
            "invoice_number": "GOS-8821",
            "currency": "USD",
            "line_items": [
                {
                    "name": "Ergonomic Keyboard",
                    "quantity": 1,
                    "unit_price": "120.00",
                    "line_total": "120.00",
                }
            ],
            "subtotal": "120.00",
            "tax_amount": "0.00",
            "total_amount": "120.00",
        }
    )

    with patch("app.ai.ollama_client.OllamaClient.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_ai_json

        resp = client.post(
            "/api/v1/ai/extract/to-invoice",
            headers=operator_headers,
            json={
                "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
            },
        )
        assert resp.status_code == 200
        invoice_data = resp.json()["data"]
        assert invoice_data["status"] == "DRAFT"
        assert invoice_data["total_amount_cents"] == 12000  # $120.00 in cents
        assert "GOS-8821" in invoice_data["metadata_json"]


def test_standard_user_forbidden_from_extraction(client, user_headers):
    resp = client.post(
        "/api/v1/ai/extract/document",
        headers=user_headers,
        json={"document_text": "Sample text"},
    )
    assert resp.status_code == 403

