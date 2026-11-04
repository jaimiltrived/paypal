# PayOps AI — Complete Technical & Operational Documentation

**Version:** 1.2.0  
**Compliance Standard:** SOC-2 Type II, GAAP Double-Entry, FIPS 140-2  
**Architecture:** Python FastAPI + SQLite Ledger + Local Ollama (Qwen2.5-VL / Llama 3.2) + React Vite Frontend  

---

## 1. Executive Summary & Problem Solved

**PayOps AI** is an enterprise-grade financial operations (FinOps) platform built for modern digital merchants, marketplaces, and SaaS providers. It bridges the gap between payment gateway APIs (PayPal Orders v2, Payments v2, Partner Disbursements) and internal double-entry accounting ledgers.

### Core Problems Solved:
1. **Zero Rounding Drift:** Floating-point math creates balance drift in traditional accounting software. PayOps AI strictly uses integer-cents precision across all tables.
2. **Internal Fraud & Rogue Balance Debits:** Prevents single operators from siphoning money through refunds. Implements **Separation of Duties (Four-Eyes Principle)** requiring secondary Administrator approval for any mutation exceeding \$100.00.
3. **Automated Dispute Defense:** Recovers lost chargeback revenue by automatically assembling tracking numbers, delivery proofs, and dispute appeal packets.
4. **Multimodal Invoice & Bill OCR:** Automatically transcribes receipt images and PDF bills into structured line items using local multimodal vision models.

---

## 2. System Architecture

```
                       ┌────────────────────────────────────────┐
                       │   React 18 Frontend Console (Vite)     │
                       │   - Multi-Page SPA (9 Domain Views)    │
                       │   - Custom Fintech UI (design.md)      │
                       │   - Universal RFC-4180 CSV / JSONL     │
                       └───────────────────┬────────────────────┘
                                           │ HTTP / Bearer JWT
                                           ▼
                       ┌────────────────────────────────────────┐
                       │     FastAPI REST Backend (Port 8000)   │
                       │   - Over 30 Production Endpoints       │
                       │   - Pydantic v2 Strict Schema Guard    │
                       │   - Server-Side Token Revocation       │
                       └─────┬──────────────┬──────────────┬────┘
                             │              │              │
              ┌──────────────┘              │              └──────────────┐
              ▼                             ▼                             ▼
┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│  Double-Entry SQLite DB  │  │  Local Ollama AI Engine  │  │   PayPal Gateway API     │
│  - Integer-cents math    │  │  - Llama 3.2 1B (Agent)  │  │   - Orders v2            │
│  - Matched Debit/Credits │  │  - Qwen2.5-VL 3B (Vision)│  │   - Payments & Captures  │
│  - Immutable Audit Logs  │  │  - Autonomous Judge Mode │  │   - Partner Disbursements│
└──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘
```

---

## 3. Roles & Role-Based Access Control (RBAC)

All users share a unified, consistent workspace navigation shell, but permissions, capabilities, and backend enforcement are strictly segregated:

| Capability / Resource | **Administrator** (`admin@payops.ai`) | **Operator** (`operator@payops.ai`) | **Auditor** (`auditor@payops.ai`) |
| :--- | :---: | :---: | :---: |
| **Persona & Title** | **Alex Vance** (Director of FinOps) | **Sarah Jenkins** (Ops Lead) | **Marcus Brody** (Compliance Officer) |
| **Default Password** | `AdminPassword123!` | `OperatorPassword123!` | `AuditorPassword123!` |
| **View Dashboard & Transactions** | Full Access | Full Access | Full Access |
| **Standard Refunds (< $100.00)** | Full Access | Full Access | **Access Denied (403)** |
| **High-Value Refunds (> $100.00)** | Direct Confirm | **Propose Only** (Queued) | **Access Denied (403)** |
| **Sign Dual-Approval Queue** | **Authorized** | **Forbidden (`HTTP 403`)** | **Forbidden (`HTTP 403`)** |
| **Disburse Partner Payouts** | Authorized | Authorized | **Forbidden (`HTTP 403`)** |
| **Submit Dispute Evidence** | Authorized | Authorized | **Forbidden (`HTTP 403`)** |
| **Multimodal Vision OCR Scan** | Authorized | Authorized | View Only |
| **Immutable Audit Logs** | Full Forensic Access | **Restricted (`HTTP 403`)** | **Full Forensic Access** |
| **Double-Entry Ledger Reports** | Full Export Access | Full Export Access | **Read-Only Verification** |
| **Gateway Credentials & Settings** | Full Configuration | View Only | View Only |

