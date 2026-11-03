# PayOps AI --- Frontend Design System

**Document:** `design.md`\
**Product:** PayOps AI\
**Purpose:** Visual, interaction, component, and frontend architecture
standards\
**Theme:** Professional light fintech SaaS\
**Status:** Recommended baseline for implementation

------------------------------------------------------------------------

## 1. Product design direction

PayOps AI should look and behave like a reliable financial operations
product, not a generic AI chat demo.

### Design principles

1.  **Trust first:** restrained colors, clear hierarchy, precise
    numbers, and predictable interactions.
2.  **Information density with breathing room:** show useful operational
    data without overcrowding screens.
3.  **AI as an assistant, not the entire product:** AI insights should
    be embedded into workflows, reports, alerts, and transaction
    details.
4.  **Actionable states:** every alert, risk label, and recommendation
    should make the next step clear.
5.  **Consistency:** shared navigation, spacing, typography, tables,
    filters, and feedback patterns across all pages.
6.  **Accessible by default:** do not communicate status through color
    alone; pair color with text and/or an icon.

### Visual references

Aim for the clarity of Stripe's financial dashboards, the structured
workflows of Linear, and the restrained enterprise styling of modern
banking software. Do not copy any one product's interface.

------------------------------------------------------------------------

## 2. Color system

Use a light theme as the default. Keep the main canvas cool and very
light, with white cards and navy text. Blue is the primary action color;
green, amber, and red are reserved for semantic states.

### Core palette

  -----------------------------------------------------------------------
  Token                   Hex                     Usage
  ----------------------- ----------------------- -----------------------
  `brand-900`             `#142B4A`               Deep navy, brand
                                                  emphasis, selected dark
                                                  elements

  `brand-800`             `#1E3A5F`               Strong headings or dark
                                                  navigation accents

  `primary-700`           `#1D4ED8`               Hover/pressed primary
                                                  actions

  `primary-600`           `#2563EB`               Primary buttons, links,
                                                  active controls

  `primary-100`           `#DBEAFE`               Selected backgrounds
                                                  and subtle highlights

  `primary-50`            `#EFF6FF`               Very light blue
                                                  surfaces

  `canvas`                `#F5F8FC`               Application page
                                                  background

  `surface`               `#FFFFFF`               Cards, dialogs,
                                                  dropdowns, panels

  `surface-subtle`        `#F8FAFC`               Table headers,
                                                  secondary panels

  `border`                `#E2E8F0`               Default borders and
                                                  dividers

  `border-strong`         `#CBD5E1`               Emphasized borders

  `text-primary`          `#0F172A`               Main text and headings

  `text-secondary`        `#475569`               Supporting text

  `text-muted`            `#64748B`               Metadata, placeholders,
                                                  captions

  `success`               `#059669`               Successful payments and
                                                  completed states

  `success-bg`            `#ECFDF5`               Success badges and
                                                  banners

  `warning`               `#D97706`               Pending, review, and
                                                  warning states

  `warning-bg`            `#FFFBEB`               Warning badges and
                                                  banners

  `danger`                `#DC2626`               Failed payments,
                                                  destructive actions

  `danger-bg`             `#FEF2F2`               Error badges and
                                                  banners

  `info`                  `#0284C7`               Informational notices

  `info-bg`               `#F0F9FF`               Informational
                                                  backgrounds
  -----------------------------------------------------------------------

### Color usage rules

-   Use `#F5F8FC` for the app canvas and `#FFFFFF` for most content
    surfaces.
-   Use `#2563EB` for the main action on a page. Avoid multiple
    competing primary buttons.
-   Use navy for branding and strong text, not as a large background on
    every screen.
-   Green means success, amber means attention/review, and red means
    failure or destructive action.
-   Keep semantic colors consistent across dashboard cards, charts,
    tables, filters, and detail pages.
-   Do not use bright gradients, neon colors, or large saturated
    backgrounds.
-   Never rely on color alone: pair status colors with labels such as
    `Successful`, `Pending`, `Failed`, or `Needs review`.

### Suggested CSS variables

