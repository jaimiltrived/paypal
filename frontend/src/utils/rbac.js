/**
 * PayOps AI - Role-Based Access Control (RBAC) System
 * Provides permissions, navigation filtering, and visual role configurations.
 */

export const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  AUDITOR: 'auditor',
  USER: 'user',
};

export const ROLE_CONFIGS = {
  admin: {
    name: 'Administrator',
    slug: 'admin',
    icon: '👑',
    color: '#6366F1', // Indigo
    badgeVariant: 'primary',
    description: 'Full administrative access: governance, dual-confirmation, sensitive thresholds & configurations.',
    allowedRoutes: ['/dashboard', '/transactions', '/payments', '/payouts', '/ai-insights', '/risk', '/reports', '/activity', '/settings'],
    permissions: {
      canCreatePayment: true,
      canIssueRefund: true,
      canDisbursePayout: true,
      canApproveDualConfirmation: true,
      canManageSettings: true,
      canViewRiskAlerts: true,
      canViewAuditLog: true,
      canScanReceipts: true,
      isReadOnly: false,
    },
  },

  operator: {
    name: 'Payment Operator',
    slug: 'operator',
    icon: '⚡',
    color: '#059669', // Emerald
    badgeVariant: 'success',
    description: 'Operational privileges: payment generation, capture, receipt scanning, payouts, and standard refunds.',
    allowedRoutes: ['/dashboard', '/transactions', '/payments', '/payouts', '/ai-insights', '/reports'],
    permissions: {
      canCreatePayment: true,
      canIssueRefund: true,
      canDisbursePayout: true,
      canApproveDualConfirmation: false,
      canManageSettings: false,
      canViewRiskAlerts: true,
      canViewAuditLog: false,
      canScanReceipts: true,
      isReadOnly: false,
    },
  },

  auditor: {
    name: 'Read-Only Auditor',
    slug: 'auditor',
    icon: '🔍',
    color: '#D97706', // Amber
    badgeVariant: 'warning',
    description: 'Immutable ledger inspection: transaction verification, batch slip audits, and compliance CSV exports.',
    allowedRoutes: ['/dashboard', '/transactions', '/reports', '/activity'],
    permissions: {
      canCreatePayment: false,
      canIssueRefund: false,
      canDisbursePayout: false,
      canApproveDualConfirmation: false,
      canManageSettings: false,
      canViewRiskAlerts: false,
      canViewAuditLog: true,
      canScanReceipts: true,
      isReadOnly: true,
    },
  },

  user: {
    name: 'Customer Portal',
    slug: 'user',
    icon: '👤',
    color: '#64748B', // Slate
    badgeVariant: 'neutral',
    description: 'Standard customer privileges: view personal orders, make online checkouts, and scan digital receipts.',
    allowedRoutes: ['/dashboard', '/payments', '/transactions'],
    permissions: {
      canCreatePayment: true,
      canIssueRefund: false,
      canDisbursePayout: false,
      canApproveDualConfirmation: false,
      canManageSettings: false,
      canViewRiskAlerts: false,
      canViewAuditLog: false,
      canScanReceipts: true,
      isReadOnly: false,
    },
  },
};

export const QUICK_SWITCH_ACCOUNTS = [
  {
    role: 'admin',
    name: 'Alex Vance',
    email: 'admin@payops.ai',
    password: 'AdminPassword123!',
    tag: 'Full Access Administrator',
    icon: '👑',
  },
  {
    role: 'operator',
    name: 'Sarah Jenkins',
    email: 'operator@payops.ai',
    password: 'OperatorPassword123!',
    tag: 'Payment & Payout Operations',
    icon: '⚡',
  },
  {
    role: 'auditor',
    name: 'Marcus Brody',
    email: 'auditor@payops.ai',
    password: 'AuditorPassword123!',
    tag: 'Immutable Read-Only Auditor',
    icon: '🔍',
  },
  {
    role: 'user',
    name: 'Elena Rostova',
    email: 'customer@example.com',
    password: 'CustomerPassword123!',
    tag: 'Customer Checkout Portal',
    icon: '👤',
  },
];

export function getRoleConfig(roleName) {
  const normalized = (roleName || 'admin').toLowerCase();
  return ROLE_CONFIGS[normalized] || ROLE_CONFIGS.admin;
}

export function hasPermission(roleName, permissionKey) {
  const config = getRoleConfig(roleName);
  return Boolean(config.permissions?.[permissionKey]);
}

export function isRouteAllowed(roleName, path) {
  const config = getRoleConfig(roleName);
  const basePath = '/' + path.split('/').filter(Boolean)[0];
  return config.allowedRoutes.includes(basePath) || basePath === '/';
}
