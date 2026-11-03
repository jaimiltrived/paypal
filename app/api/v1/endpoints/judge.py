from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_user, get_db, require_role
from app.models.user import User
from app.schemas.common import StandardResponse
from app.schemas.judge import (
    JudgeDisputeEvaluationRequest,
    JudgeDisputeEvaluationResult,
    JudgePendingActionEvaluationRequest,
    JudgePendingActionEvaluationResult,
    JudgeTransactionEvaluationRequest,
    JudgeTransactionEvaluationResult,
)
from app.services.judge_service import JudgeService

router = APIRouter()


@router.post(
    "/dispute",
    response_model=StandardResponse[JudgeDisputeEvaluationResult],
    summary="Judge Mode: Autonomous dispute claim arbitration and evidence review",
)
async def judge_dispute(
    payload: JudgeDisputeEvaluationRequest,
    request: Request,
    current_user: User = Depends(require_role(["admin", "operator", "auditor"])),
    db: Session = Depends(get_db),
):
    client_ip = get_client_ip(request)
    judge = JudgeService(db, ip_address=client_ip)
    result = await judge.evaluate_dispute(dispute_id=payload.dispute_id, user_id=current_user.id)
    return StandardResponse(
        message="Dispute successfully adjudicated by Judge Mode.",
        data=result,
    )


@router.post(
    "/transaction",
    response_model=StandardResponse[JudgeTransactionEvaluationResult],
    summary="Judge Mode: Transaction risk, fraud, and anomaly assessment",
)
async def judge_transaction(
    payload: JudgeTransactionEvaluationRequest,
    request: Request,
    current_user: User = Depends(require_role(["admin", "operator", "auditor"])),
    db: Session = Depends(get_db),
):
    client_ip = get_client_ip(request)
    judge = JudgeService(db, ip_address=client_ip)
    result = await judge.evaluate_transaction(order_id=payload.order_id, user_id=current_user.id)
    return StandardResponse(
        message="Transaction risk evaluation complete.",
        data=result,
    )


@router.post(
    "/action",
    response_model=StandardResponse[JudgePendingActionEvaluationResult],
    summary="Judge Mode: Dual-authorization safety assessment for pending actions",
)
async def judge_pending_action(
    payload: JudgePendingActionEvaluationRequest,
    request: Request,
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    client_ip = get_client_ip(request)
    judge = JudgeService(db, ip_address=client_ip)
    result = await judge.evaluate_pending_action(action_id=payload.action_id, user_id=current_user.id)
    return StandardResponse(
        message="Pending action safety assessment complete.",
        data=result,
    )

