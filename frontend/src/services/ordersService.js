import { apiClient } from './apiClient';
import { FIXTURE_ORDERS, FIXTURE_KPI_METRICS } from '../data/fixtures';

/**
 * Service for orders & transactions.
 * Integrates directly with FastAPI /api/v1/orders and /api/v1/ledger.
 * Falls back to local development fixtures when backend is offline.
 */
export const ordersService = {
  async getMetrics() {
    try {
      const res = await apiClient.get('/ledger/summary');
      const summary = res.data?.data || res.data;
      if (summary) {
        return {
          data: {
            ...FIXTURE_KPI_METRICS,
            total_volume_cents: summary.total_sales_cents ?? FIXTURE_KPI_METRICS.total_volume_cents,
            successful_transactions: summary.order_count ?? FIXTURE_KPI_METRICS.successful_transactions,
            refund_volume_cents: summary.total_refunded_cents ?? 0,
            net_settled_cents: summary.net_revenue_cents ?? 0,
            refund_count: summary.refund_count ?? 0,
          },
          isLive: true,
        };
      }
    } catch (e) {
      // Fallback
    }
    return { data: FIXTURE_KPI_METRICS, isLive: false, isFixture: true };
  },

  async getOrders(filters = {}) {
    try {
      const params = {
        skip: filters.skip || 0,
        limit: filters.limit || 50,
      };
      if (filters.status && filters.status !== 'ALL') {
        params.status = filters.status;
      }

      const res = await apiClient.get('/orders', { params });
      const { items, total } = res.data;

      if (items && Array.isArray(items)) {
        // Normalize customer shape for frontend consumption
        const normalized = items.map((o) => ({
          ...o,
          payment_method: o.payment_method || 'PayPal Balance',
          customer: o.customer || {
            name: o.payer_email ? o.payer_email.split('@')[0] : 'Acme Merchant',
            email: o.payer_email || 'customer@payops.ai',
            country: 'US',
          },
        }));

        let filtered = normalized;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          filtered = filtered.filter(
            (o) =>
              o.id?.toLowerCase().includes(q) ||
              o.paypal_order_id?.toLowerCase().includes(q) ||
              o.payer_email?.toLowerCase().includes(q) ||
              o.description?.toLowerCase().includes(q) ||
              o.custom_id?.toLowerCase().includes(q)
          );
        }

        return {
          data: filtered,
          total: total || filtered.length,
          page: 1,
          page_size: params.limit,
          isLive: true,
        };
      }
    } catch (e) {
      console.warn('Orders API offline, serving cached fixtures.', e.message);
    }

    // Offline / Fixture fallback
    let orders = [...FIXTURE_ORDERS];
    if (filters.status && filters.status !== 'ALL') {
      orders = orders.filter((o) => o.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.paypal_order_id.toLowerCase().includes(q) ||
          o.payer_email.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q)
      );
    }

    return {
      data: orders,
      total: orders.length,
      page: 1,
      page_size: 10,
      isLive: false,
      isFixture: true,
    };
  },

  async getOrderById(orderId) {
    try {
      const res = await apiClient.get(`/orders/${orderId}`);
      const rawOrder = res.data?.data || res.data;
      if (rawOrder && rawOrder.id) {
        return {
          data: {
            ...rawOrder,
            payment_method: rawOrder.payment_method || 'PayPal Balance',
            customer: rawOrder.customer || {
              name: rawOrder.payer_email ? rawOrder.payer_email.split('@')[0] : 'Acme Merchant',
              email: rawOrder.payer_email || 'customer@payops.ai',
              country: 'US',
            },
          },
          isLive: true,
        };
      }
    } catch (e) {
      console.warn(`Order ${orderId} fetch from API failed; checking fixtures.`, e.message);
    }

    const order = FIXTURE_ORDERS.find((o) => o.id === orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    return { data: order, isLive: false, isFixture: true };
  },

  async createOrder(payload) {
    const res = await apiClient.post('/orders', payload);
    return res.data;
  },

  async captureOrder(orderId) {
    const res = await apiClient.post(`/orders/${orderId}/capture`);
    return res.data;
  },

  async createRefund({ order_id, amount_cents, reason }) {
    const payload = { order_id };
    if (amount_cents) payload.amount_cents = amount_cents;
    if (reason) payload.reason = reason;
    const res = await apiClient.post('/refunds', payload);
    return res.data;
  },

  async getRefunds(filters = {}) {
    const params = {
      skip: filters.skip || 0,
      limit: filters.limit || 50,
    };
    if (filters.order_id) params.order_id = filters.order_id;
    if (filters.status) params.status = filters.status;
    const res = await apiClient.get('/refunds', { params });
    return res.data;
  },
};