``` css
:root {
  color-scheme: light;

  --color-brand-900: #142B4A;
  --color-brand-800: #1E3A5F;
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-soft: #EFF6FF;

  --color-canvas: #F5F8FC;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F8FAFC;
  --color-border: #E2E8F0;
  --color-border-strong: #CBD5E1;

  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #64748B;

  --color-success: #059669;
  --color-success-bg: #ECFDF5;
  --color-warning: #D97706;
  --color-warning-bg: #FFFBEB;
  --color-danger: #DC2626;
  --color-danger-bg: #FEF2F2;
  --color-info: #0284C7;
  --color-info-bg: #F0F9FF;
}
```

------------------------------------------------------------------------

## 3. Typography

### Font family

Use **Inter** throughout the application. Load it locally or through a
trusted font provider and provide a system fallback.

``` css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
             sans-serif;
```

### Type scale

  Role                    Size     Weight   Line height
  ----------------- ---------- ---------- -------------
  Page title          28--32px   650--700           1.2
  Section heading     20--24px        600           1.3
  Card heading        16--18px        600           1.4
  Body                14--16px        400           1.5
  Supporting text     13--14px        400           1.5
  Labels              12--13px   500--600           1.4
  Table content       13--14px   400--500          1.45
  KPI amount          26--32px   650--700           1.2

### Typography rules

-   Use sentence case for page titles, buttons, labels, and navigation.
-   Avoid all-caps headings. Small uppercase overlines may be used
    sparingly.
-   Use semibold rather than bold for most headings.
-   Use tabular numerals for transaction IDs, dates, counts, and
    currency values.
-   Align currency amounts consistently, preferably right-aligned in
    tables.
-   Use Indian number formatting when the account currency is INR,
    e.g. `₹12,45,000.00`. Format other currencies according to their
    locale.
-   Never use font size alone to indicate importance; combine size,
    weight, and spacing.

------------------------------------------------------------------------

## 4. Layout and spacing

### Application shell

Use a consistent application shell on authenticated pages:

-   **Left sidebar:** 248px expanded, approximately 76px collapsed.
-   **Top bar:** 64--72px high.
-   **Main content:** fluid width with a maximum comfortable reading
    width for text-heavy pages.
-   **Page padding:** 28--32px on desktop, 20--24px on tablet, 16px on
    mobile.
-   **Content spacing:** 24px between major sections; 16px between
    related components.
-   **Card padding:** 20--24px.
-   **Form field spacing:** 16--20px.

### Spacing scale

Use a 4px base unit:

  Token          Value
  ------------ -------
  `space-1`        4px
  `space-2`        8px
  `space-3`       12px
  `space-4`       16px
  `space-5`       20px
  `space-6`       24px
  `space-8`       32px
  `space-10`      40px
  `space-12`      48px
  `space-16`      64px

### Grid behavior

-   Desktop: use 12-column or CSS Grid layouts.
-   KPI cards: 4 across on wide screens, 2 across on tablet, 1 across on
    narrow mobile.
-   Charts: allow full-width charts when labels or time ranges need
    room.
-   Tables: preserve readable column widths; use horizontal scrolling on
    small screens rather than crushing every column.
-   Avoid arbitrary fixed widths for the main content area.

------------------------------------------------------------------------

## 5. Shape, borders, and elevation

### Radius

  Element                       Radius
  --------------------------- --------
  Small controls and badges     6--8px
  Inputs and buttons               8px
  Cards and panels                12px
  Large dialogs                   16px
  Pills                          999px

### Borders and shadows

-   Default card border: `1px solid #E2E8F0`.
-   Prefer subtle borders over heavy shadows.
-   Card shadow: `0 1px 2px rgba(15, 23, 42, 0.04)`.
-   Dropdown/dialog shadow: `0 12px 32px rgba(15, 23, 42, 0.12)`.
-   Do not put a shadow on every nested element.
-   Use clear focus rings and hover borders rather than dramatic glow
    effects.

------------------------------------------------------------------------

## 6. Buttons

### Variants

  -----------------------------------------------------------------------
  Variant                 Appearance              Use
  ----------------------- ----------------------- -----------------------
  Primary                 Blue fill, white text   Main page action,
                                                  submit, confirm

  Secondary               White fill, slate       Secondary actions
                          border                  

  Tertiary/Ghost          Transparent, text/icon  Low-emphasis actions

  Destructive             Red fill or red text    Delete, revoke,
                                                  permanently remove

  Link                    Blue text               Inline navigation or
                                                  supporting action
  -----------------------------------------------------------------------

### Sizing

