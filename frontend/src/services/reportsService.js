import { apiClient } from './apiClient';
import { FIXTURE_REPORTS_CATEGORIES } from '../data/fixtures';

export const reportsService = {
  async getCategories() {
    return { data: FIXTURE_REPORTS_CATEGORIES, isFixture: true };
  },

  async getLedgerSummary() {
    try {
      const res = await apiClient.get('/ledger/summary');
      return { data: res.data?.data || res.data, isLive: true };
    } catch (e) {
      return {
        data: {
          total_sales_cents: 12458000,
          total_refunds_cents: 361282,
          net_cents: 12096718,
          order_count: 142,
          refund_count: 3,
        },
        isLive: false,
      };
    }
  },

  async getLedgerTransactions(params = {}) {
    try {
      const res = await apiClient.get('/ledger/transactions', { params });
      return { data: res.data?.items || [], total: res.data?.total || 0, isLive: true };
    } catch (e) {
      return { data: [], total: 0, isLive: false };
    }
  },
};
