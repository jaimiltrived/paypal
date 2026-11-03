/**
 * PayOps AI - Development Fixtures
 * 
 * IMPORTANT: These fixtures are strictly for client-side visual testing & development.
 * In accordance with Phase 1 guidelines, no backend connection or live API mutation occurs.
 * Data structures strictly reflect the real PayOps backend schema (integer cents, UUIDs, ISO dates).
 */

export const FIXTURE_USER = {
  id: 'usr_89234b01-a1e4-4c8d-9c3f-7e8912345678',
  email: 'alex.vance@payops.ai',
  full_name: 'Alex Vance',
  role: 'admin',
  department: 'Payment Operations',
  avatar_url: null,
};

export const FIXTURE_KPI_METRICS = {
  total_volume_cents: 148590200, // $1,485,902.00
  total_volume_growth_pct: 12.8,
  successful_transactions: 14289,
  successful_transactions_growth_pct: 8.4,
  failed_transactions: 184,
  failed_transactions_pct_change: -14.2, // decreased failures (good)
  success_rate_pct: 98.73,
  success_rate_target_pct: 99.0,
  dispute_volume_cents: 894000,
  average_ticket_cents: 10400,
  pending_action_count: 6,
};

export const FIXTURE_CHART_VOLUME = [
  { date: 'Oct 28', volume: 172000, successful: 1680, failed: 21 },
  { date: 'Oct 29', volume: 189000, successful: 1840, failed: 24 },
  { date: 'Oct 30', volume: 204000, successful: 1980, failed: 19 },
  { date: 'Oct 31', volume: 221000, successful: 2150, failed: 32 },
  { date: 'Nov 01', volume: 215000, successful: 2090, failed: 18 },
  { date: 'Nov 02', volume: 238000, successful: 2310, failed: 27 },
  { date: 'Nov 03', volume: 246900, successful: 2410, failed: 16 },
];

export const FIXTURE_STATUS_DISTRIBUTION = [
  { name: 'Completed', value: 98.7, count: 14289, color: '#059669' },
  { name: 'Pending Review', value: 0.9, count: 130, color: '#D97706' },
  { name: 'Failed', value: 0.4, count: 54, color: '#DC2626' },
];