-   Small: 32px high, 12--13px text.
-   Medium: 40px high, 14px text. Default.
-   Large: 44--48px high, 15--16px text.
-   Horizontal padding: 12--16px.
-   Icon-only buttons: at least 36px square, with an accessible
    tooltip/label.

### Interaction states

Every interactive button must have default, hover, active,
focus-visible, disabled, and loading states.

``` css
.button-primary {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  font: inherit;
  font-weight: 600;
  transition: background-color 140ms ease, box-shadow 140ms ease;
}

.button-primary:hover {
  background: var(--color-primary-hover);
}

.button-primary:focus-visible {
  outline: 3px solid #93C5FD;
  outline-offset: 2px;
}

.button-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
```

### Button rules

-   One visually dominant primary action per page or dialog.
-   Use verbs: `Create report`, `Review payment`, `Retry payment`.
-   Do not use vague labels such as `Click here`.
-   Confirm destructive operations with a dialog that explains the
    consequence.
-   Show a loading state during asynchronous requests and prevent
    accidental duplicate submissions.

------------------------------------------------------------------------

## 7. Forms and inputs

### Field anatomy

Each field should include: 1. Visible label. 2. Input/control. 3.
Optional helper text. 4. Inline validation/error message.

### Input styling

-   Height: 40--44px.
-   Border: `1px solid #CBD5E1`.
-   Radius: 8px.
-   Horizontal padding: 12px.
-   Placeholder: muted slate, never a substitute for a label.
-   Focus: blue border plus visible focus ring.
-   Error: red border and a concise explanation below the field.

### Form behavior

-   Validate on blur and on submit; avoid showing errors before the user
    has interacted.
-   Preserve entered values when a recoverable server error occurs.
-   Use appropriate input types and autocomplete attributes.
-   Format currency and dates for display, but submit canonical values
    to the API.
-   Make required fields explicit.
-   For long forms, group fields into meaningful sections and show a
    clear save/submit action.

------------------------------------------------------------------------

## 8. Icons

### Recommended library

Use **Lucide React** (`lucide-react`) for a consistent, clean outline
icon set.

Suggested icons:

  Purpose           Icon
  ----------------- --------------------------------
  Overview          `LayoutDashboard`
  Transactions      `ArrowLeftRight`
  Payments          `CreditCard`
  Payouts           `Wallet`
  Risk / fraud      `ShieldAlert`
  AI insights       `Sparkles`
  Reports           `ChartNoAxesCombined`
  Customers         `Users`
  Settings          `Settings`
  Notifications     `Bell`
  Search            `Search`
  Filter            `SlidersHorizontal`
  Calendar          `CalendarDays`
  Download          `Download`
  External link     `ExternalLink`
  Success           `CircleCheck`
  Warning           `TriangleAlert`
  Failure           `CircleX`
  More actions      `MoreHorizontal`
  Expand/collapse   `ChevronDown` / `ChevronRight`

### Icon rules

-   Sidebar icons: 18--20px.
-   Inline/action icons: 16--18px.
-   Empty-state illustrations/icons: 36--48px.
-   Use consistent stroke width, normally 1.75--2.
-   Do not mix emoji, filled icons, and multiple icon libraries in the
    same interface.
-   Icon-only controls need accessible names and tooltips.

------------------------------------------------------------------------

## 9. Navigation and multi-page information architecture

The product should be organized as a multi-page application with
distinct URLs and page components. Do not implement the entire product
as one giant dashboard view with conditional content.

### Suggested route structure

``` text
/
├── login
├── forgot-password
├── dashboard
├── transactions
│   └── :transactionId
├── payments
│   └── :paymentId
├── payouts
├── disputes
│   └── :disputeId
├── risk
│   └── :alertId
├── ai-insights
│   └── :insightId
├── reports
│   └── :reportId
├── activity
└── settings
    ├── profile
    ├── team
    ├── integrations
    └── notifications
```

Treat this as a recommended information architecture. Keep, rename, or
remove modules to match the backend capabilities actually implemented.
Do not expose routes for unsupported features.

### Sidebar

Recommended grouping:

**Workspace** - Overview - Transactions - Payments - Payouts

**Intelligence** - AI Insights - Risk & Alerts - Reports

**Administration** - Activity Log - Settings

