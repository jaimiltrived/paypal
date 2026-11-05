/**
 * PayOps AI - Sample Receipts & Ground Truth Business Logic
 * Defines structured specifications, arithmetic validation, and metadata for all 3 sample receipts.
 */

export const SAMPLE_RECEIPTS = {
  tech_store: {
    id: 'tech_store',
    label: 'Tech Store ($281.02)',
    icon: '🖥️',
    vendor_name: 'Apex Cloud & Hardware Depot',
    vendor_address: '742 Evergreen Terrace, Suite 400, San Jose, CA 95112',
    invoice_number: 'INV-2026-8841',
    invoice_date: '2026-11-04',
    due_date: '2026-12-04',
    currency: 'USD',
    subtotal_cents: 25900,
    tax_amount_cents: 2202,
    total_amount_cents: 28102,
    is_arithmetic_valid: true,
    confidence_score: 0.98,
    notes: 'Return Policy: 30 days return with original receipt and packaging.',
    image_url: '/sample_receipts/receipt_tech_store.png',
    line_items: [
      {
        name: 'Pro Ergonomic Mechanical Keyboard',
        quantity: 1,
        unit_price_cents: 14900,
        line_total_cents: 14900,
      },
      {
        name: 'Thunderbolt 4 High-Speed USB-C Dock',
        quantity: 1,
        unit_price_cents: 8500,
        line_total_cents: 8500,
      },
      {
        name: 'Braided Ultra-HD DisplayPort Cable',
        quantity: 2,
        unit_price_cents: 1250,
        line_total_cents: 2500,
      },
    ],
  },

  bistro_cafe: {
    id: 'bistro_cafe',
    label: 'Cafe Bistro ($37.43)',
    icon: '☕',
    vendor_name: 'Artisan Roast Bistro & Bakery',
    vendor_address: '108 Market Street, San Francisco, CA 94105',
    invoice_number: 'RCPT-59201',
    invoice_date: '2026-11-05',
    due_date: '2026-11-05',
    currency: 'USD',
    subtotal_cents: 3450,
    tax_amount_cents: 293,
    total_amount_cents: 3743,
    is_arithmetic_valid: true,
    confidence_score: 0.99,
    notes: 'Table 14 - Thank you for dining with Artisan Roast!',
    image_url: '/sample_receipts/receipt_bistro_cafe.png',
    line_items: [
      {
        name: 'Vanilla Oat Latte (Large)',
        quantity: 2,
        unit_price_cents: 650,
        line_total_cents: 1300,
      },
      {
        name: 'Avocado Sourdough Toast w/ Poached Egg',
        quantity: 1,
        unit_price_cents: 1450,
        line_total_cents: 1450,
      },
      {
        name: 'Blueberry Meyer Lemon Tart',
        quantity: 1,
        unit_price_cents: 700,
        line_total_cents: 700,
      },
    ],
  },

  cloud_services: {
    id: 'cloud_services',
    label: 'Cloud SaaS ($227.85)',
    icon: '☁️',
    vendor_name: 'NovaScale Cloud Infrastructure Inc.',
    vendor_address: '100 Enterprise Way, Austin, TX 78701',
    invoice_number: 'NOV-90412',
    invoice_date: '2026-11-01',
    due_date: '2026-12-01',
    currency: 'USD',
    subtotal_cents: 21000,
    tax_amount_cents: 1785,
    total_amount_cents: 22785,
    is_arithmetic_valid: true,
    confidence_score: 0.97,
    notes: 'Net 30. Direct Debit via PayPal Pre-Approved Billing.',
    image_url: '/sample_receipts/receipt_cloud_services.png',
    line_items: [
      {
        name: 'High-Performance GPU Worker Nodes (H100)',
        quantity: 2,
        unit_price_cents: 7500,
        line_total_cents: 15000,
      },
      {
        name: 'Managed Vector Database Cluster (Small)',
        quantity: 1,
        unit_price_cents: 4500,
        line_total_cents: 4500,
      },
      {
        name: 'Bandwidth Egress Allocation (1TB Tier)',
        quantity: 1,
        unit_price_cents: 1500,
        line_total_cents: 1500,
      },
    ],
  },
};

/**
 * Identify if an image base64 or URL corresponds to one of the 3 predefined sample receipts.
 */
export function matchSampleReceipt(keyOrUrl) {
  if (!keyOrUrl) return null;
  for (const [key, sample] of Object.entries(SAMPLE_RECEIPTS)) {
    if (key === keyOrUrl || sample.image_url === keyOrUrl || sample.id === keyOrUrl) {
      return sample;
    }
  }
  return null;
}
