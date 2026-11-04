# PayOps AI — Frontend & Backend Integration Guide

**File:** `FRONTEND_BACKEND_INTEGRATION.md`  
**Frontend:** React  
**Backend:** Python 3.12+ / FastAPI  
**Database:** SQLite / SQLAlchemy  
**API style:** REST / JSON

## 1. Objective

Connect the existing PayOps AI React frontend to the completed FastAPI backend. Preserve the current multi-page UI, routes, design system in `design.md`, and existing interactions.

Main UI areas:
- Dashboard / Overview
- Transactions
- Payments
- Payouts
- AI Insights
- Risk & Alerts
- Reports
- Activity Log / Audit Log
- Settings
- Authentication

Replace fixture data and hardcoded values with real backend data wherever a matching backend capability exists.

**Do not redesign the UI as part of this task.** Do not modify the completed backend unless explicitly requested.

## 2. Mandatory First Step: Inspect the Actual Backend

Before writing integration code, inspect the backend repository and identify:

- Backend entry point, run command, host, and port.
- FastAPI router registration and route prefixes.
- Implemented HTTP methods and endpoint paths.
- Request bodies, query parameters, path parameters, and headers.
- Pydantic request and response schemas.
- Authentication mechanism, token response shape, expiry, and refresh behavior if implemented.
- Roles and permissions, if implemented.
- Pagination, sorting, and filtering conventions.
- Error response structure.
- CORS configuration.
- PayPal integration status and supported operations.
- AI endpoints and their actual response schemas.
- Database-backed resources and actual status/enumeration values.

Inspect the backend's OpenAPI schema and Swagger UI, normally available at:

```text
http://localhost:<BACKEND_PORT>/openapi.json
http://localhost:<BACKEND_PORT>/docs
```

Use the actual port and paths from the backend configuration. Do not assume these URLs are enabled.

### Required discovery output

Create `API_CONTRACT.md` before connecting pages. For every verified endpoint, document:

| Item | Required information |
|---|---|
| Endpoint | Exact method and path |
| Purpose | What it actually does |
| Authentication | Public, authenticated, or role-restricted |
| Parameters | Exact path, query, and body fields |
| Response | Actual response schema |
| Errors | Actual status codes and error codes |
| Frontend usage | Page or action using it |
| Status | Implemented or unavailable |

Only document endpoints that exist. Mark missing capabilities as **NOT IMPLEMENTED**. Do not invent endpoints, fields, metrics, statuses, or response examples.

If OpenAPI is incomplete, inspect FastAPI routers, dependencies, Pydantic schemas, services, and tests. The backend code is the source of truth.

## 3. Architecture and Request Flow

```text
React Page
   |
   v
Feature Hook / Query
   |
   v
Feature API Service
   |
   v
Shared Axios Client
   |
   | HTTP / JSON
   v
FastAPI Router
   |
   v
Backend Service Layer
   |
   v
SQLAlchemy / Database
```

For AI and PayPal functionality, follow the backend's existing service flow. React must not call private AI providers, model servers, or PayPal credentials directly.

**React owns:** rendering, navigation, user input, client-side validation, loading/error/empty states, display formatting, and calling documented endpoints.

**FastAPI owns:** authentication, authorization, business rules, validation, database access, PayPal server-side integration, AI processing, financial action validation, and audit logging.

The frontend is never the authority for financial permissions or payment status.

## 4. Environment Configuration

Use environment variables for public frontend configuration.

Example for Vite:

```env
VITE_API_BASE_URL=http://localhost:<BACKEND_PORT>
```

Confirm the actual API prefix from registered FastAPI routes before adding `/api` or another prefix.

Never place these in React environment variables:
- PayPal client secrets.
- Private API keys.
- JWT signing secrets.
- Database credentials.
- Internal service credentials.

Frontend environment variables are visible in the built application.

## 5. Shared Axios Client

Create one shared Axios instance, preferably at:

```text
src/lib/api-client.js
```

Responsibilities:
- Read the base URL from the environment.
- Set JSON defaults.
- Attach authentication according to the verified backend contract.
- Handle common HTTP errors.
- Handle unauthorized responses consistently.
- Support request cancellation where useful.
- Never log passwords, tokens, payment credentials, or sensitive payloads.

Example structure (adapt to the existing project and actual auth contract):

```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

export default apiClient;
```

Add interceptors only after confirming how the backend expects authentication and returns errors.

Do not assume `Authorization: Bearer <token>` until verified. Do not add refresh-token behavior unless the backend implements it.

## 6. Authentication Integration

Inspect the actual authentication endpoints and schemas first. Document:

- Login endpoint and request fields.
- Register endpoint, if available.
- Current-user/profile endpoint.
- Logout endpoint, if available.
- Refresh endpoint, if available.
- Token type and expiry.
- Whether tokens are returned in JSON or set as cookies.
- Required headers and cookie settings.
- Available roles and permissions.

