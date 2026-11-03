import json
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.core.exceptions import EntityNotFoundError, PayOpsException
from app.models.invoice import Invoice
from app.models.order import Order
from app.repositories.invoice_repo import InvoiceRepository
from app.repositories.order_repo import OrderRepository
from app.repositories.sku_repo import SKURepository
from app.schemas.invoice import InvoiceCreate, InvoicePayRequest
from app.services.audit_service import AuditService


class InvoiceService:
    def __init__(self, db: Session):
        self.db = db
        self.invoice_repo = InvoiceRepository(db)
        self.sku_repo = SKURepository(db)
        self.order_repo = OrderRepository(db)
        self.audit = AuditService(db)

    def create_invoice(
        self,
        payload: InvoiceCreate,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Invoice:
        if not payload.items:
            raise PayOpsException("An invoice must contain at least one line item.")

        total_amount_cents = 0
        enriched_items = []

        for item in payload.items:
            if item.quantity <= 0:
                raise PayOpsException(f"Quantity for '{item.name}' must be greater than 0.")
            if item.unit_price_cents <= 0:
                raise PayOpsException(f"Unit price for '{item.name}' must be greater than 0.")

            # Validate linked SKU if provided
            if item.sku_id:
                sku = self.sku_repo.get_by_id(item.sku_id)
                if not sku:
                    raise EntityNotFoundError("SKU", item.sku_id)
                if not sku.is_active:
                    raise PayOpsException(f"Cannot invoice inactive SKU '{sku.sku_code}'.")

            line_total = item.quantity * item.unit_price_cents
            total_amount_cents += line_total
            enriched_items.append(
                {
                    "sku_id": item.sku_id,
                    "name": item.name,
                    "quantity": item.quantity,
                    "unit_price_cents": item.unit_price_cents,
                    "line_total_cents": line_total,
                }
            )

        invoice_number = self.invoice_repo.generate_invoice_number()

        metadata_dict = {
            "items": enriched_items,
            "notes": payload.notes,
        }

        invoice = Invoice(
            invoice_number=invoice_number,
            user_id=payload.user_id or user_id,
            order_id=payload.order_id,
            status="DRAFT",
            currency=payload.currency.upper(),
            total_amount_cents=total_amount_cents,
            due_date=payload.due_date,
            issued_date=None,
            metadata_json=json.dumps(metadata_dict, default=str),
        )
        created = self.invoice_repo.create(invoice)

        self.audit.log_action(
            action="INVOICE_CREATED",
            entity_type="invoice",
            entity_id=created.id,
            user_id=user_id,
            new_values={
                "invoice_number": created.invoice_number,
                "total_amount_cents": created.total_amount_cents,
                "status": created.status,
            },
            ip_address=ip_address,
        )
        return created

    def send_invoice(
        self,
        invoice_id: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Invoice:
        invoice = self.get_invoice(invoice_id)
        if invoice.status not in ("DRAFT", "SENT"):
            raise PayOpsException(f"Cannot send invoice with status '{invoice.status}'.")

        old_status = invoice.status
        invoice.status = "SENT"
        invoice.issued_date = datetime.now(timezone.utc)
        updated = self.invoice_repo.update(invoice)

        self.audit.log_action(
            action="INVOICE_SENT",
            entity_type="invoice",
            entity_id=updated.id,
            user_id=user_id,
            old_values={"status": old_status},
            new_values={"status": "SENT", "issued_date": updated.issued_date},
            ip_address=ip_address,
        )
        return updated

    def pay_invoice(
        self,
        invoice_id: str,
        payload: InvoicePayRequest,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Invoice:
        invoice = self.get_invoice(invoice_id)
        if invoice.status == "PAID":
            return invoice
        if invoice.status == "CANCELLED":
            raise PayOpsException("Cannot pay a cancelled invoice.")

        # If order_id specified, link and verify order
        if payload.order_id:
            order = self.order_repo.get_by_id(payload.order_id)
            if not order:
                raise EntityNotFoundError("Order", payload.order_id)
            if order.status != "COMPLETED":
                raise PayOpsException(f"Linked order status is '{order.status}'. Order must be COMPLETED.")
            if order.amount_cents != invoice.total_amount_cents:
                raise PayOpsException(
                    f"Order amount ({order.amount_cents}c) does not match invoice amount ({invoice.total_amount_cents}c)."
                )
            invoice.order_id = order.id

        # Decrement stock for invoiced SKUs upon payment
        if invoice.metadata_json:
            meta = json.loads(invoice.metadata_json)
            for item in meta.get("items", []):
                sku_id = item.get("sku_id")
                qty = item.get("quantity", 0)
                if sku_id and qty > 0:
                    sku = self.sku_repo.get_by_id(sku_id)
                    if sku and sku.stock_quantity >= qty:
                        sku.stock_quantity -= qty
                        self.sku_repo.update(sku)

        old_status = invoice.status
        invoice.status = "PAID"
        updated = self.invoice_repo.update(invoice)

        self.audit.log_action(
            action="INVOICE_PAID",
            entity_type="invoice",
            entity_id=updated.id,
            user_id=user_id,
            old_values={"status": old_status},
            new_values={"status": "PAID", "order_id": invoice.order_id},
            ip_address=ip_address,
        )
        return updated

    def cancel_invoice(
        self,
        invoice_id: str,
        reason: Optional[str] = None,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Invoice:
        invoice = self.get_invoice(invoice_id)
        if invoice.status == "PAID":
            raise PayOpsException("Cannot cancel an already paid invoice.")

        old_status = invoice.status
        invoice.status = "CANCELLED"
        updated = self.invoice_repo.update(invoice)

        self.audit.log_action(
            action="INVOICE_CANCELLED",
            entity_type="invoice",
            entity_id=updated.id,
            user_id=user_id,
            old_values={"status": old_status},
            new_values={"status": "CANCELLED", "reason": reason},
            ip_address=ip_address,
        )
        return updated

    def get_invoice(self, invoice_id: str) -> Invoice:
        invoice = self.invoice_repo.get_by_id(invoice_id)
        if not invoice:
            invoice = self.invoice_repo.get_by_number(invoice_id)
        if not invoice:
            raise EntityNotFoundError("Invoice", invoice_id)
        return invoice

    def search_invoices(
        self,
        status: Optional[str] = None,
        user_id: Optional[str] = None,
        order_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Invoice], int]:
        return self.invoice_repo.search_invoices(
            status=status, user_id=user_id, order_id=order_id, skip=skip, limit=limit
        )

