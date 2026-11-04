# PayOps AI — Complete API Contract Specification
**Document Version:** 1.1.0  
**Backend:** FastAPI 0.110+ (Python 3.11+)  
**Frontend:** React 18 / Vite 5  
**Base URL:** `http://127.0.0.1:8000`  
**API V1 Prefix:** `/api/v1`  
**Vite Proxy Target:** `/api` -> `http://127.0.0.1:8000`

---

## 1. Architectural & Financial Rules

### 1.1 Monetary Precision (Zero Floating-Point Drift)
- **All monetary amounts are integers representing cents** (e.g., `$15.00` is represented as `1500`, `$0.50` as `50`).
- **Never transmit or compute fractional dollars or floats** to the backend.
- **Frontend Display Conversion:**
  ```javascript
  export const formatCentsToCurrency = (cents, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format((cents || 0) / 100);
  };
  ```
- **Frontend Input Conversion:**
  ```javascript
  export const parseCurrencyToCents = (amountStr) => {
    const val = parseFloat(amountStr);
    return isNaN(val) ? 0 : Math.round(val * 100);
  };
  ```

### 1.2 Envelope Standards
Endpoints return one of three structural shapes:

#### 1. Standard Envelope (`StandardResponse[T]`)
Used for single resource fetches, mutations, and actions:
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

#### 2. Paginated Envelope (`PaginatedResponse[T]`)
Used for all collection / list queries:
```json
{
  "items": [ ... ],
  "total": 42,
  "skip": 0,
  "limit": 50
}
```

#### 3. Direct Schema (Token Auth)
`POST /api/v1/auth/login`, `POST /api/v1/auth/token`, and `POST /api/v1/auth/refresh` return the `Token` schema directly:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "expires_in_minutes": 60,
  "user_id": "usr_...",
  "email": "admin@payops.ai",
  "role": "admin"
}
```

### 1.3 Centralized Error Schema
All HTTP 4xx and 5xx errors emitted by the backend follow this exact structure:
```json
{
  "success": false,
  "error": {
    "code": "ValidationError | HTTPException | NotFoundException | UnauthorizedException",
    "message": "Human-readable explanation of error.",
    "details": null
  }
}
```

### 1.4 Role-Based Access Control (RBAC)
User accounts have one of four system roles:
- `admin`: Full administrative access; can confirm/reject sensitive high-value actions, issue refunds, disburse partner payouts, manage disputes, trigger Judge Mode, access audit logs.
- `operator`: Operations team; can create orders, issue standard refunds, create partner disbursements, manage invoices/SKUs, view disputes.
- `auditor`: Compliance officer; read-only access to ledger summaries, audit logs, transactions, payouts, and disputes.
- `user`: Standard customer or vendor; restricted to their own orders and invoices.

---

## 2. Authentication & Session Management

### 2.1 User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Auth Required:** None (Public)
- **Request Body:**
  ```json
  {
    "email": "admin@payops.ai",
    "password": "AdminPassword123!"
  }
  ```
- **Response (200 OK):** `Token` schema.

### 2.2 Server-Side Token Revocation / Logout (IMPLEMENTED)
- **Endpoint:** `POST /api/v1/auth/logout`
- **Auth Required:** Bearer Token
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Successfully signed out. JWT session has been revoked.",
    "data": {
      "user_id": "usr_...",
      "revoked": true
    }
  }
  ```
- **Behavior:** The active token is added to the revocation blacklist and an audit log event (`LOGOUT`) is stored in SQLite. Subsequent requests using the revoked token return HTTP 401 Unauthorized.

### 2.3 Token Refresh (IMPLEMENTED)
- **Endpoint:** `POST /api/v1/auth/refresh`
- **Auth Required:** Bearer Token
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** Returns fresh `Token` schema with a 60-minute lifetime. Old token is immediately blacklisted.

### 2.4 User Registration
- **Endpoint:** `POST /api/v1/auth/register`
- **Auth Required:** None (Public)
- **Response (200 OK):** `StandardResponse[UserRead]`

### 2.5 Current Authenticated Profile
- **Endpoint:** `GET /api/v1/auth/me`
- **Auth Required:** Bearer Token
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):** `StandardResponse[UserRead]`

---

## 3. Payouts & Partner Disbursements (IMPLEMENTED)