Expected flow:

1. User submits the login form.
2. React sends the exact request expected by FastAPI.
3. Backend validates credentials.
4. React processes the actual response format.
5. Store authentication state using the project's established secure approach.
6. Load the current user's profile if supported.
7. Navigate to the appropriate protected page.
8. On logout, call the backend logout endpoint if implemented and clear client authentication state.

Security:
- Never store passwords.
- Never log access or refresh tokens.
- Prefer secure HttpOnly cookies when the backend is designed to use them.
- If bearer tokens are the implemented contract, follow the existing backend design and assess storage risk; do not silently change the backend auth mechanism.
- Do not invent refresh-token or logout endpoints.
- Protected routes are a UX feature, not a replacement for backend authorization.
- Handle expired sessions without infinite redirect loops.

## 7. Frontend Folder Structure

Follow the current project structure where possible. Do not reorganize the entire application unnecessarily.

Recommended structure:

```text
src/
├── app/
│   ├── router/
│   └── providers/
├── components/
│   ├── ui/
│   ├── navigation/
│   ├── feedback/
│   └── data-display/
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── pages/
│   ├── dashboard/
│   ├── transactions/
│   ├── payments/
│   ├── payouts/
│   ├── ai-insights/
│   ├── risk/
│   ├── reports/
│   ├── audit/
│   └── settings/
├── lib/
│   └── api-client.js
├── services/
├── hooks/
├── types/
└── main.jsx
```

Each feature should keep API functions separate from UI components. Do not place Axios calls directly inside large page components.

Example:

```text
features/transactions/
├── api/
│   └── transaction-api.js
├── hooks/
│   └── use-transactions.js
├── components/
└── pages/
    └── transactions-page.jsx
```

## 8. Page-to-API Integration Map

The page names below are UI requirements, **not guaranteed backend endpoints**.

| Frontend page | Data/actions required | Integration rule |
|---|---|---|
| Dashboard | Financial KPIs, trends, operational summary | Map each widget to real endpoint and exact field |
| Transactions | List, detail, filters, pagination, export | Use only supported filters and operations |
| Payments | Payments/captures, status, amount, currency, details | Confirm backend meaning of payment vs transaction |
| Payouts | Payout list and details | If unsupported, retain Planned state |
| AI Insights | AI findings, evidence, confidence, recommendations | Render only fields actually returned |
| Risk & Alerts | Alerts, severity, status, approval actions | Confirm workflow and permission rules |
| Reports | Report data and generation/export | Do not show working export without endpoint |
| Activity/Audit Log | Audit events, filters, export | Preserve immutable/read-only behavior |
| Settings | Profile, integrations, preferences, notifications | Connect only implemented settings endpoints |

### Dashboard
- Identify actual overview endpoint(s).
- Map KPI cards to exact response fields.
- Map charts to actual time-series data.
- Do not calculate financial metrics from unrelated or incomplete fields.
- Do not add demo numbers when API data is absent.
- Show a clear empty state when there are no records.

### Transactions
- Use the actual list endpoint.
- Confirm pagination format: page/limit, offset/limit, or cursor.
- Confirm supported filters and sorting fields.
- Pass only documented query parameters.
- Use the actual detail endpoint.
- Keep internal IDs, PayPal order IDs, and capture IDs distinct.

### Payments
- Confirm whether payment and transaction resources are separate.
- Display amount and currency from the same record.
- Do not combine different currencies into a misleading total or average.
- Use backend status values and map them to UI labels without changing their meaning.

### Payouts
- Inspect whether payout endpoints and database models exist.
- If not implemented, keep the page clearly marked Planned.
- Do not build fake payout tables or fake actions.

### AI Insights
- Inspect actual AI endpoints and response schemas.
- Distinguish transaction evidence from AI-generated interpretation.
- Display model confidence only if returned, preserving its documented scale.
- Do not present recommendations as completed actions.
- Trigger analysis only through a documented endpoint.
- Show backend processing, timeout, and failure states.

### Risk & Alerts
- Inspect alert and approval endpoints, status values, and role checks.
- Do not infer that an alert can be approved, rejected, or dismissed from its appearance alone.
- Require confirmation for supported sensitive actions.
- Refresh the affected resource after successful actions.
- Backend authorization and state-transition rules are authoritative.

### Reports and Audit Log
- Inspect report and audit endpoints.
- Use server-side filters and pagination where supported.
- Export only through a documented endpoint or a defined client-side export of already-loaded permitted data.
- Never add edit/delete controls to immutable audit records.

### Settings
- Connect each tab only to an implemented backend capability.
- Keep unsaved form state separate from persisted data.
- Show success feedback only after backend confirmation.
- Do not display secrets returned by integration endpoints.