Use active navigation styling with a pale blue background, blue
icon/text, and a subtle left indicator. Include a clear collapse
control. On mobile, use a drawer.

### Top bar

Include: - Breadcrumb or current page title. - Global search only if it
searches real product data. - Date range or workspace selector where
relevant. - Notifications. - User avatar/menu. - Optional contextual
action on the right.

------------------------------------------------------------------------

## 10. Page design specifications

### 10.1 Login

-   Clean split layout or centered form on a soft canvas.
-   Brand mark and short product description.
-   Email and password fields.
-   Password visibility toggle.
-   Remember-me option only if supported.
-   Forgot-password link.
-   Primary `Sign in` action.
-   Clear loading, invalid-credentials, and server-error states.
-   Do not add social login buttons unless those providers are
    implemented.

### 10.2 Dashboard / Overview

Suggested hierarchy:

1.  Page heading: `Overview`, with date range and relevant primary
    action.
2.  KPI row: total processed volume, successful payments, failed
    payments, and success rate, only where these metrics exist in the
    backend.
3.  Main trend chart: transaction volume or payment success over time.
4.  Secondary visualizations: payment status distribution and failure
    trends.
5.  Recent transactions table.
6.  AI operational summary or high-priority insights panel.

KPI cards should contain a clear label, large value, optional comparison
period, and small trend indicator. Never fabricate metrics or show
placeholder values as real data.

### 10.3 Transactions

-   Page title and short description.
-   Search by transaction ID or supported fields.
-   Filters for status, date range, amount, and payment method where
    supported.
-   Table columns should reflect actual API fields, such as ID, date,
    customer, amount, method, status, and action.
-   Server-side pagination and sorting for large datasets.
-   Clicking a row opens a transaction detail route.
-   Include loading skeleton, empty state, error state, and retry
    action.

### 10.4 Transaction detail

Use a two-column desktop layout where practical:

-   Main column: transaction summary, timeline, payment details,
    customer details.
-   Side panel: status, risk/AI assessment if available, and permitted
    actions.
-   Display IDs and timestamps in copyable, readable formats.
-   Distinguish event time from processing time.
-   Make retry/refund/reversal actions available only when the backend
    authorizes and supports them.
-   Destructive or financial actions require confirmation and clear
    outcome feedback.

### 10.5 AI Insights

This should be a differentiating page, not just a chat screen.

-   Insight summary cards with severity, confidence (only if supplied by
    the model), affected records, and generated time.
-   Separate observed facts from AI-generated interpretation.
-   Show the evidence or transaction references behind an insight.
-   Provide a clear recommendation and next action.
-   Include feedback controls only if feedback is captured by the
    backend.
-   Label generated content as AI-generated.
-   Avoid presenting model output as guaranteed truth or as an executed
    action.

### 10.6 Risk and alerts

-   Prioritize by severity and age.
-   Use clear status labels: `New`, `Investigating`, `Resolved`, or the
    exact backend states.
-   Provide filters and a detail view with evidence.
-   Make assignment and resolution controls conditional on implemented
    permissions.
-   Show timestamps and audit history.

### 10.7 Reports

-   Report title, date range, and available filters.
-   Charts with clear units, legends, and readable axes.
-   Export buttons only for supported formats and endpoints.
-   Show the applied filters and generation timestamp.
-   Include empty and failed-generation states.

### 10.8 Settings

-   Organize settings into separate sections or nested routes.
-   Show the current user's permissions where relevant.
-   Confirm changes that affect integrations, team access, or security.
-   Never expose API secrets or full tokens in the browser.

------------------------------------------------------------------------

## 11. Tables and data visualization

### Tables

-   Header background: `#F8FAFC`.
-   Header text: 12px, medium/semibold, muted.
-   Row height: approximately 52--60px.
-   Horizontal separators: `#E2E8F0`.
-   Hover: subtle `#F8FAFC`.
-   Use tabular numerals and right-align numeric/currency columns.
-   Keep row actions in a consistent final column.
-   Use sticky headers only when the table is long enough to benefit.
-   Provide pagination, page size, and result count when backed by the
    API.

### Status badges

  State        Background   Text
  ------------ ------------ -----------
  Successful   `#ECFDF5`    `#047857`
  Pending      `#FFFBEB`    `#B45309`
  Failed       `#FEF2F2`    `#B91C1C`
  Processing   `#EFF6FF`    `#1D4ED8`
  Cancelled    `#F1F5F9`    `#475569`

