import json
from unittest.mock import AsyncMock, patch
from app.models.order import Order


def test_list_ai_tools_role_filtering(client, admin_headers, user_headers):
    # Admin tools check
    resp_admin = client.get("/api/v1/ai/tools", headers=admin_headers)
    assert resp_admin.status_code == 200
    admin_tools = {t["name"] for t in resp_admin.json()["data"]}
    assert "propose_refund" in admin_tools
    assert "get_ledger_summary" in admin_tools

    # Standard user tools check
    resp_user = client.get("/api/v1/ai/tools", headers=user_headers)
    assert resp_user.status_code == 200
    user_tools = {t["name"] for t in resp_user.json()["data"]}
    assert "propose_refund" not in user_tools
    assert "get_ledger_summary" not in user_tools
    assert "query_orders" in user_tools


def test_chat_direct_reply_without_tools(client, user_headers):
    with patch("app.ai.ollama_client.OllamaClient.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = "Hello! I am PayOps AI. How can I help you today?"

        resp = client.post(
            "/api/v1/ai/chat",
            headers=user_headers,
            json={
                "messages": [{"role": "user", "content": "Hello!"}],
            },
        )
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["message"]["content"] == "Hello! I am PayOps AI. How can I help you today?"
        assert len(data["tool_calls"]) == 0
        assert len(data["tool_results"]) == 0


def test_chat_tool_execution_ledger_summary(client, admin_headers, db_session):
    # Completed order for $100.00
    order = Order(
        paypal_order_id="PP-CHAT-ORD-1",
        amount_cents=10000,
        currency="USD",
        status="COMPLETED",
        capture_id="CAP-CHAT-1",
    )
    db_session.add(order)
    db_session.commit()

    # Step 1: Model calls tool get_ledger_summary
    tool_call_json = json.dumps({
        "tool_call": {
            "name": "get_ledger_summary",
            "arguments": {},
        }
    })

    # Step 2: Model summarizes tool observation
    summary_text = "Currently, our gross sales stand at $100.00 across 1 order, with 0 refunds."

    with patch("app.ai.ollama_client.OllamaClient.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.side_effect = [
            f"```json\n{tool_call_json}\n```",
            summary_text,
        ]

        resp = client.post(
            "/api/v1/ai/chat",
            headers=admin_headers,
            json={
                "messages": [{"role": "user", "content": "What are our total sales and refunds?"}],
            },
        )
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert len(data["tool_calls"]) == 1
        assert data["tool_calls"][0]["name"] == "get_ledger_summary"

        assert len(data["tool_results"]) == 1
        res = data["tool_results"][0]
        assert res["status"] == "SUCCESS"
        assert res["output"]["total_sales_cents"] == 10000
        assert res["output"]["net_revenue_cents"] == 10000

        assert data["message"]["content"] == summary_text


def test_chat_tool_execution_sensitive_refund_enforces_pending_action(client, admin_headers, db_session):
    order = Order(
        paypal_order_id="PP-CHAT-HIGH",
        amount_cents=20000,  # $200.00
        currency="USD",
        status="COMPLETED",
        capture_id="CAP-CHAT-HIGH",
    )
    db_session.add(order)
    db_session.commit()

    # Model attempts high value refund tool call ($150 = 15000 cents >= 10000 cents threshold)
    tool_call_json = json.dumps({
        "tool_call": {
            "name": "propose_refund",
            "arguments": {
                "order_id": order.id,
                "amount_cents": 15000,
                "reason": "Customer unhappy with service",
            },
        }
    })

    ai_explanation = "The refund request of $150.00 exceeds the safety threshold and has been queued as a pending action awaiting administrator confirmation."

    with patch("app.ai.ollama_client.OllamaClient.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.side_effect = [
            tool_call_json,
            ai_explanation,
        ]

        resp = client.post(
            "/api/v1/ai/chat",
            headers=admin_headers,
            json={
                "messages": [{"role": "user", "content": f"Please refund 15000 cents for order {order.id}"}],
            },
        )

        assert resp.status_code == 200
        data = resp.json()["data"]
        assert len(data["tool_calls"]) == 1
        assert data["tool_calls"][0]["name"] == "propose_refund"

        assert len(data["tool_results"]) == 1
        res = data["tool_results"][0]
        assert res["status"] == "PENDING_CONFIRMATION"
        assert res["output"]["pending_action_id"] is not None