## 9. API Service Conventions

Create small service modules grouped by feature.

Example only:

```javascript
// features/transactions/api/transaction-api.js
import apiClient from "../../../lib/api-client";

// Replace the placeholder with the exact verified backend path.
export async function getTransactions(params) {
  const response = await apiClient.get("<VERIFIED_TRANSACTION_LIST_PATH>", {
    params,
  });

  return response.data;
}
```

The placeholder must be replaced with a verified endpoint before use.

Service functions should:
- Accept explicit parameters.
- Return the actual backend response representation.
- Avoid UI-specific formatting.
- Avoid swallowing errors.
- Avoid duplicating endpoint strings across components.

Do not create one generic API service containing every endpoint.

## 10. Request, Response, and Error Handling

Use the backend's actual response contract.

Do not assume every endpoint returns:

```json
{
  "success": true,
  "data": {}
}
```

Endpoints may return a direct object, list, paginated object, or another documented schema. Create shared response helpers only after inspecting actual responses.

Handle these cases where applicable:

| HTTP status | Frontend behavior |
|---|---|
| 400 | Show safe validation/business error |
| 401 | Handle invalid or expired authentication |
| 403 | Show permission denied |
| 404 | Show resource not found |
| 409 | Show state/conflict message |
| 422 | Map backend validation errors to fields |
| 429 | Show rate-limit feedback |
| 500 | Show generic server error |
| Network/timeout | Show connection or timeout state |

Use actual error bodies and error codes. Never display stack traces, SQL errors, secrets, or internal exception details to users.

## 11. Loading, Empty, Error, and Success States

Every page fetching data must support:

1. Initial loading.
2. Loaded with data.
3. Loaded with no data.
4. Request failure.
5. Unauthorized/forbidden state where relevant.
6. Refreshing or mutation-in-progress state where relevant.

Use the existing design system for skeletons, alerts, empty states, and toasts.

Avoid blank pages, fake success messages, infinite spinners after failed requests, replacing valid data with empty arrays on failure, or hiding errors in the console only.

## 12. Server State, Caching, and Refetching

Use the project's existing data-fetching approach. If none exists, choose one consistent solution (for example, TanStack Query) rather than mixing state libraries.

Requirements:
- Cache read-only data appropriately.
- Refetch after successful mutations.
- Invalidate only affected queries.
- Avoid duplicate requests from unnecessary effects.
- Cancel obsolete requests when a page or filter changes.
- Debounce search only where useful.
- Do not cache sensitive data beyond session requirements.

Do not add a new library if the existing project already handles these needs cleanly.

## 13. Pagination, Search, Filters, and Sorting

Inspect the backend contract for each list endpoint.

- Use server-side pagination if supported.
- Use exact backend parameter names.
- Preserve filters when changing pages if supported.
- Reset to the first page when filters change, where appropriate.
- Show total count only if the API returns it.
- Do not claim sorting is server-side if it is local.
- Do not send unsupported filter parameters.

## 14. Financial Data Rules

- Preserve amount precision from the API.
- Use the record's currency code.
- Format values for display without changing stored values.
- Avoid floating-point arithmetic for financial calculations; use decimal-safe handling where calculations are required.
- Do not sum different currencies without a documented conversion rate and methodology.
- Distinguish gross volume, captured amount, refunded amount, and payout amount.
- Use backend status as the source of truth.
- Do not optimistically mark a payment, refund, approval, or payout successful before server confirmation.
- Do not trigger payment actions from a page-load effect.

## 15. PayPal Integration Boundary

PayPal credentials and private operations must remain on the backend.

React should call only documented FastAPI application endpoints.

The frontend must not:
- Contain PayPal client secrets.
- Call private PayPal APIs using server credentials.
- Process or verify webhooks.
- Decide whether a payment is captured, refunded, or settled.
- Mark an operation successful before backend confirmation.

Inspect which PayPal Sandbox operations are actually implemented and map only those operations to the UI.

Keep the environment indicator (Sandbox/production) consistent with actual backend configuration or a safe backend status endpoint.

## 16. CORS and Local Development

Inspect FastAPI CORS middleware. Allow only required frontend development and deployed origins.

If authentication uses cookies:
- Configure credential support on the backend.
- Use explicit allowed origins, not `*`.
- Configure cookie `SameSite`, `Secure`, and domain behavior for deployment.
- Configure Axios credentials only if required by the verified cookie-based contract.

If authentication uses bearer tokens, follow the backend's actual header contract.

Do not weaken CORS to hide an integration error.

## 17. Security and Authorization

