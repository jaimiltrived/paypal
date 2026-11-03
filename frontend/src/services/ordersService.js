import { FIXTURE_ORDERS, FIXTURE_KPI_METRICS } from '../data/fixtures';

/**
 * Service for orders & transactions.
 * For this milestone, data is provided via development fixtures.
 */
export const ordersService = {
  async getMetrics() {
    // Simulating light async network latency
    await new Promise((resolve) => setTimeout(resolve, 120));
    return { data: FIXTURE_KPI_METRICS, isFixture: true };
  },

  async getOrders(filters = {}) {
    await new Promise((resolve) => setTimeout(resolve, 150));
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
      isFixture: true,
    };
  },

  async getOrderById(orderId) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const order = FIXTURE_ORDERS.find((o) => o.id === orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    return { data: order, isFixture: true };
  },
};

