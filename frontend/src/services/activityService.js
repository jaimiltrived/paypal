import { FIXTURE_AUDIT_LOGS } from '../data/fixtures';

export const activityService = {
  async getAuditLogs(filters = {}) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    let logs = [...FIXTURE_AUDIT_LOGS];

    if (filters.action && filters.action !== 'ALL') {
      logs = logs.filter((l) => l.action === filters.action);
    }

    return {
      data: logs,
      total: logs.length,
      isFixture: true,
    };
  },
};

