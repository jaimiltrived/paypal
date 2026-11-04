import json
from datetime import datetime, timezone
from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.user import User, Role
from app.models.order import Order
from app.models.refund import Refund
from app.models.dispute import Dispute
from app.models.pending_action import PendingAction
from app.models.audit import AuditLog
from app.models.sku import SKU

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Roles
        roles_map = {}
        for role_name, desc in [
            ("admin", "Administrator with full system privileges"),
            ("operator", "Payment and refunds operations officer"),
            ("auditor", "Read-only auditor for ledger and transactions"),
            ("user", "Standard customer account"),
        ]:
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(name=role_name, description=desc)
                db.add(role)
                db.flush()
            roles_map[role_name] = role

        db.commit()

        # 2. Seed Users
        admin_user = db.query(User).filter(User.email == "admin@payops.ai").first()
        if not admin_user:
            admin_user = User(
                email="admin@payops.ai",
                hashed_password=hash_password("AdminPassword123!"),
                full_name="Alex Vance (Admin)",
                is_active=True,
                role_id=roles_map["admin"].id,
            )
            db.add(admin_user)
            db.flush()
        else:
            admin_user.hashed_password = hash_password("AdminPassword123!")
            admin_user.full_name = "Alex Vance (Admin)"

        operator_user = db.query(User).filter(User.email == "operator@payops.ai").first()
        if not operator_user:
            operator_user = User(
                email="operator@payops.ai",
                hashed_password=hash_password("OperatorPassword123!"),
                full_name="Sarah Jenkins (Operator)",
                is_active=True,
                role_id=roles_map["operator"].id,
            )
            db.add(operator_user)
            db.flush()
        else:
            operator_user.hashed_password = hash_password("OperatorPassword123!")
            operator_user.full_name = "Sarah Jenkins (Operator)"

        auditor_user = db.query(User).filter(User.email == "auditor@payops.ai").first()
        if not auditor_user:
            auditor_user = User(
                email="auditor@payops.ai",
                hashed_password=hash_password("AuditorPassword123!"),
                full_name="Marcus Brody (Auditor)",
                is_active=True,
                role_id=roles_map["auditor"].id,
            )
            db.add(auditor_user)
            db.flush()
        else:
            auditor_user.hashed_password = hash_password("AuditorPassword123!")
            auditor_user.full_name = "Marcus Brody (Auditor)"

        db.commit()

        # 3. Seed Orders
        orders_data = [
            {
                "id": "ord_91823-3891-44af-811c-99a012e84120",
                "paypal_order_id": "8MN92184KL381920B",
                "status": "COMPLETED",
                "currency": "USD",
                "amount_cents": 34500,
                "description": "Enterprise API Subscription - Tier 2",
                "custom_id": "CUST-ORG-9102",
                "payer_email": "finance@acmecorp.io",
                "capture_id": "CAP-789218390",
                "user_id": admin_user.id,
            },
            {
                "id": "ord_77182-1204-43cb-9801-11b023f76101",
                "paypal_order_id": "4RT81092MN192834C",
                "status": "COMPLETED",
                "currency": "USD",
                "amount_cents": 125000,
                "description": "Hardware POS Terminal Gateway Batch",
                "custom_id": "CUST-ORG-8841",
                "payer_email": "treasury@hyperstream.tech",
                "capture_id": "CAP-443910281",
                "user_id": operator_user.id,
            },
            {
                "id": "ord_66192-8921-41bb-a202-33c948d88219",
                "paypal_order_id": "9PP72019QQ991820D",
                "status": "FAILED",
                "currency": "USD",
                "amount_cents": 8900,
                "description": "Developer Seat License Add-on",
                "custom_id": "CUST-ORG-7719",
                "payer_email": "devops@nexustrack.co",
                "capture_id": None,
                "user_id": admin_user.id,
            },
            {
                "id": "ord_55291-0912-42aa-b881-22c091a99021",
                "paypal_order_id": "2KL88192EU771920A",
                "status": "COMPLETED",
                "currency": "EUR",
                "amount_cents": 24190,
                "description": "European Dedicated Ingress Node",
                "custom_id": "CUST-ORG-5512",
                "payer_email": "billing@strato-cloud.de",
                "capture_id": "CAP-992019482",
                "user_id": operator_user.id,
            },
            {
                "id": "ord_44102-8812-45ff-a102-77d012e88124",
                "paypal_order_id": "5IN99102IN449102B",
                "status": "COMPLETED",
                "currency": "INR",
                "amount_cents": 1240500,
                "description": "Subcontinent Cloud Gateway Connect",
                "custom_id": "CUST-ORG-4410",
                "payer_email": "payments@indicpay.in",
                "capture_id": "CAP-112094819",
                "user_id": admin_user.id,
            },
            {
                "id": "ord_33190-7721-41ee-99aa-88f012b77190",
                "paypal_order_id": "7US44192US991820Z",
                "status": "PENDING",
                "currency": "USD",
                "amount_cents": 54000,
                "description": "GPU Cluster Ops Reserve Hold",
                "custom_id": "CUST-ORG-3310",
                "payer_email": "procurement@lumina-ai.com",
                "capture_id": None,
                "user_id": operator_user.id,
            },
        ]

        for od in orders_data:
            existing = db.query(Order).filter(Order.id == od["id"]).first()
            if not existing:
                db.add(Order(**od))
        db.commit()

        # 4. Seed Refunds
        ref_id = "ref_99182-3819-44cb-a912"
        existing_ref = db.query(Refund).filter(Refund.id == ref_id).first()
        if not existing_ref:
            db.add(
                Refund(
                    id=ref_id,
                    order_id="ord_77182-1204-43cb-9801-11b023f76101",
                    paypal_refund_id="REF-992019283",
                    amount_cents=125000,
                    currency="USD",
                    status="PENDING",
                    reason="Customer cancelled enterprise annual plan within 7-day trial.",
                    initiated_by_user_id=operator_user.id,
                )
            )
            db.commit()

        # 5. Seed Disputes
        disp_id = "disp_991823-3810-4491-aa10"
        existing_disp = db.query(Dispute).filter(Dispute.id == disp_id).first()
        if not existing_disp:
            db.add(
                Dispute(
                    id=disp_id,
                    paypal_dispute_id="PP-D-991204",
                    order_id="ord_91823-3891-44af-811c-99a012e84120",
                    status="UNDER_REVIEW",
                    reason="MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
                    dispute_amount_cents=34500,
                    currency="USD",
                    outcome="PENDING",
                    evidence_summary="Digital API key logs and login telemetry verified delivery.",
                )
            )
            db.commit()

        # 6. Seed Pending Actions (Dual Confirmation Queue)
        pacts = [
            {
                "id": "pact_77182-3819-44cb-a912",
                "action_type": "HIGH_VALUE_REFUND",
                "entity_type": "Refund",
                "entity_id": ref_id,
                "payload_json": json.dumps({
                    "refund_id": ref_id,
                    "order_id": "ord_77182-1204-43cb-9801-11b023f76101",
                    "amount_cents": 125000,
                    "currency": "USD",
                    "reason": "Customer cancelled enterprise annual plan within 7-day trial.",
                }),
                "status": "PENDING",
                "proposed_by_user_id": operator_user.id,
            },
            {
                "id": "pact_88291-1029-41aa-8812",
                "action_type": "DISPUTE_AUTO_ACCEPT",
                "entity_type": "Dispute",
                "entity_id": disp_id,
                "payload_json": json.dumps({
                    "dispute_id": disp_id,
                    "amount_cents": 4500,
                    "currency": "USD",
                    "reason": "Defective digital SKU asset download failure verified by telemetry.",
                }),
                "status": "PENDING",
                "proposed_by_user_id": admin_user.id,
            },
        ]

        for p in pacts:
            existing = db.query(PendingAction).filter(PendingAction.id == p["id"]).first()
            if not existing:
                db.add(PendingAction(**p))
        db.commit()

        # 7. Seed Audit Logs
        audit_entries = [
            {
                "id": "aud_001",
                "user_id": admin_user.id,
                "action": "CONFIRM_PENDING_ACTION",
                "entity_type": "PendingAction",
                "entity_id": "pact_33190",
                "old_values": json.dumps({"status": "PENDING", "approved_by": None}),
                "new_values": json.dumps({"status": "EXECUTED", "approved_by": "Alex Vance (Admin)", "refund_capture_ref": "re_paypal_881902"}),
                "ip_address": "192.168.1.104",
            },
            {
                "id": "aud_002",
                "user_id": None,
                "action": "FLAG_ANOMALY",
                "entity_type": "AnomalyInsight",
                "entity_id": "ins_ai_01",
                "old_values": None,
                "new_values": json.dumps({"insight_id": "ins_ai_01", "severity": "high", "affected_records": 18}),
                "ip_address": "127.0.0.1",
            },
            {
                "id": "aud_003",
                "user_id": operator_user.id,
                "action": "CREATE_REFUND_REQUEST",
                "entity_type": "Refund",
                "entity_id": ref_id,
                "old_values": json.dumps({"order_status": "COMPLETED", "refunded_amount_cents": 0}),
                "new_values": json.dumps({"order_status": "REFUND_PENDING_APPROVAL", "refund_requested_cents": 125000}),
                "ip_address": "192.168.1.118",
            },
            {
                "id": "aud_004",
                "user_id": None,
                "action": "PAYMENT_CAPTURE_COMPLETED",
                "entity_type": "Order",
                "entity_id": "ord_91823-3891-44af-811c-99a012e84120",
                "old_values": json.dumps({"status": "CREATED", "capture_id": None}),
                "new_values": json.dumps({"status": "COMPLETED", "capture_id": "CAP-789218390", "amount_cents": 34500}),
                "ip_address": "173.0.82.126",
            },
            {
                "id": "aud_005",
                "user_id": admin_user.id,
                "action": "UPDATE_SECURITY_SETTINGS",
                "entity_type": "Settings",
                "entity_id": "sec_cfg_01",
                "old_values": json.dumps({"dual_approval_threshold_cents": 50000}),
                "new_values": json.dumps({"dual_approval_threshold_cents": 10000}),
                "ip_address": "192.168.1.104",
            },
        ]

        for a in audit_entries:
            existing = db.query(AuditLog).filter(AuditLog.id == a["id"]).first()
            if not existing:
                db.add(AuditLog(**a))
        db.commit()

        # 8. Seed Payouts
        from app.models.payout import Payout
        payouts_data = [
            {
                "id": "pay_91820-4412-88aa-b120",
                "user_id": admin_user.id,
                "payout_batch_id": "BATCH-2026-ALPHA01",
                "payout_item_id": "ITEM-ALPHA-9102",
                "recipient_email": "seller.alpha@partner.net",
                "recipient_name": "Alpha Marketplace Seller LLC",
                "amount_cents": 45000,
                "currency": "USD",
                "status": "SUCCESS",
                "note": "Monthly net seller commission settlement",
            },
            {
                "id": "pay_88192-3310-99bb-c340",
                "user_id": admin_user.id,
                "payout_batch_id": "BATCH-2026-CLOUDOPS02",
                "payout_item_id": "ITEM-CLOUDOPS-8812",
                "recipient_email": "contractor.dev@cloudops.org",
                "recipient_name": "CloudOps Contractor Services",
                "amount_cents": 120000,
                "currency": "USD",
                "status": "SUCCESS",
                "note": "Infrastructure engineering milestone invoice",
            },
            {
                "id": "pay_77102-2201-11cc-d560",
                "user_id": admin_user.id,
                "payout_batch_id": "BATCH-2026-GROWTH03",
                "payout_item_id": "ITEM-GROWTH-7719",
                "recipient_email": "affiliate.network@growthpay.io",
                "recipient_name": "GrowthPay Affiliate Partner",
                "amount_cents": 18500,
                "currency": "USD",
                "status": "SUCCESS",
                "note": "Q4 affiliate referral bonus",
            },
        ]
        for p in payouts_data:
            existing_p = db.query(Payout).filter(Payout.id == p["id"]).first()
            if not existing_p:
                db.add(Payout(**p))
        db.commit()

        print("[OK] Database demo seeding complete!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

