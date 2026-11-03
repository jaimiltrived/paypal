from typing import Any, Callable, Dict, List, Optional
from sqlalchemy.orm import Session

from app.core.exceptions import AuthorizationError, PayOpsException
from app.core.logging import logger
from app.models.user import User
from app.schemas.chat import ToolDefinition, ToolExecutionResult
from app.schemas.invoice import InvoiceCreate, InvoiceLineItem
from app.schemas.order import OrderCreate
from app.schemas.refund import RefundCreate
from app.services.audit_service import AuditService
from app.services.dispute_service import DisputeService
from app.services.invoice_service import InvoiceService
from app.services.ledger_service import LedgerService
from app.services.order_service import OrderService
from app.services.refund_service import RefundService
from app.services.sku_service import SKUService


class ToolRegistry:
    """Registry of validated backend service tools callable by the AI assistant."""

    def __init__(self, db: Session, user: User, ip_address: Optional[str] = None):
        self.db = db
        self.user = user
        self.user_role = user.role.name if user.role else "user"
        self.ip_address = ip_address
        self.audit = AuditService(db)

        # Underlying validated domain services
        self.ledger_service = LedgerService(db)
        self.order_service = OrderService(db)
        self.refund_service = RefundService(db)
        self.sku_service = SKUService(db)
        self.invoice_service = InvoiceService(db)
        self.dispute_service = DisputeService(db)

    def get_tool_definitions(self) -> List[ToolDefinition]:
        """Return tool specifications available to the user based on their role."""
        all_tools = [
            ToolDefinition(
                name="get_ledger_summary",
                description="Retrieve current financial summary including total sales cents, refunds cents, and net revenue.",
                parameters={"type": "object", "properties": {}},
                required_roles=["admin", "operator", "auditor"],
            ),
            ToolDefinition(
                name="query_orders",
                description="Search orders filtered by status (CREATED, APPROVED, COMPLETED, CANCELLED).",
                parameters={
                    "type": "object",
                    "properties": {
                        "status": {"type": "string", "description": "Order status filter"},
                        "limit": {"type": "integer", "default": 10},
                    },
                },
                required_roles=["admin", "operator", "auditor", "user"],
            ),
            ToolDefinition(
                name="get_order_details",
                description="Get detailed information for a specific order by ID or PayPal Order ID.",
                parameters={
                    "type": "object",
                    "properties": {
                        "order_id": {"type": "string", "description": "Internal UUID or PayPal Order ID"},
                    },
                    "required": ["order_id"],
                },
                required_roles=["admin", "operator", "auditor", "user"],
            ),
            ToolDefinition(
                name="query_refunds",
                description="Search refunds by order_id or status.",
                parameters={
                    "type": "object",
                    "properties": {
                        "order_id": {"type": "string", "description": "Filter by order UUID"},
                        "status": {"type": "string", "description": "Filter by status"},
                    },
                },
                required_roles=["admin", "operator", "auditor"],
            ),
            ToolDefinition(
                name="query_skus",
                description="Look up product catalog SKUs, stock levels, and prices.",
                parameters={
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Keyword search for SKU name or code"},
                    },
                },
                required_roles=["admin", "operator", "auditor", "user"],
            ),
            ToolDefinition(
                name="query_invoices",
                description="Search invoices by status (DRAFT, SENT, PAID, CANCELLED).",
                parameters={
                    "type": "object",
                    "properties": {
                        "status": {"type": "string", "description": "Invoice status filter"},
                    },
                },
                required_roles=["admin", "operator", "auditor", "user"],
            ),
            ToolDefinition(
                name="query_disputes",
                description="List customer dispute claims and resolution states.",
                parameters={
                    "type": "object",
                    "properties": {
                        "status": {"type": "string", "description": "Filter by dispute status"},
                    },
                },
                required_roles=["admin", "operator", "auditor"],
            ),
            ToolDefinition(
                name="propose_order",
                description="Create a new payment order in integer cents via PayPal Sandbox.",
                parameters={
                    "type": "object",
                    "properties": {
                        "amount_cents": {"type": "integer", "description": "Order total in cents (e.g. 5000 = $50.00)"},
                        "currency": {"type": "string", "default": "USD"},
                        "description": {"type": "string", "description": "Order notes or item summary"},
                    },
                    "required": ["amount_cents"],
                },
                required_roles=["admin", "operator", "user"],
            ),
            ToolDefinition(
                name="propose_refund",
                description="Issue full or partial refund. High value refunds (>= $100.00 / 10000 cents) automatically queue for dual admin confirmation.",
                parameters={
                    "type": "object",
                    "properties": {
                        "order_id": {"type": "string", "description": "Order UUID to refund"},
                        "amount_cents": {"type": "integer", "description": "Amount in integer cents (optional for full refund)"},
                        "reason": {"type": "string", "description": "Customer rationale for refund"},
                    },
                    "required": ["order_id"],
                },
                required_roles=["admin", "operator"],
            ),
        ]

        # Filter by user role permissions
        return [t for t in all_tools if self.user_role in t.required_roles]

    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> ToolExecutionResult:
        """Validate permissions and execute tool through validated Python backend service."""
        available_tools = {t.name: t for t in self.get_tool_definitions()}
        if tool_name not in available_tools:
            logger.warning(f"AI attempted to invoke unauthorized or nonexistent tool: {tool_name}")
            return ToolExecutionResult(
                tool_name=tool_name,
                status="FAILED",
                output=None,
                error=f"Tool '{tool_name}' does not exist or user lacks permission to execute it.",
            )

        logger.info(f"AI Tool Execution: {tool_name} by user={self.user.id} ({self.user_role})")

        try:
            if tool_name == "get_ledger_summary":
                summary = self.ledger_service.get_ledger_summary()
                return ToolExecutionResult(tool_name=tool_name, status="SUCCESS", output=summary.model_dump())

            elif tool_name == "query_orders":
                status = arguments.get("status")
                limit = arguments.get("limit", 10)
                user_filter = None if self.user_role in ("admin", "operator", "auditor") else self.user.id
                orders, total = self.order_service.list_orders(status=status, user_id=user_filter, limit=limit)
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="SUCCESS",
                    output={"total": total, "orders": [{"id": o.id, "status": o.status, "amount_cents": o.amount_cents, "currency": o.currency} for o in orders]},
                )

            elif tool_name == "get_order_details":
                order_id = arguments["order_id"]
                order = self.order_service.get_order_by_id(order_id)
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="SUCCESS",
                    output={
                        "id": order.id,
                        "paypal_order_id": order.paypal_order_id,
                        "status": order.status,
                        "amount_cents": order.amount_cents,
                        "currency": order.currency,
                        "capture_id": order.capture_id,
                        "description": order.description,
                    },
                )

            elif tool_name == "query_refunds":
                refunds, total = self.refund_service.list_refunds(
                    order_id=arguments.get("order_id"),
                    status=arguments.get("status"),
                )
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="SUCCESS",
                    output={"total": total, "refunds": [{"id": r.id, "amount_cents": r.amount_cents, "status": r.status, "reason": r.reason} for r in refunds]},
                )

            elif tool_name == "query_skus":
                skus, total = self.sku_service.search_skus(query=arguments.get("query"))
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="SUCCESS",
                    output={"total": total, "skus": [{"id": s.id, "sku_code": s.sku_code, "name": s.name, "price_cents": s.price_cents, "stock_quantity": s.stock_quantity} for s in skus]},
                )

            elif tool_name == "query_invoices":
                invoices, total = self.invoice_service.search_invoices(status=arguments.get("status"))
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="SUCCESS",
                    output={"total": total, "invoices": [{"id": i.id, "invoice_number": i.invoice_number, "status": i.status, "total_amount_cents": i.total_amount_cents} for i in invoices]},
                )

            elif tool_name == "query_disputes":
                disputes, total = self.dispute_service.list_disputes(status=arguments.get("status"))
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="SUCCESS",
                    output={"total": total, "disputes": [{"id": d.id, "status": d.status, "dispute_amount_cents": d.dispute_amount_cents, "reason": d.reason} for d in disputes]},
                )

            elif tool_name == "propose_order":
                payload = OrderCreate(
                    amount_cents=arguments["amount_cents"],
                    currency=arguments.get("currency", "USD"),
                    description=arguments.get("description"),
                )
                order, approval_url = await self.order_service.create_order(
                    payload=payload,
                    user_id=self.user.id,
                    ip_address=self.ip_address,
                )
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="SUCCESS",
                    output={
                        "order_id": order.id,
                        "paypal_order_id": order.paypal_order_id,
                        "status": order.status,
                        "amount_cents": order.amount_cents,
                        "approval_url": approval_url,
                    },
                )

            elif tool_name == "propose_refund":
                payload = RefundCreate(
                    order_id=arguments["order_id"],
                    amount_cents=arguments.get("amount_cents"),
                    reason=arguments.get("reason"),
                )
                result = await self.refund_service.issue_refund(
                    payload=payload,
                    user_id=self.user.id,
                    bypass_confirmation=False,
                    ip_address=self.ip_address,
                )
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status=result.status,
                    output=result.model_dump(),
                )

            else:
                return ToolExecutionResult(
                    tool_name=tool_name,
                    status="FAILED",
                    output=None,
                    error=f"Handler for tool '{tool_name}' not implemented.",
                )

        except Exception as exc:
            logger.error(f"Error executing AI tool {tool_name}: {exc}")
            return ToolExecutionResult(
                tool_name=tool_name,
                status="FAILED",
                output=None,
                error=str(exc),
            )

