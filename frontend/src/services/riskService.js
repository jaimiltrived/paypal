import { FIXTURE_RISK_ALERTS, FIXTURE_PENDING_ACTIONS } from '../data/fixtures';

/**
 * Service for Risk, Fraud Alerts, and Pending Dual-Confirmation Actions.
 */
export const riskService = {
  async getAlerts(filters = {}) {
    await new Promise((resolve) => setTimeout(resolve, 130));
    let alerts = [...FIXTURE_RISK_ALERTS];

    if (filters.severity && filters.severity !== 'ALL') {
      alerts = alerts.filter((a) => a.severity === filters.severity);
    }
    if (filters.status && filters.status !== 'ALL') {
      alerts = alerts.filter((a) => a.status === filters.status);
    }

    return {
      data: alerts,
      total: alerts.length,
      isFixture: true,
    };
  },

  async getPendingActions() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      data: FIXTURE_PENDING_ACTIONS,
      total: FIXTURE_PENDING_ACTIONS.length,
      isFixture: true,
    };
  },
};