### 3.1 Create Partner Disbursement
- **Endpoint:** `POST /api/v1/payouts`
- **Auth Required:** Bearer Token (`admin | operator`)
- **Request Body:**
  ```json
  {
    "recipient_email": "seller.alpha@partner.net",
    "recipient_name": "Alpha Marketplace Seller LLC",
    "amount_cents": 45000,
    "currency": "USD",
    "note": "Monthly net seller commission settlement"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Partner disbursement successfully executed.",
    "data": {
      "id": "pay_91820-4412-88aa-b120",
      "user_id": "usr_admin",
      "recipient_email": "seller.alpha@partner.net",
      "recipient_name": "Alpha Marketplace Seller LLC",
      "amount_cents": 45000,
      "currency": "USD",
      "status": "SUCCESS",
      "note": "Monthly net seller commission settlement",
      "payout_batch_id": "BATCH-2026-ALPHA01",
      "payout_item_id": "ITEM-ALPHA-9102",
      "created_at": "2026-11-04T12:00:00Z",
      "updated_at": "2026-11-04T12:00:00Z"
    }
  }
  ```

### 3.2 List Disbursements
- **Endpoint:** `GET /api/v1/payouts`
- **Auth Required:** Bearer Token (`admin | operator | auditor`)
- **Query Parameters:**
  - `status`: string (optional, e.g. `SUCCESS`, `PENDING`, `FAILED`)
  - `recipient_email`: string (optional)
  - `skip`: int (default `0`)
  - `limit`: int (default `50`)
- **Response (200 OK):** `PaginatedResponse[PayoutRead]`

### 3.3 Payout Metrics
- **Endpoint:** `GET /api/v1/payouts/metrics`
- **Auth Required:** Bearer Token (`admin | operator | auditor`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Operation completed successfully.",
    "data": {
      "total_payouts_cents": 452000,
      "payout_count": 7,
      "successful_count": 7,
      "pending_count": 0
    }
  }
  ```

### 3.4 Get Payout Details
- **Endpoint:** `GET /api/v1/payouts/{payout_id}`
- **Auth Required:** Bearer Token (`admin | operator | auditor`)
- **Path Parameter:** `payout_id` (UUID or batch ID)
- **Response (200 OK):** `StandardResponse[PayoutRead]`

---

## 4. System Health
- **Endpoint:** `GET /api/v1/health`
- **Auth Required:** None
- **Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "database": "ok",
    "service": "payops-ai-backend"
  }
  ```

---

## 5. Orders & Payments
- `POST /api/v1/orders`: Create order in PayPal Sandbox & database.
- `GET /api/v1/orders`: List orders with pagination & status filter.
- `GET /api/v1/orders/{order_id}`: Get order details.
- `POST /api/v1/orders/{order_id}/capture`: Capture approved PayPal order.

---

## 6. Refunds & Dual Confirmation
- `POST /api/v1/refunds`: Issue refund (triggers `PendingAction` if high-value).
- `GET /api/v1/refunds`: List refunds.
- `GET /api/v1/refunds/{refund_id}`: Get refund details.
- `GET /api/v1/actions/pending`: List pending dual-confirmation actions.
- `POST /api/v1/actions/pending/{action_id}/confirm`: Confirm action (`admin` only).
- `POST /api/v1/actions/pending/{action_id}/reject`: Reject action (`admin` only).

---

## 7. Disputes & Chargebacks
- `POST /api/v1/disputes/sync`: Synchronize disputes from PayPal Sandbox.
- `GET /api/v1/disputes`: List disputes.
- `GET /api/v1/disputes/{dispute_id}`: Get dispute details.
- `POST /api/v1/disputes/{dispute_id}/evidence`: Submit dispute evidence.
- `POST /api/v1/disputes/{dispute_id}/accept`: Concede dispute claim.

---

## 8. Financial Ledger & Audit Trail
- `GET /api/v1/ledger/summary`: Aggregated financial metrics in integer cents.
- `GET /api/v1/ledger/transactions`: Unified chronological double-entry journal (Credits from orders, Debits from refunds & payouts).
- `GET /api/v1/ledger/audit-logs`: Query immutable audit logs with state diffs.

---

## 9. AI Intelligence & Autonomous Judge Mode
- `GET /api/v1/ai/status`: Check local AI Ollama connectivity.
- `POST /api/v1/ai/chat`: Interactive chat with backend tool calling (`ChatMessage` list).
- `GET /api/v1/ai/tools`: List tools available to active role.
- `POST /api/v1/ai/extract/document`: Extract invoice/bill via vision/OCR.
- `POST /api/v1/judge/transaction`: Judge mode risk evaluation for transaction.
- `POST /api/v1/judge/dispute`: Judge mode dispute arbitration.
- `POST /api/v1/judge/action`: Judge mode pending action risk assessment.