export const FIXTURE_ORDERS = [
  {
    id: 'ord_91823-3891-44af-811c-99a012e84120',
    paypal_order_id: '8MN92184KL381920B',
    status: 'COMPLETED',
    currency: 'USD',
    amount_cents: 34500, // $345.00
    description: 'Enterprise API Subscription - Tier 2',
    custom_id: 'CUST-ORG-9102',
    payer_email: 'finance@acmecorp.io',
    capture_id: 'CAP-789218390',
    payment_method: 'PayPal Balance',
    created_at: '2026-11-03T10:14:22Z',
    updated_at: '2026-11-03T10:14:25Z',
    customer: {
      name: 'Acme Corporation',
      email: 'finance@acmecorp.io',
      country: 'US',
    },
  },
  {
    id: 'ord_77182-1204-43cb-9801-11b023f76101',
    paypal_order_id: '4RT81092MN192834C',
    status: 'COMPLETED',
    currency: 'USD',
    amount_cents: 125000, // $1,250.00
    description: 'Hardware POS Terminal Gateway Batch',
    custom_id: 'CUST-ORG-8841',
    payer_email: 'treasury@hyperstream.tech',
    capture_id: 'CAP-443910281',
    payment_method: 'Credit Card (via PayPal)',
    created_at: '2026-11-03T09:42:10Z',
    updated_at: '2026-11-03T09:42:14Z',
    customer: {
      name: 'HyperStream Tech',
      email: 'treasury@hyperstream.tech',
      country: 'US',
    },
  },
  {
    id: 'ord_66192-8921-41bb-a202-33c948d88219',
    paypal_order_id: '9PP72019QQ991820D',
    status: 'FAILED',
    currency: 'USD',
    amount_cents: 8900, // $89.00
    description: 'Developer Seat License Add-on',
    custom_id: 'CUST-ORG-7719',
    payer_email: 'devops@nexustrack.co',
    capture_id: null,
    payment_method: 'Credit Card (via PayPal)',
    error_reason: 'INSTRUMENT_DECLINED: Card issuer declined recurring billing attempt.',
    created_at: '2026-11-03T08:58:33Z',
    updated_at: '2026-11-03T08:58:35Z',
    customer: {
      name: 'Nexus Track Co',
      email: 'devops@nexustrack.co',
      country: 'CA',
    },
  },
  {
    id: 'ord_55102-4412-49aa-b883-22f871e99104',
    paypal_order_id: '1KK88291VV449102A',
    status: 'PENDING',
    currency: 'EUR',
    amount_cents: 48000, // €480.00
    description: 'Annual Cloud Sync Service - EMEA',
    custom_id: 'CUST-ORG-6110',
    payer_email: 'billing@nordicpulse.de',
    capture_id: 'CAP-102948291',
    payment_method: 'SEPA Direct Debit',
    created_at: '2026-11-03T07:15:00Z',
    updated_at: '2026-11-03T07:15:02Z',
    customer: {
      name: 'Nordic Pulse GmbH',
      email: 'billing@nordicpulse.de',
      country: 'DE',
    },
  },
  {
    id: 'ord_44019-3391-48cc-9922-88d726c11029',
    paypal_order_id: '3BB77192ZZ330192X',
    status: 'COMPLETED',
    currency: 'USD',
    amount_cents: 29900, // $299.00
    description: 'Security & Compliance Audit Export Add-on',
    custom_id: 'CUST-ORG-5542',
    payer_email: 'sec-ops@finvault.io',
    capture_id: 'CAP-991029481',
    payment_method: 'PayPal Balance',
    created_at: '2026-11-03T06:30:19Z',
    updated_at: '2026-11-03T06:30:21Z',
    customer: {
      name: 'FinVault Systems',
      email: 'sec-ops@finvault.io',
      country: 'US',
    },
  },
  {
    id: 'ord_33910-2281-47dd-8833-77a615b22918',
    paypal_order_id: '7XX66281YY229183C',
    status: 'COMPLETED',
    currency: 'INR',
    amount_cents: 850000, // ₹8,500.00
    description: 'Regional Webhook Ingestion Pipe',
    custom_id: 'CUST-ORG-4421',
    payer_email: 'accounts@zenithfin.in',
    capture_id: 'CAP-882910482',
    payment_method: 'NetBanking / UPI (PayPal)',
    created_at: '2026-11-02T19:22:45Z',
    updated_at: '2026-11-02T19:22:49Z',
    customer: {
      name: 'Zenith FinTech India',
      email: 'accounts@zenithfin.in',
      country: 'IN',
    },
  },
  {
    id: 'ord_22801-1170-46ee-7744-66b504a33827',
    paypal_order_id: '5TT55372XX118274M',
    status: 'FAILED',
    currency: 'USD',
    amount_cents: 54000, // $540.00
    description: 'Automated Reconciliation Pro Node',
    custom_id: 'CUST-ORG-3310',
    payer_email: 'ops@vectorlog.com',
    capture_id: null,
    payment_method: 'Credit Card (via PayPal)',
    error_reason: 'PAYER_ACCOUNT_RESTRICTED: PayPal account requires identity verification.',
    created_at: '2026-11-02T17:11:04Z',
    updated_at: '2026-11-02T17:11:06Z',
    customer: {
      name: 'Vector Log Labs',
      email: 'ops@vectorlog.com',
      country: 'US',
    },
  },
];

export const FIXTURE_AI_INSIGHTS = [
  {
    id: 'ins_ai_01',
    title: 'Elevated decline spike on CA/UK Mastercard transactions',
    severity: 'high',
    category: 'Decline Anomaly',
    confidence_pct: 94.2,
    generated_at: '2026-11-03T09:30:00Z',
    affected_records: 18,
    affected_volume_cents: 142000,
    evidence: [
      '18 failed checkout requests between 08:00 and 09:15 UTC.',
      'Card error code INSTRUMENT_DECLINED with 3DS timeout flag.',
      'Issuing bank gateway response: 3D Secure 2.2 challenge handshake expired.',
    ],
    summary: 'Mastercard issuers in CA/UK experienced latency spikes during 3DS challenge authentication, leading to customer drop-offs and transient declines.',
    recommendation: 'Enable automatic routing fallback for 3DS v2.2 to secondary challenge endpoints or request frictionless exemption for sub-$100 orders.',
    suggested_action: 'Configure 3DS Fallback Rules',
    status: 'ACTIVE',
  },
  {
    id: 'ins_ai_02',
    title: 'Dispute risk detected on multi-order velocity from single IP',
    severity: 'medium',
    category: 'Fraud Velocity',
    confidence_pct: 88.5,
    generated_at: '2026-11-03T08:15:00Z',
    affected_records: 4,
    affected_volume_cents: 498000,
    evidence: [
      '4 distinct PayPal accounts checked out from IP 194.26.29.11 within 12 minutes.',
      'Disproportionate ticket size compared to historical cohort average ($1,245 vs $104).',
      'Address verification match failed on postal code for 2 attempts.',
    ],
    summary: 'Unusual rapid-fire purchases with high basket values originating from an anonymized VPN node. High probability of friendly fraud or stolen account takeovers.',
    recommendation: 'Temporarily hold settlement captures for orders matching IP range and prompt dual confirmation from admin before fulfillment.',
    suggested_action: 'Review Flagged Orders',
    status: 'ACTIVE',
  },
  {
    id: 'ins_ai_03',
    title: 'Payout reconciliation opportunity: Inactive reserve release',
    severity: 'low',
    category: 'Treasury Optimization',
    confidence_pct: 97.0,
    generated_at: '2026-11-02T22:00:00Z',
    affected_records: 1,
    affected_volume_cents: 3500000,
    evidence: [
      'PayPal 90-day rolling risk reserve threshold elapsed on Oct 31, 2026.',
      'Chargeback ratio remained under 0.12% across rolling 180-day window.',
    ],
    summary: 'The 90-day rolling buffer is eligible for release back to the primary operating settlement balance, freeing $35,000.00 for operational liquidity.',
    recommendation: 'Submit automated release request via PayPal partner API or schedule auto-sweep to main clearing account.',
    suggested_action: 'Claim Reserve Sweep',
    status: 'RESOLVED',
  },
];

