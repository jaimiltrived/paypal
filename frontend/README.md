# PayOps AI — Frontend Console

An enterprise-grade, high-reliability payment operations and AI risk intelligence frontend built with React, Vite, React Router DOM, and Lucide Icons. Designed strictly according to the single source of truth: [`design.md`](./design.md).

---

## 1. Quick Start

### Prerequisites
- Node.js `v20.0+` (tested with Node `v23.6.1`)
- npm `v10.0+`

### Installation & Execution

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server (runs on http://localhost:5173)
npm run dev

# 4. Build for production (optimized chunking)
npm run build

# 5. Preview production build
npm run preview
```

---

## 2. Architecture & Design Implementation

The PayOps AI frontend implements a strict, multi-page client architecture adhering to [`design.md`](./design.md):

- **Palette**: Professional fintech light theme. Canvas `#F5F8FC`, Surface `#FFFFFF`, Brand Navy `#142B4A`, Primary Blue `#2563EB`, Emerald `#059669`, Amber `#D97706`, Crimson `#DC2626`.
- **Typography**: Inter font with tabular numerals (`tabular-nums`) for currency amounts, timestamps, and order UUIDs.
- **Financial Accuracy**: Monetary values strictly stored and computed as integer cents (e.g. `$345.00` = `34500` cents) to avoid floating point inaccuracies. Currency formatting handles USD, EUR, and Indian Number formatting for INR (`en-IN`).
- **Safety Thresholds**: Highlights high-value refund dual-confirmation policies ($100.00 default threshold).
- **AI Copilot Transparency**: Distinguishes AI-generated hypothesis/interpretation from verified SQLite audit records and PayPal webhook captures.

---

## 3. Directory Structure

```
frontend/
├── index.html                  # HTML entry point with Inter font preload
├── vite.config.js              # Vite configuration with code-splitting chunks
├── package.json
├── design.md                   # Single source of truth design system
└── src/
    ├── main.jsx                # Application entrypoint & CSS import
    ├── App.jsx                 # Router & ToastProvider root
    ├── styles/
    │   ├── tokens.css          # Design system CSS custom properties
    │   ├── global.css          # Global typography, resets, responsive utilities
    │   └── components.css      # Reusable primitives (buttons, inputs, cards, badges)
    ├── components/
    │   ├── layout/
    │   │   ├── Breadcrumbs.jsx # Route hierarchy breadcrumbs
    │   │   ├── PageContainer.jsx # Responsive max-width & padding shell
    │   │   ├── PageHeader.jsx  # Consistent page heading & actions bar
    │   │   ├── Sidebar.jsx     # 248px collapsible sidebar with tooltips & active states
    │   │   └── Topbar.jsx      # Top navigation with global search, notifications, & user menu
    │   └── ui/
    │       ├── Button.jsx      # Primary, secondary, ghost, destructive buttons
    │       ├── IconButton.jsx  # Accessible icon-only buttons
    │       ├── Input.jsx       # Standard form field with prefix/suffix & validation
    │       ├── Select.jsx      # Form select dropdown
    │       ├── SearchInput.jsx # Search control with clear button
    │       ├── Card.jsx        # Enterprise card container with headers & footers
    │       ├── Badge.jsx       # Semantic state badge with dot indicator
    │       ├── StatusBadge.jsx # Payment gateway status badges (Completed, Pending, Failed)
    │       ├── Table.jsx       # Data grid with custom column renderers
    │       ├── Pagination.jsx  # Server-style pagination controls
    │       ├── Modal.jsx       # Accessible modal dialog with backdrop & Escape listener
    │       ├── Dropdown.jsx    # Popover menu for row actions
    │       ├── Tabs.jsx        # Tab navigation controls
    │       ├── SkeletonLoader.jsx # Shimmer loading skeletons
    │       ├── EmptyState.jsx  # Empty state illustration & CTA
    │       └── ErrorState.jsx  # Error message & retry CTA
    ├── layouts/
    │   └── MainLayout.jsx      # Persistent application shell with responsive drawer
    ├── pages/
    │   ├── auth/
    │   │   └── LoginPage.jsx   # Authentication screen with quick-fill demo roles
    │   ├── dashboard/
    │   │   └── DashboardPage.jsx # KPIs, Recharts volume trend, status donut, recent table
    │   ├── transactions/
    │   │   ├── TransactionsPage.jsx # Searchable, filterable transaction grid
    │   │   └── TransactionDetailPage.jsx # 2-column detail audit, timeline, & refund modal
    │   ├── payments/
    │   │   └── PaymentsPage.jsx # Capture ledger, gross settlement & currency filters
    │   ├── payouts/
    │   │   └── PayoutsPage.jsx  # Explicitly labeled Milestone 2 placeholder
    │   ├── ai-insights/
    │   │   ├── AIInsightsPage.jsx # Anomaly detection cards & telemetry evidence
    │   │   └── AIInsightDetailPage.jsx # Triage deep dive, feedback loop & rule mitigate
    │   ├── risk/
    │   │   └── RiskPage.jsx    # Fraud alerts & dual confirmation approval queue
    │   ├── reports/
    │   │   └── ReportsPage.jsx # Double-entry ledger, CSV/JSON export triggers
    │   ├── settings/
    │   │   └── SettingsPage.jsx # Profile, Team RBAC, PayPal Sandbox config, Thresholds
    │   ├── activity/
    │   │   └── ActivityPage.jsx # Immutable audit trail stream
    │   └── common/
    │       └── NotFoundPage.jsx # 404 handler
    ├── context/
    │   └── ToastContext.jsx    # Real-time alert toasts (success, warning, error, info)
    ├── data/
    │   └── fixtures.js         # Isolated dev fixtures matching backend SQLite schema
    ├── services/
    │   ├── apiClient.js        # Axios instance configured for future backend integration
    │   ├── ordersService.js    # Transactions & KPI data layer
    │   ├── aiService.js        # AI operational intelligence data layer
    │   ├── riskService.js      # Risk alerts & dual confirmation queue
    │   ├── reportsService.js   # Ledger reports data layer
    │   └── activityService.js  # Audit log data layer
    └── utils/
        └── formatters.js       # Integer cents currency, date-time, & ID formatting
```

---

## 4. Implemented Route Map

| Route | Component | Description |
|---|---|---|
| `/login` | `LoginPage` | Authentication screen with quick-fill dev credentials for Admin/Operator. |
| `/dashboard` | `DashboardPage` | Executive payment operations overview, KPI cards, Recharts, AI alert. |
| `/transactions` | `TransactionsPage` | Filterable, searchable transactions table with pagination. |
| `/transactions/:transactionId` | `TransactionDetailPage` | Two-column audit view: timeline, PayPal order/capture IDs, refund modal. |
| `/payments` | `PaymentsPage` | Settlement captures table, gross currency volume, and capture filters. |
| `/payouts` | `PayoutsPage` | Explicit Milestone 2 placeholder explaining batch payout roadmap. |
| `/ai-insights` | `AIInsightsPage` | Operational anomaly feed (3DS decline wave, fraud velocity, reserve release). |
| `/ai-insights/:insightId` | `AIInsightDetailPage` | Root-cause evidence, model confidence, human feedback, mitigation trigger. |
| `/risk` | `RiskPage` | Critical security alerts & Pending Dual-Confirmation queue with Approve/Reject. |
| `/reports` | `ReportsPage` | Settlement reconciliation & double-entry ledger exports (CSV/JSON). |
| `/settings/profile` | `SettingsPage` | Operator profile preferences and credentials. |
| `/settings/team` | `SettingsPage` | Team members and RBAC permission roles (Admin, Operator, Auditor). |
| `/settings/integrations` | `SettingsPage` | PayPal Sandbox credentials status, webhook ID, and token cache status. |
| `/settings/notifications` | `SettingsPage` | Dual-confirmation refund thresholds ($100.00) & AI anomaly toggles. |
| `/activity` | `ActivityPage` | Immutable SQLite audit logs viewer with actor, IP, and event filters. |
| `*` | `NotFoundPage` | Clean 404 error page. |

---

## 5. Backend Integration & Hybrid Fallback Architecture

The frontend is fully integrated with the Python FastAPI backend:
1. **API Client & Reverse Proxy**:
   - `src/services/apiClient.js` connects to `/api/v1`, proxied via Vite development server to `http://127.0.0.1:8000`.
   - Automatic JWT Bearer token injection on authenticated requests (`Authorization: Bearer <token>`).
2. **Authentication Context (`AuthContext.jsx`)**:
   - Manages live user authentication against `POST /api/v1/auth/login` and session validation against `GET /api/v1/auth/me`.
   - Seeded test accounts ready for instant login:
     - **Admin**: `admin@payops.ai` / `AdminPassword123!`
     - **Operator**: `operator@payops.ai` / `OperatorPassword123!`
     - **Auditor**: `auditor@payops.ai` / `AuditorPassword123!`
3. **Resilient Hybrid Fallback**:
   - All services (`ordersService`, `riskService`, `activityService`, `reportsService`, `aiService`) attempt live FastAPI endpoints first.
   - If the backend is temporarily offline, they seamlessly fall back to local fixtures (`src/data/fixtures.js`), ensuring zero downtime during frontend design reviews.
4. **Live Actions**:
   - **Dual-Confirmation Approvals**: Calls `POST /api/v1/actions/pending/{id}/confirm` and `/reject`.
   - **Dispute Inflow**: Fetches live disputes from `GET /api/v1/disputes`.
   - **Immutable Audit Trail**: Streams live database events from `GET /api/v1/ledger/audit-logs`.
   - **Gateway Health Ping**: Interactive ping tests live latency against `GET /api/v1/health`.

---

## 6. Placeholder Functionality & Future Roadmap

To preserve system integrity and avoid fabricating non-existent features:
- **Payouts (`/payouts`)**: Labeled as a planned placeholder. The PayPal Sandbox backend currently manages incoming orders, captures, refunds, disputes, and invoices. Outgoing batch disbursements will be wired when the backend introduces the PayPal Payouts SDK.
- **External Export Downloads**: Simulates file generation feedback via toast alerts and pre-built CSV structures. Real streaming exports will be connected to FastAPI's StreamingResponse endpoints.
- **Live Authentication**: Form submission simulates JWT exchange locally without network mutation.