Use a small dot only as a secondary visual cue. Always include the
status text.

### Charts

-   Use a consistent chart library such as Recharts.
-   Keep chart backgrounds white or transparent.
-   Use the primary blue for the main series; use semantic colors only
    when they represent semantic categories.
-   Include tooltips with exact values and units.
-   Label axes clearly and avoid unnecessary gridlines.
-   Do not use 3D charts or decorative chart effects.
-   Ensure charts have a useful text summary or accessible alternative.

------------------------------------------------------------------------

## 12. AI-specific UI patterns

PayOps AI should communicate the difference between data, model
interpretation, and actions.

### AI insight panel

Recommended structure:

-   `AI insight` label with a restrained sparkle icon.
-   Concise insight headline.
-   Severity or priority label.
-   Short explanation.
-   Evidence links or referenced records.
-   Recommendation.
-   Action button, if an action exists and is authorized.
-   Generated timestamp and model/source metadata where appropriate.

### AI interaction rules

-   Use a side panel or dedicated page for detailed AI explanations.
-   Do not make a chatbot the default landing page unless conversation
    is the product's main workflow.
-   Clearly label generated recommendations.
-   Show uncertainty honestly; do not invent confidence scores.
-   Never imply an action has been executed until the backend confirms
    it.
-   For long-running analysis, show progress and allow safe navigation
    away if the job supports it.
-   Preserve the user's context when moving from an insight to a
    referenced transaction.

------------------------------------------------------------------------

## 13. Feedback, loading, empty, and error states

Every data-driven page must define all four states.

### Loading

-   Use skeletons shaped like the content being loaded.
-   Avoid a full-page spinner for routine table or card requests.
-   Disable duplicate submissions while a request is in progress.
-   Use progress indicators for long-running operations only when
    progress information is available.

### Empty

-   Explain what is empty: no transactions, no alerts, no reports, etc.
-   Explain how to populate the view when useful.
-   Provide a relevant action only if it is supported.
-   Do not make an empty state look like an error.

### Error

-   Use plain language and a retry action when retry is safe.
-   Preserve filters and form input.
-   Do not expose stack traces, raw SQL, secrets, or internal exception
    details.
-   Distinguish validation errors, permission errors, network errors,
    and server errors.

### Success

-   Use a toast for short confirmations.
-   Use an inline confirmation for persistent workflow outcomes.
-   For financial operations, show the confirmed result and relevant
    reference ID.
-   Do not show success before the server confirms success.

------------------------------------------------------------------------

## 14. Motion and interaction

-   Use short transitions, generally 120--180ms.
-   Animate hover, focus, dropdown, drawer, and modal transitions
    subtly.
-   Avoid parallax, bouncing, animated gradients, and unnecessary
    motion.
-   Respect `prefers-reduced-motion`.
-   Use clear pointer, hover, focus, and disabled states.
-   All core workflows must be usable by keyboard.

------------------------------------------------------------------------

## 15. Responsive behavior

### Desktop: 1200px and above

-   Expanded sidebar by default.
-   Four-column KPI layout where space allows.
-   Full data tables and multi-column detail layouts.

### Tablet: 768px--1199px

-   Collapsible sidebar.
-   Two-column KPI layout.
-   Stack detail panels when needed.
-   Preserve table usability with horizontal scrolling or prioritized
    columns.

### Mobile: below 768px

-   Sidebar becomes a navigation drawer.
-   One-column content layout.
-   KPI cards stack or use a compact two-column grid where readable.
-   Tables use horizontal scrolling or a deliberate mobile list/card
    representation.
-   Keep primary actions visible and reachable.
-   Dialogs should fit the viewport and scroll internally.
-   Do not hide critical transaction status or amount information.

------------------------------------------------------------------------

## 16. Accessibility requirements

Target WCAG 2.2 AA where practical.

-   Use semantic landmarks, headings, buttons, links, and form labels.
-   Ensure keyboard navigation and visible focus indicators.
-   Provide accessible names for icon-only controls.
-   Maintain sufficient text and control contrast.
-   Do not communicate status through color alone.
-   Associate validation messages with their fields.
-   Use appropriate dialog focus management and Escape behavior.
-   Support zoom and responsive reflow.
-   Respect reduced-motion preferences.
-   Provide chart summaries or data alternatives.

