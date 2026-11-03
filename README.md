# PayOps AI — Backend

PayOps AI is an enterprise-grade payment operations backend built with Python 3.12+, FastAPI, SQLAlchemy, and SQLite. It provides robust integration with the PayPal Sandbox REST APIs, enforces double-entry ledger tracking, records immutable audit trails, and requires dual confirmation for high-value financial transactions.

---

## 1. Core Architecture & Design Principles

PayOps AI is structured around strict separation of concerns:

```
app/
├── core/             # Configuration, database session, security (JWT & bcrypt), exceptions, logging
├── models/           # SQLAlchemy ORM declarative models (UUID primary keys, UTC timestamps)
├── schemas/          # Pydantic v2 validation models and serialization schemas
├── repositories/     # Data access layer (CRUD and specialized query abstractions)
├── services/         # Pure business logic and domain orchestrations
├── integrations/     # External gateway adapters (PayPal Sandbox client with OAuth caching)
├── middleware/       # Centralized exception interceptors and request ID tracking
├── api/              # Versioned API routes (FastAPI APIRouter) and dependency injection
└── utils/            # Monetary conversion utilities (Strict integer cents)
```

### Key Security & Financial Guarantees:
- **Integer Cents Representation**: All monetary values are strictly validated and stored as integer cents (e.g., \$10.50 is represented as `1050`) to avoid IEEE 754 floating-point inaccuracies.
- **PayPal OAuth Caching**: In-memory token cache prevents unnecessary round-trips and respects token expiration limits.
- **Dual Confirmation for Sensitive Actions**: Refunds exceeding the configured threshold (default: \$100.00 / `10000` cents) are held in `PendingAction` and require administrator review and approval.
- **Idempotent Webhooks**: All webhook events are logged with unique constraint checks to ensure duplicates are safely deduplicated without double processing.
- **Role-Based Access Control (RBAC)**: Enforced via JWT bearer tokens supporting roles: `admin`, `operator`, `auditor`, and `user`.

---

## 2. Technology Stack

- **Runtime**: Python 3.12+
- **Web Framework**: FastAPI (ASGI)
- **Database**: SQLite with SQLAlchemy 2.0+ (foreign keys enforced via `PRAGMA foreign_keys=ON`)
- **Validation**: Pydantic v2 & Pydantic-Settings
- **HTTP Client**: HTTPX (Async)
- **Authentication**: JWT (`pyjwt`) with `bcrypt` password hashing
- **Testing**: Pytest & Pytest-Asyncio

---

## 3. Database Schema

The database defines 10 core entities:

1. **`users`**: User identity, hashed passwords, active state, and role linkage.
2. **`roles`**: System roles (`admin`, `operator`, `auditor`, `user`).
3. **`orders`**: PayPal order references, statuses (`CREATED`, `APPROVED`, `COMPLETED`), amounts in integer cents, capture IDs.
4. **`refunds`**: Full or partial refunds linked to orders and PayPal refund IDs.
5. **`events`**: Webhook event log for auditability and idempotency.
6. **`audit_logs`**: Immutable record of all security and financial mutations with user ID, before/after JSON diffs, and IP addresses.
7. **`pending_actions`**: Workflow queues for high-risk operations requiring administrative authorization.
8. **`invoices`**: Billing documents and payment terms (scaffolded).
9. **`disputes`**: Dispute tracking and chargeback resolution (scaffolded).
10. **`skus`**: Product catalogue and inventory definitions (scaffolded).

---

## 4. Setup & Installation

### Prerequisites
- Python 3.12+ (or `uv` package manager)

### 1. Environment Setup

Create and activate a virtual environment:

```powershell
uv venv --python 3.12 .venv
.venv\Scripts\activate
```

Install dependencies:

```powershell
uv sync
```

### 2. Environment Variables

Create `.env` from the provided template:

```powershell
Copy-Item .env.example .env
```

Key environment configurations in `.env`:

```env
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=sqlite:///./payops.db

# JWT Configuration
SECRET_KEY=payops-ai-secure-jwt-key-32101a0e690743ad
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# PayPal Sandbox Credentials
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_sandbox_webhook_id

# Threshold for dual approval on refunds ($100.00 = 10000 cents)
SENSITIVE_REFUND_THRESHOLD_CENTS=10000
```

---

## 5. Running the Application

Start the development server with Uvicorn:

```powershell
.venv\Scripts\uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **Interactive API Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

## 6. Running Tests

Run the complete test suite with verbose reporting:

```powershell
.venv\Scripts\pytest -v
```

The test suite covers:
- **Unit Tests**:
  - `test_money.py`: Integer cents <-> PayPal decimal string conversions.
  - `test_security.py`: Password hashing (bcrypt) and JWT claims verification.
- **Integration Tests**:
  - `test_auth_api.py`: Registration, duplicate email rejection, JWT login, and profile lookups.
  - `test_orders_api.py`: Sandbox order creation, negative amount rejection, order capture, and status filtering.
  - `test_refunds_api.py`: Standard refunds, sensitive high-value refund dual-approval flow, over-refund protection, and role access constraints.
  - `test_webhooks_api.py`: Inbound webhook events, idempotent deduplication, order approval, and payment capture completion.
  - `test_ledger_api.py`: Ledger financial summary, double-entry style journal list (CREDIT/DEBIT), and audit trail retrieval.

---

## 7. API Reference

### Phase 1: Core Payments & Ledger
| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/v1/health` | Service and database health check | Public |
| `POST` | `/api/v1/auth/register` | Register a new user | Public |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT token | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Authenticated |
| `POST` | `/api/v1/orders` | Create an order with PayPal Sandbox | Authenticated |
| `GET` | `/api/v1/orders` | List orders (paginated, filterable) | Authenticated |
| `GET` | `/api/v1/orders/{order_id}` | Retrieve order details | Authenticated |
| `POST` | `/api/v1/orders/{order_id}/capture` | Capture an approved PayPal order | Authenticated |
| `POST` | `/api/v1/refunds` | Issue full/partial refund | `admin`, `operator` |
| `GET` | `/api/v1/refunds` | List refunds | Authenticated |
| `GET` | `/api/v1/refunds/{refund_id}` | Retrieve refund details | Authenticated |
| `POST` | `/api/v1/webhooks/paypal` | Ingest and verify PayPal webhooks | Public (Webhook) |
| `GET` | `/api/v1/webhooks/events` | List ingested webhook events | `admin`, `operator`, `auditor` |
| `GET` | `/api/v1/ledger/summary` | Total sales, refunds, net cents | `admin`, `operator`, `auditor` |
| `GET` | `/api/v1/ledger/transactions` | Unified journal entries | `admin`, `operator`, `auditor` |
| `GET` | `/api/v1/ledger/audit-logs` | Query immutable audit logs | `admin`, `auditor` |
| `GET` | `/api/v1/actions/pending` | List pending high-value actions | `admin`, `operator` |
| `POST` | `/api/v1/actions/pending/{id}/confirm` | Confirm sensitive action | `admin` |
| `POST` | `/api/v1/actions/pending/{id}/reject` | Reject sensitive action | `admin` |

### Phase 2: Commerce & Operations Management
| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/api/v1/skus` | Create a new SKU item with inventory | `admin`, `operator` |
| `GET` | `/api/v1/skus` | List SKUs with query and status filters | Authenticated |
| `GET` | `/api/v1/skus/{sku_id}` | Retrieve SKU details | Authenticated |
| `PUT` | `/api/v1/skus/{sku_id}` | Update SKU price, inventory, or state | `admin`, `operator` |
| `POST` | `/api/v1/invoices` | Create invoice with calculated line items | `admin`, `operator` |
| `GET` | `/api/v1/invoices` | List invoices (status, user, order filters) | Authenticated |
| `GET` | `/api/v1/invoices/{invoice_id}` | Retrieve invoice details | Authenticated |
| `POST` | `/api/v1/invoices/{invoice_id}/send` | Mark invoice as issued/sent | `admin`, `operator` |
| `POST` | `/api/v1/invoices/{invoice_id}/pay` | Record invoice payment & deduct inventory | `admin`, `operator` |
| `POST` | `/api/v1/invoices/{invoice_id}/cancel` | Cancel unpaid invoice | `admin`, `operator` |
| `POST` | `/api/v1/disputes/sync` | Sync customer disputes from PayPal Sandbox | `admin`, `operator` |
| `GET` | `/api/v1/disputes` | List disputes (status, order filters) | `admin`, `operator`, `auditor` |
| `GET` | `/api/v1/disputes/{dispute_id}` | Retrieve dispute details | `admin`, `operator`, `auditor` |
| `POST` | `/api/v1/disputes/{dispute_id}/evidence` | Submit supporting evidence to PayPal | `admin`, `operator` |
| `POST` | `/api/v1/disputes/{dispute_id}/accept` | Accept dispute claim & close liability | `admin`, `operator` |

### Phase 3: AI Document & Bill Extraction (Local Ollama)
| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/v1/ai/status` | Check local Ollama connectivity & models | Authenticated |
| `POST` | `/api/v1/ai/extract/document` | Extract structured bill/invoice data via Qwen2.5-VL / Llama | `admin`, `operator` |
| `POST` | `/api/v1/ai/extract/to-invoice` | Extract document and auto-create local draft Invoice | `admin`, `operator` |

### Phase 4: AI Chat & Validated Tool Execution (Llama 3.2 1B)
| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/api/v1/ai/chat` | Interactive chat with validated backend service tool calls | Authenticated |
| `GET` | `/api/v1/ai/tools` | List tools and parameter schemas allowed for authenticated role | Authenticated |

### Phase 5: Judge Mode & Automated Safety Evaluation
| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/api/v1/judge/dispute` | Autonomous dispute claim arbitration and evidence review | `admin`, `operator`, `auditor` |
| `POST` | `/api/v1/judge/transaction` | Transaction risk, fraud, and anomaly assessment | `admin`, `operator`, `auditor` |
| `POST` | `/api/v1/judge/action` | Dual-authorization safety assessment for pending actions | `admin`, `operator` |





