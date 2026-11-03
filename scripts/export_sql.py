"""
Export PayOps AI SQLite database schema and dump.
Generates:
- schema.sql (DDL for tables and indexes)
- payops_dump.sql (complete SQL dump including schema and seed data)
- updates payops.db with all models and initial seeds
"""

import os
import sys
import sqlite3

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Base, engine, SessionLocal
from app.models import Base, User, Role, Order, Refund, Event, AuditLog, PendingAction, Invoice, Dispute, SKU
from app.core.security import hash_password


def init_and_seed_db():
    print("[*] Creating database tables from SQLAlchemy models...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if roles exist
        roles = db.query(Role).all()
        if not roles:
            print("[*] Seeding default roles...")
            default_roles = [
                Role(name="ADMIN", description="Administrator with full access to all system functions"),
                Role(name="OPERATOR", description="Operations engineer with payment, refund and dispute execution access"),
                Role(name="VIEWER", description="Read-only access to ledger, orders and reports"),
                Role(name="AUDITOR", description="Auditor with access to audit logs and compliance checks"),
            ]
            for r in default_roles:
                db.add(r)
            db.commit()

        # Check if default admin user exists
        admin_user = db.query(User).filter(User.email == "admin@payops.ai").first()
        if not admin_user:
            print("[*] Seeding default admin user...")
            admin_role = db.query(Role).filter((Role.name == "admin") | (Role.name == "ADMIN")).first()
            if not admin_role:
                admin_role = Role(name="admin", description="Administrator with full access")
                db.add(admin_role)
                db.flush()
            new_admin = User(
                email="admin@payops.ai",
                hashed_password=hash_password("Admin12345!"),
                full_name="PayOps AI Administrator",
                is_active=True,
                role_id=admin_role.id,
            )
            db.add(new_admin)
            db.commit()

        # Check if sample SKUs exist
        sample_sku = db.query(SKU).filter(SKU.sku_code == "SKU-PRO-MONTHLY").first()
        if not sample_sku:
            print("[*] Seeding sample SKUs...")
            skus = [
                SKU(
                    sku_code="SKU-PRO-MONTHLY",
                    name="PayOps Pro Monthly Subscription",
                    description="Monthly subscription for PayOps automation suite",
                    price_cents=4900,
                    currency="USD",
                    stock_quantity=1000,
                    is_active=True,
                ),
                SKU(
                    sku_code="SKU-ENTERPRISE-ANNUAL",
                    name="PayOps Enterprise Annual License",
                    description="Annual enterprise license with priority 24/7 support",
                    price_cents=49900,
                    currency="USD",
                    stock_quantity=500,
                    is_active=True,
                ),
            ]
            for s in skus:
                db.add(s)
            db.commit()

        print("[+] Database initialized and seeded successfully.")
    finally:
        db.close()


def export_sql_files():
    db_path = "payops.db"
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"{db_path} does not exist")

    print(f"[*] Reading {db_path} for SQL dump...")
    con = sqlite3.connect(db_path)

    # 1. payops_dump.sql (Complete dump with schema + seeds)
    dump_path = "payops_dump.sql"
    with open(dump_path, "w", encoding="utf-8") as f:
        f.write("-- ============================================================\n")
        f.write("-- PayOps AI SQLite Complete Database Dump\n")
        f.write("-- Generated for PayOps AI Backend\n")
        f.write("-- Includes Table DDL, Indexes, Constraints, and Seed Data\n")
        f.write("-- ============================================================\n\n")
        for line in con.iterdump():
            f.write(f"{line}\n")
    print(f"[+] Exported complete dump to {dump_path} ({os.path.getsize(dump_path)} bytes)")

    # 2. schema.sql (DDL only - clean schema for reference / migrations)
    schema_path = "schema.sql"
    cur = con.cursor()
    schema_rows = cur.execute(
        "SELECT sql FROM sqlite_master WHERE sql IS NOT NULL ORDER BY type DESC, name ASC;"
    ).fetchall()

    with open(schema_path, "w", encoding="utf-8") as f:
        f.write("-- ============================================================\n")
        f.write("-- PayOps AI SQL Schema Definition\n")
        f.write("-- Database: SQLite 3 (SQLAlchemy ORM Compatible)\n")
        f.write("-- Tables: roles, users, orders, refunds, events, audit_logs,\n")
        f.write("--         pending_actions, invoices, disputes, skus\n")
        f.write("-- ============================================================\n\n")
        f.write("PRAGMA foreign_keys = ON;\n\n")
        for (sql_stmt,) in schema_rows:
            f.write(f"{sql_stmt};\n\n")
    print(f"[+] Exported schema definition to {schema_path} ({os.path.getsize(schema_path)} bytes)")

    con.close()


if __name__ == "__main__":
    init_and_seed_db()
    export_sql_files()
