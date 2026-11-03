from typing import Any, List, Literal, Optional
from pydantic import BaseModel, Field


class JudgeDisputeEvaluationRequest(BaseModel):
    dispute_id: str = Field(description="UUID or PayPal dispute ID to evaluate")


class JudgeDisputeEvaluationResult(BaseModel):
    dispute_id: str
    order_id: Optional[str] = None
    recommendation: Literal[
        "ACCEPT_CLAIM",
        "CHALLENGE_WITH_EVIDENCE",
        "REQUEST_MORE_INFORMATION",
        "ESCALATE_TO_LEGAL",
    ]
    confidence_score: float = Field(ge=0.0, le=1.0)
    risk_score: float = Field(ge=0.0, le=1.0, description="Risk of financial loss or penalty")
    reasoning: str
    suggested_evidence: List[str] = Field(default_factory=list)


class JudgeTransactionEvaluationRequest(BaseModel):
    order_id: str = Field(description="Order ID to evaluate for financial and operational safety")


class JudgeTransactionEvaluationResult(BaseModel):
    order_id: str
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_flags: List[str] = Field(default_factory=list)
    analysis: str
    recommended_action: Literal["PROCEED", "MONITOR", "HOLD_CAPTURE", "BLOCK_USER"]


class JudgePendingActionEvaluationRequest(BaseModel):
    action_id: str = Field(description="Pending sensitive action ID to assess before confirmation")


class JudgePendingActionEvaluationResult(BaseModel):
    action_id: str
    recommendation: Literal["APPROVE", "REJECT", "MANUAL_INSPECTION"]
    confidence_score: float = Field(ge=0.0, le=1.0)
    safety_assessment: str
    flagged_concerns: List[str] = Field(default_factory=list)