export const FIXTURE_RISK_ALERTS = [
  {
    id: 'alt_001',
    alert_code: 'FRAUD_SUSPECT_01',
    title: 'High Velocity Card Testing Attempt Blocked',
    severity: 'critical',
    status: 'NEW',
    created_at: '2026-11-03T09:50:12Z',
    entity_type: 'Order',
    entity_id: 'ord_66192-8921-41bb-a202-33c948d88219',
    description: '3 failed attempts within 45 seconds using sequential card numbers from same fingerprint.',
    action_required: 'Block fingerprint hash & review associated custom ID.',
  },
  {
    id: 'alt_002',
    alert_code: 'DISPUTE_OPENED',
    title: 'PayPal Dispute Case #PP-D-991204 Created',
    severity: 'high',
    status: 'INVESTIGATING',
    created_at: '2026-11-03T08:14:00Z',
    entity_type: 'Dispute',
    entity_id: 'disp_991823-3810-4491-aa10',
    description: 'Buyer reported unrecognized transaction for $345.00. Response deadline in 7 days.',
    action_required: 'Upload digital delivery proof and IP audit logs.',
  },
  {
    id: 'alt_003',
    alert_code: 'LARGE_REFUND_THRESHOLD',
    title: 'High-Value Refund Requires Dual Confirmation',
    severity: 'medium',
    status: 'NEW',
    created_at: '2026-11-03T07:22:45Z',
    entity_type: 'PendingAction',
    entity_id: 'pact_77182-3819-44cb-a912',
    description: 'Operator proposed refund of $1,250.00 exceeding default threshold ($100.00).',
    action_required: 'Admin approval required before execution.',
  },
  {
    id: 'alt_004',
    alert_code: 'WEBHOOK_FAILURE',
    title: 'Webhook Endpoint Handshake Retry Exhausted',
    severity: 'low',
    status: 'RESOLVED',
    created_at: '2026-11-02T16:04:18Z',
    entity_type: 'Event',
    entity_id: 'evt_449102-1829-4411',
    description: 'Payment capture notification retried 5 times due to ERP maintenance. Succeeded on attempt 6.',
    action_required: 'No further action needed.',
  },
];

export const FIXTURE_PENDING_ACTIONS = [
  {
    id: 'pact_77182-3819-44cb-a912',
    action_type: 'HIGH_VALUE_REFUND',
    entity_type: 'Refund',
    entity_id: 'ref_99182',
    status: 'PENDING',
    amount_cents: 125000,
    currency: 'USD',
    reason: 'Customer cancelled enterprise annual plan within 7-day trial.',
    proposed_by: 'Sarah Jenkins (Operator)',
    created_at: '2026-11-03T07:22:45Z',
  },
  {
    id: 'pact_88291-1029-41aa-8812',
    action_type: 'DISPUTE_AUTO_ACCEPT',
    entity_type: 'Dispute',
    entity_id: 'disp_10291',
    status: 'PENDING',
    amount_cents: 4500,
    currency: 'USD',
    reason: 'Defective digital SKU asset download failure verified by telemetry.',
    proposed_by: 'PayOps AI Auto-Triage',
    created_at: '2026-11-03T06:10:12Z',
  },
];

