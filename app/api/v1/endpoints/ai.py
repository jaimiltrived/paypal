from typing import Optional
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.ai.chat_engine import ChatEngine
from app.ai.document_extractor import DocumentExtractor
from app.ai.ollama_client import get_ollama_client
from app.ai.tools import ToolRegistry
from app.api.deps import get_client_ip, get_current_user, get_db, require_role
from app.core.config import settings
from app.models.user import User
from app.schemas.ai import AIHealthStatus, DocumentExtractionRequest, DocumentExtractionResult
from app.schemas.chat import ChatRequest, ChatResponse, ToolDefinition
from app.schemas.common import StandardResponse
from app.schemas.invoice import InvoiceCreate, InvoiceLineItem, InvoiceRead
from app.services.invoice_service import InvoiceService

router = APIRouter()


@router.post(
    "/chat",
    response_model=StandardResponse[ChatResponse],
    summary="Interactive AI Chat with backend service tool execution (Llama 3.2 1B)",
)
async def chat_with_assistant(
    payload: ChatRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    client_ip = get_client_ip(request)
    engine = ChatEngine(db, current_user, ip_address=client_ip)
    response = await engine.process_chat(payload)
    return StandardResponse(data=response)


@router.get(
    "/tools",
    response_model=StandardResponse[list[ToolDefinition]],
    summary="List available AI tools and schemas for the authenticated user",
)
def list_available_tools(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    registry = ToolRegistry(db, current_user)
    tools = registry.get_tool_definitions()
    return StandardResponse(data=tools)


@router.get(
    "/status",

    response_model=StandardResponse[AIHealthStatus],
    summary="Check local Ollama AI connectivity and configured models",
)
async def get_ai_status(
    current_user: User = Depends(get_current_user),
):
    client = get_ollama_client()
    health_data = await client.check_health()
    status_info = AIHealthStatus(
        ollama_connected=health_data["connected"],
        base_url=client.base_url,
        active_text_model=settings.LLAMA_MODEL,
        active_vision_model=settings.QWEN_VL_MODEL,
        available_models=health_data.get("available_models", []),
    )
    return StandardResponse(data=status_info)


@router.post(
    "/extract/document",
    response_model=StandardResponse[DocumentExtractionResult],
    summary="Extract structured financial invoice/bill data via Qwen2.5-VL / Llama",
)
async def extract_document(
    payload: DocumentExtractionRequest,
    current_user: User = Depends(require_role(["admin", "operator"])),
):
    extractor = DocumentExtractor()
    result = await extractor.extract_from_image_or_text(
        image_base64=payload.image_base64,
        document_text=payload.document_text,
    )
    return StandardResponse(
        message="Document successfully analyzed and extracted.",
        data=result,
    )


@router.post(
    "/extract/to-invoice",
    response_model=StandardResponse[InvoiceRead],
    summary="Extract document and automatically convert into a PayOps Draft Invoice",
)
async def extract_and_create_invoice(
    payload: DocumentExtractionRequest,
    request: Request,
    current_user: User = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db),
):
    extractor = DocumentExtractor()
    extracted = await extractor.extract_from_image_or_text(
        image_base64=payload.image_base64,
        document_text=payload.document_text,
    )

    # Convert extracted line items into invoice line items
    items = []
    if extracted.line_items:
        for it in extracted.line_items:
            items.append(
                InvoiceLineItem(
                    name=it.name,
                    quantity=it.quantity,
                    unit_price_cents=it.unit_price_cents,
                )
            )
    else:
        # Fallback single item matching total
        items.append(
            InvoiceLineItem(
                name=f"Invoice from {extracted.vendor_name or 'Vendor'}",
                quantity=1,
                unit_price_cents=extracted.total_amount_cents or 1000,
            )
        )

    notes = f"AI Extracted from {extracted.vendor_name or 'Document'}. Invoice Ref: {extracted.invoice_number or 'N/A'}"
    if extracted.notes:
        notes += f" | {extracted.notes}"

    invoice_create = InvoiceCreate(
        user_id=current_user.id,
        currency=extracted.currency,
        items=items,
        notes=notes,
    )

    client_ip = get_client_ip(request)
    invoice_service = InvoiceService(db)
    created_invoice = invoice_service.create_invoice(
        payload=invoice_create,
        user_id=current_user.id,
        ip_address=client_ip,
    )

    return StandardResponse(
        message="Document extracted and draft invoice generated successfully.",
        data=InvoiceRead.model_validate(created_invoice),
    )