---

## 4. Step-by-Step Usage Guide

### A. One-Click Launch (Windows)
Double-click or run from PowerShell in the root repository:
```cmd
run_all.bat
```
This batch script will:
1. Seed the database and start the **FastAPI Backend** on `http://127.0.0.1:8000`.
2. Start the **React Frontend Console** on `http://localhost:5173`.

### B. Manual Terminal Launch
**Terminal 1 — Backend:**
```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```

### C. Access Endpoints
- **Frontend App:** `http://localhost:5173`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **ReDoc Technical Reference:** `http://127.0.0.1:8000/redoc`
- **Health Check:** `http://127.0.0.1:8000/api/v1/health`

---

## 5. Walkthrough of Core Pages & Features

### 1. Dashboard (`/dashboard`)
- Real-time gross settlement volume, 30-day volume AreaChart with latest reference dots, and settlement health distribution.
- Priority AI Copilot banner with instant recommendations.
- Click **"Export Summary"** to download a CSV summary of all dashboard metrics.

### 2. Transactions (`/transactions`)
- Search by customer name, email, order ID, or PayPal capture reference.
- Filter by status (`COMPLETED`, `PENDING`, `REFUNDED`) or payment method.
- Click **"Export CSV"** to export all matching transaction records.
- Click on any row to open the **Transaction Detail View** (`/transactions/:id`) to inspect payment authorization or export individual audit slips.

### 3. Dual-Confirmation Workflow (Live Test)
1. Log in as **Operator** (`operator@payops.ai` / `OperatorPassword123!`).
2. Go to `/transactions` and select a completed order.
3. Attempt to issue a refund **greater than $100.00** (e.g., $450.00).
4. The system automatically halts payout and creates a `PendingAction` with status `PENDING_CONFIRMATION`.
5. Log in as **Admin** (`admin@payops.ai` / `AdminPassword123!`) to open the dual-confirmation prompt, review the reason, and click **Confirm Action** to execute the refund and debit the ledger.

### 4. Payments Capture Stream (`/payments`)
- Multi-currency capture streams (USD, EUR, INR) without blended average distortions.
- Click **"Export Ledger"** to download the payment capture ledger in CSV format.

### 5. Partner Disbursements & Payouts (`/payouts`)
- Batch partner disbursement engine for vendor invoices and seller splits.
- Click **"+ Disburse Funds"** to send funds over PayPal Wallet, ACH, or SEPA rails.
- Click **"Export CSV"** to export partner disbursement records.

### 6. Multimodal AI Receipt & Bill Scanner (`/ai-insights`)
- Click **"Scan Receipt / Bill"** in the top header.
- **Upload Image Tab:** Drag and drop receipt photos (`.png`, `.jpg`, `.webp`).
- **Paste Text Tab:** Paste digital bills or test with sample presets (AWS Bill, Datadog Subscription, Apple Hardware).
- Click **"Scan with Multimodal AI"** to transcribe structured line items, calculate taxes, and verify arithmetic balance.
- Click **"Convert to Draft Invoice"** to save directly into the PayOps database.

### 7. Risk & Fraud Alerts (`/risk`)
- Real-time anomaly scores, dispute velocity tracking, and automated Judge Mode arbitration.

### 8. Reports & Reconciliation (`/reports`)
- GAAP-compliant double-entry ledger summaries with zero integer-cents drift.
- Download itemized reports:
  - *Settlement & Double-Entry Ledger Summary* (CSV / JSON)
  - *Decline Reason Code & Dispute Ratio Analysis* (CSV)
  - *Tax, SKU & Invoicing Audit Trail* (CSV / JSON)
- Click **"Export All"** to compile a complete multi-section financial ledger archive.

### 9. Immutable Audit Log (`/activity`)
- Cryptographic append-only event stream tracking every database mutation, IP address, and state diff.
- Supports **"Export CSV"** and streaming **"Export JSONL"**.

### 10. Settings & Security (`/settings`)
- Hardware token status, active session telemetry, sensitive refund threshold controls, and the interactive RBAC permission matrix.

---

## 6. Document Generation & Files
- Complete Word Document: `PAYOPS_AI_DOCUMENTATION.docx`
- Markdown Documentation: `PAYOPS_AI_DOCUMENTATION.md`
- API Specification: `API_CONTRACT.md`