export const FIXTURE_AUDIT_LOGS = [
  {
    id: 'aud_001',
    user: 'Alex Vance (Admin)',
    action: 'CONFIRM_PENDING_ACTION',
    category: 'MUTATION',
    entity_type: 'PendingAction',
    entity_id: 'pact_33190',
    details: 'Approved high-value refund $540.00 for order ord_22801',
    ip_address: '192.168.1.104',
    created_at: '2026-11-03T10:05:12Z',
    hash: 'sha256:7f01a88b90123c8e44...8912',
    state_diff: {
      old_values: {
        status: 'PENDING',
        approved_by: null,
        settlement_deducted: false,
      },
      new_values: {
        status: 'EXECUTED',
        approved_by: 'Alex Vance (Admin)',
        settlement_deducted: true,
        refund_capture_ref: 're_paypal_881902',
      },
    },
  },
  {
    id: 'aud_002',
    user: 'System (AI Engine)',
    action: 'FLAG_ANOMALY',
    category: 'AI_FLAG',
    entity_type: 'AnomalyInsight',
    entity_id: 'ins_ai_01',
    details: 'Generated high-severity insight for 3DS decline wave in CA/UK',
    ip_address: '127.0.0.1',
    created_at: '2026-11-03T09:30:00Z',
    hash: 'sha256:e3b0c44298fc1c149a...001a',
    state_diff: {
      old_values: null,
      new_values: {
        insight_id: 'ins_ai_01',
        severity: 'high',
        affected_records: 18,
        affected_volume_cents: 142000,
        suggested_action: 'Configure 3DS Fallback Rules',
      },
    },
  },
  {
    id: 'aud_003',
    user: 'Sarah Jenkins (Operator)',
    action: 'CREATE_REFUND_REQUEST',
    category: 'MUTATION',
    entity_type: 'Refund',
    entity_id: 'ref_99182',
    details: 'Initiated refund request for $1,250.00 (sent to pending queue)',
    ip_address: '192.168.1.118',
    created_at: '2026-11-03T07:22:45Z',
    hash: 'sha256:9a8b7c6d5e4f3a2b1c...1102',
    state_diff: {
      old_values: {
        order_status: 'COMPLETED',
        refunded_amount_cents: 0,
      },
      new_values: {
        order_status: 'REFUND_PENDING_APPROVAL',
        refund_requested_cents: 125000,
        queue_id: 'pact_77182-3819-44cb-a912',
      },
    },
  },
  {
    id: 'aud_004',
    user: 'PayPal Webhook Engine',
    action: 'PAYMENT_CAPTURE_COMPLETED',
    category: 'WEBHOOK',
    entity_type: 'Order',
    entity_id: 'ord_91823-3891-44af-811c-99a012e84120',
    details: 'Captured $345.00 via PayPal webhook event WH-8910284',
    ip_address: '173.0.82.126',
    created_at: '2026-11-03T10:14:25Z',
    hash: 'sha256:1a2b3c4d5e6f7a8b9c...8821',
    state_diff: {
      old_values: {
        status: 'CREATED',
        capture_id: null,
        fee_cents: 0,
      },
      new_values: {
        status: 'COMPLETED',
        capture_id: 'CAP-9912048-PP',
        amount_cents: 34500,
        fee_cents: 1031,
      },
    },
  },
  {
    id: 'aud_005',
    user: 'Alex Vance (Admin)',
    action: 'UPDATE_SECURITY_SETTINGS',
    category: 'SECURITY',
    entity_type: 'Settings',
    entity_id: 'sec_cfg_01',
    details: 'Updated dual confirmation refund threshold to $100.00',
    ip_address: '192.168.1.104',
    created_at: '2026-11-02T14:15:00Z',
    hash: 'sha256:3d4e5f6a7b8c9d0e1f...4490',
    state_diff: {
      old_values: {
        dual_approval_threshold_cents: 50000,
        enforce_fips: true,
      },
      new_values: {
        dual_approval_threshold_cents: 10000,
        enforce_fips: true,
      },
    },
  },
];

export const FIXTURE_REPORTS_CATEGORIES = [
  {
    id: 'settlement-reconciliation',
    title: 'Settlement & Double-Entry Ledger Summary',
    description: 'Reconcile gross incoming PayPal captures against fee deductions and merchant reserve holds.',
    frequency: 'Daily / On-demand',
    supported_formats: ['CSV', 'JSON'],
    last_generated: '2026-11-03T04:00:00Z',
  },
  {
    id: 'decline-dispute-analytics',
    title: 'Decline Reason Code & Dispute Ratio Analysis',
    description: 'Breakdown of card network refusal codes, PayPal dispute reason groupings, and win rates.',
    frequency: 'Weekly',
    supported_formats: ['CSV'],
    last_generated: '2026-11-01T00:00:00Z',
  },
  {
    id: 'tax-invoicing-audit',
    title: 'Tax, SKU & Invoicing Audit Trail',
    description: 'Comprehensive itemized invoice ledger with customer tax jurisdictions and SKU codes.',
    frequency: 'Monthly',
    supported_formats: ['CSV', 'JSON'],
    last_generated: '2026-10-31T23:59:59Z',
  },
];

