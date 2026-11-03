import json
from unittest.mock import AsyncMock, patch
from app.models.dispute import Dispute
from app.models.order import Order
from app.models.pending_action import PendingAction


def test_judge_dispute_evaluation(client, operator_headers, db_session):
    order = Order(amount_cents=12000, status="COMPLETED")
    db_session.add(order)
    db_session.commit()

    dispute = Dispute(
        paypal_dispute_id="PP-DISP-JUDGE-1",
        order_id=order.id,
        status="UNDER_REVIEW",
        dispute_amount_cents=12000,
        currency="USD",
        reason="MERCHANDISE_NOT_AS_DESCRIBED",
        evidence_summary="Tracking provided, customer claims color mismatch.",
    )
    db_session.add(dispute)
    db_session.commit()
    db_session.refresh(dispute)

    mock_judge_verdict = json.dumps({
        "recommendation": "CHALLENGE_WITH_EVIDENCE",
        "confidence_score": 0.88,
        "risk_score": 0.20,
        "reasoning": "Product photos and shipping manifest prove specification was matched.",
        "suggested_evidence": ["Signed packing slip", "Listing screenshot"],
    })

    with patch("app.ai.ollama_client.OllamaClient.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = f"```json\n{mock_judge_verdict}\n```"

        resp = client.post(
            "/api/v1/judge/dispute",
            headers=operator_headers,
            json={"dispute_id": dispute.id},
        )
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["dispute_id"] == dispute.id
        assert data["recommendation"] == "CHALLENGE_WITH_EVIDENCE"
        assert data["confidence_score"] == 0.88
        assert data["risk_score"] == 0.20
        assert len(data["suggested_evidence"]) == 2


def test_judge_transaction_evaluation(client, operator_headers, db_session):
    order = Order(
        paypal_order_id="PP-ORD-JUDGE-TX",
        amount_cents=50000,  # $500.00
        currency="USD",
        status="COMPLETED",
        payer_email="suspicious.buyer@tempmail.com",
    )
    db_session.add(order)
    db_session.commit()

    mock_judge_tx = json.dumps({
        "risk_level": "HIGH",
        "risk_score": 0.75,
        "risk_flags": ["Disposable email provider", "High single-order amount"],
        "analysis": "Buyer email domain is associated with high fraud incidence.",
        "recommended_action": "HOLD_CAPTURE",
    })

    with patch("app.ai.ollama_client.OllamaClient.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_judge_tx

        resp = client.post(
            "/api/v1/judge/transaction",
            headers=operator_headers,
            json={"order_id": order.id},
        )
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["risk_level"] == "HIGH"
        assert data["risk_score"] == 0.75
        assert data["recommended_action"] == "HOLD_CAPTURE"
        assert "Disposable email provider" in data["risk_flags"]


def test_judge_pending_action_evaluation(client, operator_headers, db_session):
    from app.services.auth_service import AuthService
    op_user = AuthService(db_session).user_repo.get_by_email("operator@payops.ai")
    user_id = op_user.id if op_user else "dummy"

    action = PendingAction(
        action_type="HIGH_VALUE_REFUND",
        entity_type="order",
        entity_id="dummy-order-id",
        payload_json=json.dumps({"amount_cents": 15000, "reason": "Customer cancellation"}),
        proposed_by_user_id=user_id,
        status="PENDING",
    )
    db_session.add(action)
    db_session.commit()
    db_session.refresh(action)


    mock_judge_action = json.dumps({
        "recommendation": "APPROVE",
        "confidence_score": 0.95,
        "safety_assessment": "Refund matches customer cancellation request within 24 hours of purchase.",
        "flagged_concerns": [],
    })

    with patch("app.ai.ollama_client.OllamaClient.generate", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_judge_action

        resp = client.post(
            "/api/v1/judge/action",
            headers=operator_headers,
            json={"action_id": action.id},
        )
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["action_id"] == action.id
        assert data["recommendation"] == "APPROVE"
        assert data["confidence_score"] == 0.95


def test_standard_user_forbidden_from_judge(client, user_headers):
    resp = client.post(
        "/api/v1/judge/dispute",
        headers=user_headers,
        json={"dispute_id": "dummy-id"},
    )
    assert resp.status_code == 403