- Backend is authoritative for every protected operation.
- Hide unavailable actions based on verified permissions, but still rely on backend authorization.
- Never trust role names or permissions supplied only by client-side state.
- Never expose private keys or server secrets.
- Do not log authentication headers or sensitive payment data.
- Do not put payment credentials in local storage.
- Validate user input on frontend and backend.
- Do not allow client-side changes to bypass approval rules.
- Do not automatically retry financial mutations after an ambiguous network failure.

## 18. Integration Testing Plan

### Phase 1 — Connectivity
- [ ] Backend starts successfully.
- [ ] Frontend starts successfully.
- [ ] Frontend can reach backend base URL.
- [ ] CORS works for the local frontend origin.
- [ ] A verified health endpoint works, if implemented.

### Phase 2 — Authentication
- [ ] Login uses the actual request schema.
- [ ] Invalid credentials show a useful error.
- [ ] Authenticated requests use the correct token/cookie mechanism.
- [ ] Protected routes behave correctly.
- [ ] Expired sessions are handled.
- [ ] Logout follows actual backend capability.

### Phase 3 — Read operations
- [ ] Dashboard loads actual data.
- [ ] Transactions list and details load.
- [ ] Payments list and details load.
- [ ] AI Insights load where supported.
- [ ] Risk and alerts load where supported.
- [ ] Reports and audit logs load where supported.
- [ ] Unsupported modules remain clearly unavailable/planned.

### Phase 4 — Filters and pagination
- [ ] Search uses documented parameters.
- [ ] Filters use valid backend enum values.
- [ ] Pagination matches backend contract.
- [ ] Empty results render correctly.
- [ ] Errors do not masquerade as empty results.

### Phase 5 — Mutations
- [ ] Profile/settings updates work where implemented.
- [ ] Approval actions enforce backend permissions.
- [ ] Financial actions require confirmation.
- [ ] Success is shown only after server confirmation.
- [ ] Failed/timed-out mutations do not create false success states.
- [ ] Affected data refreshes after successful mutations.

### Phase 6 — Final verification
- [ ] No fabricated API endpoints remain.
- [ ] No fake production data remains.
- [ ] No private secrets appear in frontend bundle.
- [ ] No authentication token appears in logs.
- [ ] No broken routes or console errors remain.
- [ ] Desktop and mobile layouts still follow `design.md`.
- [ ] All visible controls have a real supported action or clear unavailable state.

## 19. Implementation Sequence

Follow this order. Do not connect every page in one uncontrolled pass.

### Step 1 — Backend discovery
Inspect routes, schemas, authentication, CORS, and OpenAPI.

Deliver: `API_CONTRACT.md`.

### Step 2 — Connectivity
Configure environment variables and shared Axios client. Verify one safe backend request.

### Step 3 — Authentication
Connect login, session handling, protected routes, and logout/refresh only where supported.

### Step 4 — Shared API infrastructure
Implement error handling, request handling, query strategy, and common response types based on the actual contract.

### Step 5 — Read-only pages
Connect Dashboard, Transactions, Payments, AI Insights, Risk, Reports, and Audit Log one by one, where endpoints exist.

### Step 6 — Mutations
Connect settings and approval/payment-related actions only after confirming backend behavior and permissions.

### Step 7 — Verification
Run the complete integration checklist and fix regressions.

After each step, run the application and verify the affected feature before proceeding.

## 20. Required Deliverables

At completion, provide:

1. `API_CONTRACT.md` — verified endpoint and schema mapping.
2. Updated `.env.example` — public frontend configuration only.
3. Shared API client.
4. Feature-specific API service modules.
5. Authentication integration.
6. Connected page data and actions where supported.
7. Consistent loading, empty, error, and success states.
8. Integration test results.
9. List of backend features without frontend support.
10. List of UI features that cannot be connected because the backend does not implement them.

## 21. Non-Negotiable Rules

1. Do not modify the completed backend unless explicitly requested.
2. Do not change backend endpoint paths or response schemas to suit the frontend.
3. Do not invent endpoints, request fields, response fields, statuses, or permissions.
4. Do not replace real backend data with hardcoded demo data.
5. Do not expose PayPal secrets or private credentials.
6. Do not bypass authentication or authorization.
7. Do not claim a financial action succeeded until backend confirmation.
8. Do not remove existing UI features because an endpoint has not yet been found.
9. Mark unsupported features clearly and document them.
10. Preserve the existing React design and multi-page navigation.
11. Keep API calls out of presentation components.
12. Inspect, document, implement, and test in that order.

---

## Final Instruction to the Coding Agent

Start by inspecting the actual FastAPI backend and generating `API_CONTRACT.md`.

Do not begin by writing guessed Axios calls.

Once the verified API contract is complete, connect the existing React frontend feature by feature. Preserve the current PayOps AI UI, use real backend data, enforce backend authentication and permission rules, and test every connected workflow.

The goal is a working React + FastAPI application, not merely a dashboard that looks connected.
