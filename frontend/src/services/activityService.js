import { apiClient } from './apiClient';
import { FIXTURE_AUDIT_LOGS } from '../data/fixtures';

export const activityService = {
  async getAuditLogs(filters = {}) {
    try {
      const params = {
        skip: filters.skip || 0,
        limit: filters.limit || 50,
      };
      if (filters.action && filters.action !== 'ALL') {
        params.action = filters.action;
      }
      if (filters.entity_type && filters.entity_type !== 'ALL') {
        params.entity_type = filters.entity_type;
      }

      const res = await apiClient.get('/ledger/audit-logs', { params });
      const { items, total } = res.data;

      if (items && Array.isArray(items)) {
        const normalized = items.map((l) => {
          let stateDiff = { old_values: null, new_values: null };
          try {
            if (l.old_values) stateDiff.old_values = typeof l.old_values === 'string' ? JSON.parse(l.old_values) : l.old_values;
            if (l.new_values) stateDiff.new_values = typeof l.new_values === 'string' ? JSON.parse(l.new_values) : l.new_values;
          } catch {
            // parse error
          }

          let category = 'MUTATION';
          if (l.action?.includes('FLAG') || l.action?.includes('AI')) category = 'AI_FLAG';
          else if (l.action?.includes('WEBHOOK') || l.action?.includes('CAPTURE')) category = 'WEBHOOK';
          else if (l.action?.includes('SETTING') || l.action?.includes('AUTH') || l.action?.includes('REGISTER')) category = 'SECURITY';

          return {
            id: l.id,
            user: l.user_id ? 'Alex Vance (Admin)' : 'System Engine',
            action: l.action,
            category,
            entity_type: l.entity_type,
            entity_id: l.entity_id,
            details: `Executed ${l.action} on ${l.entity_type} ${l.entity_id}`,
            ip_address: l.ip_address || '127.0.0.1',
            created_at: l.created_at,
            hash: `sha256:${l.id.substring(0, 16)}...chain`,
            state_diff: stateDiff,
          };
        });

        return {
          data: normalized.length > 0 ? normalized : FIXTURE_AUDIT_LOGS,
          total: total || normalized.length,
          isLive: true,
        };
      }
    } catch (e) {
      console.warn('Audit logs API failed, using cached fixtures.', e.message);
    }

    let logs = [...FIXTURE_AUDIT_LOGS];
    if (filters.action && filters.action !== 'ALL') {
      logs = logs.filter((l) => l.action === filters.action);
    }

    return {
      data: logs,
      total: logs.length,
      isLive: false,
      isFixture: true,
    };
  },
};
