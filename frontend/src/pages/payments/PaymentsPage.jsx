import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Download, Filter, RefreshCw, Search, ExternalLink, Receipt, CheckCircle2, DollarSign, Euro, IndianRupee, ShieldCheck, ArrowRight, FileScan } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { DocumentScannerModal } from '../../components/ai/DocumentScannerModal';
import { ordersService } from '../../services/ordersService';
import { FIXTURE_ORDERS, FIXTURE_KPI_METRICS } from '../../data/fixtures';
import { formatCurrency, formatDate, truncateId } from '../../utils/formatters';
import { exportPaymentsToCSV } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

export function PaymentsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [orders, setOrders] = useState(FIXTURE_ORDERS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const pageSize = 5;

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await ordersService.getOrders();
        if (isMounted && res?.data) {
          setOrders(res.data);
        }
      } catch (e) {
        console.warn('Failed to load orders for payments view', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  let filtered = orders.filter((o) => {
    if (currencyFilter !== 'ALL' && o.currency !== currencyFilter) return false;
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        o.id?.toLowerCase().includes(q) ||
        o.paypal_order_id?.toLowerCase().includes(q) ||
        (o.capture_id && o.capture_id.toLowerCase().includes(q)) ||
        o.payer_email?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      header: 'Capture Identifier',
      key: 'capture_id',
      render: (val, row) => (
        <div>
          <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            {val || 'PENDING_CAPTURE'}
          </span>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Order: {row.paypal_order_id}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer',
      key: 'customer',
      render: (cust, row) => (
        <div>
          <div style={{ fontWeight: 550, color: 'var(--color-text-primary)' }}>
            {cust?.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {row.payer_email}
          </div>
        </div>
      ),
    },
    {
      header: 'Gross Amount',
      key: 'amount_cents',
      align: 'right',
      render: (cents, row) => (
        <span className="tabular-nums" style={{ fontWeight: 650, color: 'var(--color-text-primary)' }}>
          {formatCurrency(cents, row.currency)}
        </span>
      ),
    },
    {
      header: 'Settlement Currency',
      key: 'currency',
      render: (c) => (
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 650,
            padding: '2px 7px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
          }}
        >
          {c}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      header: 'Captured At',
      key: 'created_at',
      render: (val) => (
        <span className="tabular-nums" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
          {formatDate(val)}
        </span>
      ),
    },
    {
      header: 'Action',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/transactions/${row.id}`)}
        >
          Audit Details →
        </Button>
      ),
    },
  ];

  const handleExport = () => {
    if (!orders || orders.length === 0) {
      toast.warning('No Records', 'There are no payment capture records to export.');
      return;
    }
    const formattedPayments = orders.map(o => ({
      id: o.capture_id || o.id,
      order_reference: o.paypal_order_id || o.id,
      paypal_capture_id: o.capture_id || 'PENDING_CAPTURE',
      customer_name: o.customer?.name || o.customer_name || 'Customer',
      customer_email: o.payer_email || o.customer_email || '—',
      amount_cents: o.amount_cents || 0,
      fee_cents: o.fee_cents || Math.round((o.amount_cents || 0) * 0.029 + 30),
      currency: o.currency || 'USD',
      payment_method: o.payment_method || 'PayPal Wallet',
      status: o.status || 'COMPLETED',
      captured_at: o.captured_at || o.created_at || new Date().toISOString(),
    }));
    exportPaymentsToCSV(formattedPayments);
    toast.success('Export Successful', `Exported ${formattedPayments.length} payment capture records to CSV.`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Payments"
        description="Monitor multi-currency capture streams, gateway settlements, and reserve provisions."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="secondary"
              icon={FileScan}
              onClick={() => setIsScannerOpen(true)}
            >
              Scan Bill / Receipt
            </Button>
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExport}
            >
              Export Ledger
            </Button>
          </div>
        }
      />

      {/* Payment-Specific Currency Breakdown Cards (Strictly isolated by currency without false blended averages) */}
      <section className="kpi-grid">
        {/* USD Settled Volume */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">USD Settled Volume</span>
            <div className="kpi-icon-wrapper">
              <DollarSign size={17} />
            </div>
          </div>
          <div className="kpi-value">$1,485,902.00</div>
          <div className="kpi-footer">
            <span className="kpi-trend kpi-trend-positive">
              USD Primary
            </span>
            <span>98.6% of capture volume</span>
          </div>
        </div>

        {/* EUR Settled Volume */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">EUR Settled Volume</span>
            <div className="kpi-icon-wrapper">
              <Euro size={17} />
            </div>
          </div>
          <div className="kpi-value">480,00 €</div>
          <div className="kpi-footer">
            <span className="kpi-trend kpi-trend-neutral">
              EUR SEPA
            </span>
            <span>EMEA Cloud Sync captures</span>
          </div>
        </div>

        {/* INR Settled Volume */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">INR Settled Volume</span>
            <div className="kpi-icon-wrapper">
              <IndianRupee size={17} />
            </div>
          </div>
          <div className="kpi-value">₹8,500.00</div>
          <div className="kpi-footer">
            <span className="kpi-trend kpi-trend-neutral">
              INR Local
            </span>
            <span>Regional webhook gateways</span>
          </div>
        </div>

        {/* Dispute Reserve Buffer (USD) */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Dispute Reserve Buffer (USD)</span>
            <div className="kpi-icon-wrapper">
              <ShieldCheck size={17} />
            </div>
          </div>
          <div className="kpi-value">{formatCurrency(FIXTURE_KPI_METRICS.dispute_volume_cents, 'USD')}</div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--color-text-muted)' }}>0.6% rolling 90-day escrow</span>
          </div>
        </div>
      </section>

      {/* Filter and Search Workspace */}
      <Card padding={false} style={{ padding: '14px 18px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Ample search box */}
          <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              placeholder="Search by capture ID, customer name..."
              style={{ width: '100%', maxWidth: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Currency selector with proper width so "All Currencies" is never truncated */}
            <div style={{ width: '150px' }}>
              <Select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Currencies' },
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'INR', label: 'INR (₹)' },
                ]}
              />
            </div>

            {/* Status selector */}
            <div style={{ width: '150px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'FAILED', label: 'Failed' },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Payments Capture Table */}
      <Card padding={false}>
        <Table
          columns={columns}
          data={paginated}
          emptyTitle="No payments matched"
          emptyDescription="Try selecting another currency or status filter."
          onRowClick={(row) => navigate(`/transactions/${row.id}`)}
        />
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </Card>

      <DocumentScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </PageContainer>
  );
}
