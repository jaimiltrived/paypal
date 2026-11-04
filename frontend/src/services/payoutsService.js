import { apiClient } from './apiClient';

export const FIXTURE_PAYOUTS = [
  {
    id: 'pay_91820-4412-88aa-b120',
    payout_batch_id: 'BATCH-2026-ALPHA01',
    payout_item_id: 'ITEM-ALPHA-9102',
    recipient_email: 'seller.alpha@partner.net',
    recipient_name: 'Alpha Marketplace Seller LLC',
    amount_cents: 45000,
    currency: 'USD',
    status: 'SUCCESS',
    note: 'Monthly net seller commission settlement',
    created_at: '2026-11-04T10:15:00Z',
  },
  {
    id: 'pay_88192-3310-99bb-c340',
    payout_batch_id: 'BATCH-2026-CLOUDOPS02',
    payout_item_id: 'ITEM-CLOUDOPS-8812',
    recipient_email: 'contractor.dev@cloudops.org',
    recipient_name: 'CloudOps Contractor Services',
    amount_cents: 120000,
    currency: 'USD',
    status: 'SUCCESS',
    note: 'Infrastructure engineering milestone invoice',
    created_at: '2026-11-04T09:40:00Z',
  },
  {
    id: 'pay_77102-2201-11cc-d560',
    payout_batch_id: 'BATCH-2026-GROWTH03',
    payout_item_id: 'ITEM-GROWTH-7719',
    recipient_email: 'affiliate.network@growthpay.io',
    recipient_name: 'GrowthPay Affiliate Partner',
    amount_cents: 18500,
    currency: 'USD',
    status: 'SUCCESS',
    note: 'Q4 affiliate referral bonus',
    created_at: '2026-11-03T18:22:00Z',
  },
];

export const payoutsService = {
  /**
   * Fetch paginated payouts from /api/v1/payouts.
   */
  async getPayouts(filters = {}) {
    try {
      const params = {
        skip: filters.skip || 0,
        limit: filters.limit || 50,
      };
      if (filters.status && filters.status !== 'ALL') {
        params.status = filters.status;
      }
      if (filters.recipient_email) {
        params.recipient_email = filters.recipient_email;
      }

      const res = await apiClient.get('/payouts', { params });
      const { items, total } = res.data;

      if (items && Array.isArray(items)) {
        return {
          data: items,
          total: total || items.length,
          isLive: true,
        };
      }
    } catch (e) {
      console.warn('Payouts API failed, serving cached fallback.', e.message);
    }

    let items = [...FIXTURE_PAYOUTS];
    if (filters.status && filters.status !== 'ALL') {
      items = items.filter((p) => p.status === filters.status);
    }
    if (filters.recipient_email) {
      const q = filters.recipient_email.toLowerCase();
      items = items.filter(
        (p) =>
          p.recipient_email.toLowerCase().includes(q) ||
          (p.recipient_name && p.recipient_name.toLowerCase().includes(q))
      );
    }

    return {
      data: items,
      total: items.length,
      isLive: false,
      isFixture: true,
    };
  },

  /**
   * Fetch aggregated payout volume and counts from /api/v1/payouts/metrics.
   */
  async getMetrics() {
    try {
      const res = await apiClient.get('/payouts/metrics');
      if (res.data?.data) {
        return { data: res.data.data, isLive: true };
      }
    } catch (e) {
      console.warn('Payout metrics API failed, serving fallback.');
    }

    const totalCents = FIXTURE_PAYOUTS.reduce((sum, p) => sum + p.amount_cents, 0);
    return {
      data: {
        total_payouts_cents: totalCents,
        payout_count: FIXTURE_PAYOUTS.length,
        successful_count: FIXTURE_PAYOUTS.filter((p) => p.status === 'SUCCESS').length,
        pending_count: FIXTURE_PAYOUTS.filter((p) => p.status === 'PENDING').length,
      },
      isLive: false,
      isFixture: true,
    };
  },

  /**
   * Create and execute a partner disbursement / payout.
   */
  async createPayout(payload) {
    const res = await apiClient.post('/payouts', payload);
    return res.data;
  },

  /**
   * Get single payout details.
   */
  async getPayoutById(payoutId) {
    const res = await apiClient.get(`/payouts/${payoutId}`);
    return res.data;
  },
};