------------------------------------------------------------------------

## 17. React frontend architecture

### Recommended approach

Use React with a multi-page route structure and shared layouts. Use
React Router for URL-based navigation, nested layouts, route-level
loading/error boundaries, and page components.

**Important distinction:** a React application using React Router is
commonly still a client-rendered SPA. If the requirement means true
separate HTML documents and full browser page loads, configure a
multi-page build or use a framework/build setup that supports multiple
entry points. Confirm this architectural meaning before implementation.
Do not claim that adding routes alone turns a SPA into a traditional
multi-page application.

### Suggested folder structure

``` text
src/
├── app/
│   ├── router/
│   ├── providers/
│   └── layouts/
├── assets/
├── components/
│   ├── ui/
│   ├── navigation/
│   ├── data-display/
│   ├── feedback/
│   └── charts/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── transactions/
│   ├── payments/
│   ├── ai-insights/
│   ├── risk/
│   ├── reports/
│   └── settings/
├── hooks/
├── lib/
├── services/
├── styles/
│   ├── tokens.css
│   ├── globals.css
│   └── utilities.css
├── types/
└── main.jsx
```

### Architecture rules

-   Keep each page in its own feature folder.
-   Build reusable primitives for buttons, inputs, cards, badges,
    dialogs, tables, and page headers.
-   Keep API calls in service modules, not directly inside visual
    components.
-   Keep API response types and formatting utilities centralized.
-   Keep authentication and authorization logic separate from
    presentation.
-   Use route guards based on actual authentication and permissions.
-   Keep secrets on the backend; never place private API keys in
    frontend environment variables.
-   Use environment variables only for public configuration such as the
    backend base URL.
-   Handle API loading, empty, success, validation, and failure states
    consistently.
-   Avoid giant components, duplicated styling, and arbitrary inline
    CSS.
-   Use the actual backend API contract. Do not invent endpoints,
    response fields, metrics, or workflow actions.

### Recommended frontend libraries

  -----------------------------------------------------------------------
  Need                                Recommendation
  ----------------------------------- -----------------------------------
  Routing                             React Router

  Styling                             CSS Modules or a consistent
                                      utility/CSS system

  Icons                               Lucide React

  Charts                              Recharts

  Server state                        TanStack Query, if the project
                                      needs caching/refetching

  Forms                               React Hook Form

  Validation                          Zod

  Dates                               date-fns

  Tables                              TanStack Table for complex data
                                      grids
  -----------------------------------------------------------------------

Choose a small, consistent set. Do not install multiple libraries that
solve the same problem.

------------------------------------------------------------------------

## 18. Design quality checklist

### Visual consistency

-   [ ] Only the approved light palette is used.
-   [ ] Inter typography and the defined type scale are applied.
-   [ ] Spacing, radii, borders, and shadows use shared tokens.
-   [ ] Buttons, badges, inputs, and cards are consistent.
-   [ ] Icons come from Lucide React.

### Product usability

-   [ ] Each major feature has its own route and page component.
-   [ ] Sidebar active state matches the current route.
-   [ ] Tables support useful filtering, sorting, and pagination where
    available.
-   [ ] Every async view has loading, empty, and error states.
-   [ ] Financial actions have confirmation and server-confirmed
    feedback.
-   [ ] AI-generated insights are clearly labeled and evidence-linked.

### Engineering

-   [ ] UI components are reusable and accessible.
-   [ ] API logic is separated from presentation.
-   [ ] No backend endpoint or data field is fabricated.
-   [ ] No secrets are exposed in the client.
-   [ ] Responsive behavior is tested at desktop, tablet, and mobile
    widths.
-   [ ] Keyboard navigation and visible focus are tested.

------------------------------------------------------------------------

## 19. Final visual standard

The finished PayOps AI interface should feel:

-   **Professional:** suitable for finance and operations teams.
-   **Trustworthy:** restrained color, accurate data presentation, clear
    states.
-   **Modern:** clean layouts, subtle borders, consistent iconography.
-   **Intelligent:** AI insights integrated into operational workflows.
-   **Practical:** fast to scan, easy to navigate, and responsive.

The design should prioritize clarity and operational confidence over
decoration. Every visual element must help the user understand payment
activity, identify problems, or take an authorized next step.
