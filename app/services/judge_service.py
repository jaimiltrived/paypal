import json
import re
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session

from app.ai.ollama_client import OllamaClient, get_ollama_client
from app.core.exceptions import EntityNotFoundError, PayOpsException
from app.core.logging import logger
from app.models.dispute import Dispute
from app.models.order import Order
from app.models.pending_action import PendingAction
from app.repositories.dispute_repo import DisputeRepository
from app.repositories.order_repo import OrderRepository
from app.repositories.pending_action_repo import PendingActionRepository
from app.repositories.refund_repo import RefundRepository
from app.schemas.judge import (
    JudgeDisputeEvaluationResult,
    JudgePendingActionEvaluationResult,
    JudgeTransactionEvaluationResult,
)
from app.services.audit_service import AuditService

JUDGE_DISPUTE_PROMPT = """You are PayOps Judge Mode, an autonomous financial arbitration judge.
Analyze the following payment dispute and provide a fair, legally compliant, risk-managed arbitration judgment.

Dispute Details:
- Dispute ID: {dispute_id}
- PayPal ID: {paypal_dispute_id}
- Reason: {reason}
- Amount: ${amount_dollars:.2f} ({amount_cents} cents)
- Currency: {currency}
- Existing Evidence Summary: {evidence_summary}
- Order Status: {order_status}
- Prior Refunds on Order: ${refunded_dollars:.2f}

You MUST return a JSON object with this exact structure:
{{
  "recommendation": "ACCEPT_CLAIM | CHALLENGE_WITH_EVIDENCE | REQUEST_MORE_INFORMATION | ESCALATE_TO_LEGAL",
  "confidence_score": 0.85,
  "risk_score": 0.25,
  "reasoning": "Detailed justification of the ruling based on evidence and commercial practice.",
  "suggested_evidence": ["Evidence item 1", "Evidence item 2"]
}}
"""

JUDGE_TRANSACTION_PROMPT = """You are PayOps Judge Mode, an autonomous transaction risk and safety auditor.
Evaluate the following transaction for anomaly detection, compliance, and chargeback exposure.

Order Details:
- Order ID: {order_id}
- PayPal Order ID: {paypal_order_id}
- Amount: ${amount_dollars:.2f} ({amount_cents} cents)
- Currency: {currency}
- Status: {status}
- Payer Email: {payer_email}
- Capture ID: {capture_id}
- Completed Refunds: {refund_count} (${refunded_dollars:.2f})

You MUST return a JSON object with this exact structure:
{{
  "risk_level": "LOW | MEDIUM | HIGH | CRITICAL",
  "risk_score": 0.15,
  "risk_flags": ["Flag 1", "Flag 2"],
  "analysis": "Forensic analysis of the transaction safety.",
  "recommended_action": "PROCEED | MONITOR | HOLD_CAPTURE | BLOCK_USER"
}}
"""

JUDGE_PENDING_ACTION_PROMPT = """You are PayOps Judge Mode, reviewing a sensitive pending financial operation requiring dual approval.

Action Details:
- Action ID: {action_id}
- Action Type: {action_type}
- Target Entity: {entity_type} ({entity_id})
- Proposed By User: {proposed_by_user_id}
- Payload: {payload_json}

Evaluate the safety of authorizing this operation. Return a JSON object with this structure:
{{
  "recommendation": "APPROVE | REJECT | MANUAL_INSPECTION",
  "confidence_score": 0.90,
  "safety_assessment": "Comprehensive safety assessment.",
  "flagged_concerns": ["Concern 1 if any"]
}}
"""


class JudgeService:
    def __init__(
        self,
        db: Session,
        client: Optional[OllamaClient] = None,
        ip_address: Optional[str] = None,
    ):
        self.db = db
        self.client = client or get_ollama_client()
        self.ip_address = ip_address
        self.dispute_repo = DisputeRepository(db)
        self.order_repo = OrderRepository(db)
        self.refund_repo = RefundRepository(db)
        self.pending_repo = PendingActionRepository(db)
        self.audit = AuditService(db)

    def _parse_judge_json(self, raw_output: str) -> Dict[str, Any]:
        cleaned = raw_output.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r"\s*```$", "", cleaned)
        start_idx = cleaned.find("{")
        end_idx = cleaned.rfind("}")
        if start_idx != -1 and end_idx != -1:
            cleaned = cleaned[start_idx : end_idx + 1]
        try:
            return json.loads(cleaned)
        except Exception as exc:
            logger.error(f"Failed to parse Judge JSON: {cleaned} - {exc}")
            raise PayOpsException("Judge model output failed JSON verification.", status_code=502) from exc

    async def evaluate_dispute(
        self,
        dispute_id: str,
        user_id: Optional[str] = None,
    ) -> JudgeDisputeEvaluationResult:
        dispute = self.dispute_repo.get_by_id(dispute_id)
        if not dispute:
            dispute = self.dispute_repo.get_by_paypal_dispute_id(dispute_id)
        if not dispute:
            raise EntityNotFoundError("Dispute", dispute_id)

        order = self.order_repo.get_by_id(dispute.order_id)
        order_status = order.status if order else "UNKNOWN"
        existing_refunds = self.refund_repo.list_by_order_id(order.id) if order else []
        refunded_cents = sum(r.amount_cents for r in existing_refunds if r.status == "COMPLETED")

        prompt = JUDGE_DISPUTE_PROMPT.format(
            dispute_id=dispute.id,
            paypal_dispute_id=dispute.paypal_dispute_id or "N/A",
            reason=dispute.reason or "Unspecified",
            amount_dollars=dispute.dispute_amount_cents / 100.0,
            amount_cents=dispute.dispute_amount_cents,
            currency=dispute.currency,
            evidence_summary=dispute.evidence_summary or "None provided",
            order_status=order_status,
            refunded_dollars=refunded_cents / 100.0,
        )

        response_text = await self.client.generate(
            prompt=prompt,
            model=self.client.text_model,
            temperature=0.0,
        )
        parsed = self._parse_judge_json(response_text)

        result = JudgeDisputeEvaluationResult(
            dispute_id=dispute.id,
            order_id=dispute.order_id,
            recommendation=parsed.get("recommendation", "CHALLENGE_WITH_EVIDENCE"),
            confidence_score=float(parsed.get("confidence_score", 0.8)),
            risk_score=float(parsed.get("risk_score", 0.3)),
            reasoning=parsed.get("reasoning", "Standard evidentiary challenge recommended."),
            suggested_evidence=parsed.get("suggested_evidence", []),
        )

        self.audit.log_action(
            action="JUDGE_DISPUTE_EVALUATION",
            entity_type="dispute",
            entity_id=dispute.id,
            user_id=user_id,
            new_values={
                "recommendation": result.recommendation,
                "confidence_score": result.confidence_score,
                "risk_score": result.risk_score,
            },
            ip_address=self.ip_address,
        )

        return result

    async def evaluate_transaction(
        self,
        order_id: str,
        user_id: Optional[str] = None,
    ) -> JudgeTransactionEvaluationResult:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            order = self.order_repo.get_by_paypal_order_id(order_id)
        if not order:
            raise EntityNotFoundError("Order", order_id)

        refunds = self.refund_repo.list_by_order_id(order.id)
        completed_refunds = [r for r in refunds if r.status == "COMPLETED"]
        refunded_cents = sum(r.amount_cents for r in completed_refunds)

        prompt = JUDGE_TRANSACTION_PROMPT.format(
            order_id=order.id,
            paypal_order_id=order.paypal_order_id or "N/A",
            amount_dollars=order.amount_cents / 100.0,
            amount_cents=order.amount_cents,
            currency=order.currency,
            status=order.status,
            payer_email=order.payer_email or "N/A",
            capture_id=order.capture_id or "N/A",
            refund_count=len(completed_refunds),
            refunded_dollars=refunded_cents / 100.0,
        )

        response_text = await self.client.generate(
            prompt=prompt,
            model=self.client.text_model,
            temperature=0.0,
        )
        parsed = self._parse_judge_json(response_text)

        result = JudgeTransactionEvaluationResult(
            order_id=order.id,
            risk_level=parsed.get("risk_level", "LOW"),
            risk_score=float(parsed.get("risk_score", 0.1)),
            risk_flags=parsed.get("risk_flags", []),
            analysis=parsed.get("analysis", "Transaction adheres to normal parameters."),
            recommended_action=parsed.get("recommended_action", "PROCEED"),
        )

        self.audit.log_action(
            action="JUDGE_TRANSACTION_EVALUATION",
            entity_type="order",
            entity_id=order.id,
            user_id=user_id,
            new_values={
                "risk_level": result.risk_level,
                "risk_score": result.risk_score,
                "recommended_action": result.recommended_action,
            },
            ip_address=self.ip_address,
        )

        return result

    async def evaluate_pending_action(
        self,
        action_id: str,
        user_id: Optional[str] = None,
    ) -> JudgePendingActionEvaluationResult:
        action = self.pending_repo.get_by_id(action_id)
        if not action:
            raise EntityNotFoundError("PendingAction", action_id)

        prompt = JUDGE_PENDING_ACTION_PROMPT.format(
            action_id=action.id,
            action_type=action.action_type,
            entity_type=action.entity_type,
            entity_id=action.entity_id,
            proposed_by_user_id=action.proposed_by_user_id,
            payload_json=action.payload_json,
        )

        response_text = await self.client.generate(
            prompt=prompt,
            model=self.client.text_model,
            temperature=0.0,
        )
        parsed = self._parse_judge_json(response_text)

        result = JudgePendingActionEvaluationResult(
            action_id=action.id,
            recommendation=parsed.get("recommendation", "APPROVE"),
            confidence_score=float(parsed.get("confidence_score", 0.9)),
            safety_assessment=parsed.get("safety_assessment", "Action validated against threshold criteria."),
            flagged_concerns=parsed.get("flagged_concerns", []),
        )

        self.audit.log_action(
            action="JUDGE_PENDING_ACTION_EVALUATION",
            entity_type="pending_action",
            entity_id=action.id,
            user_id=user_id,
            new_values={
                "recommendation": result.recommendation,
                "confidence_score": result.confidence_score,
            },
            ip_address=self.ip_address,
        )

        return result

