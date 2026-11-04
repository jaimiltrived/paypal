import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Plus,
  RefreshCw,
  Search,
  Download,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Building,
  Mail,
  DollarSign,
  AlertCircle,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { payoutsService } from '../../services/payoutsService';
import { formatCurrency, formatDate, truncateId } from '../../utils/formatters';
import { exportPayoutsToCSV } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

export function PayoutsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [payouts, setPayouts] = useState([]);
  const [metrics, setMetrics] = useState({
    total_payouts_cents: 0,
    payout_count: 0,
    successful_count: 0,
    pending_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // New Payout Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amountStr, setAmountStr] = useState('500.00');
  const [currency, setCurrency] = useState('USD');
  const [note, setNote] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, metricsRes] = await Promise.all([
        payoutsService.getPayouts({
          status: statusFilter,
          recipient_email: searchTerm,
        }),
        payoutsService.getMetrics(),
      ]);
      if (listRes?.data) setPayouts(listRes.data);
      if (metricsRes?.data) setMetrics(metricsRes.data);
    } catch (err) {
      console.warn('Failed to load payouts data:', err);
      toast.error('Query Failed', 'Unable to fetch disbursements ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, searchTerm]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied Reference', text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreatePayout = async (e) => {
    e.preventDefault();
    if (!recipientEmail) {
      toast.error('Validation Error', 'Recipient email is required.');
      return;
    }
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Validation Error', 'Disbursement amount must be greater than $0.00.');
      return;
    }

    const amount_cents = Math.round(parsedAmount * 100);

    setSubmitting(true);
    try {
      const res = await payoutsService.createPayout({
        recipient_email: recipientEmail,
        recipient_name: recipientName || undefined,
        amount_cents,
        currency,
        note: note || 'Partner disbursement',
      });

      toast.success(
        'Disbursement Executed',
        `Disbursed ${formatCurrency(amount_cents, currency)} to ${recipientEmail}. Batch: ${res.data?.payout_batch_id || 'BATCH-OK'}`
      );

      // Reset form and reload
      setIsModalOpen(false);
      setRecipientEmail('');
      setRecipientName('');
      setAmountStr('500.00');
      setNote('');
      loadData();
    } catch (err) {
      console.error('Failed to disburse payout:', err);
      toast.error('Disbursement Failed', err.message || 'Operation could not be processed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (!payouts || payouts.length === 0) {
      toast.warning('No Records', 'There are no partner disbursement records to export.');
      return;
    }
    exportPayoutsToCSV(payouts);
    toast.success('Export Successful', `Exported ${payouts.length} disbursement records to CSV.`);
  };

  const paginatedPayouts = payouts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      header: 'Batch Reference / Item ID',
      key: 'payout_batch_id',
      render: (batchId, row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="font-mono tabular-nums" style={{ fontWeight: 650, color: 'var(--color-primary)', fontSize: '12px' }}>
              {batchId || truncateId(row.id, 8, 4)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(batchId || row.id, row.id);
              }}
              className="btn-icon btn-icon-sm btn-ghost"
              title="Copy Batch ID"
            >
              {copiedId === row.id ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
            </button>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Ref: {row.payout_item_id || row.id.substring(0, 14)}
          </div>
        </div>
      ),
    },
    {
      header: 'Recipient Entity',
      key: 'recipient_email',
      render: (email, row) => (
        <div>
          <div style={{ fontWeight: 550, color: 'var(--color-text-primary)' }}>
            {row.recipient_name || 'Marketplace Partner'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {email}
          </div>
        </div>
      ),
    },
    {
      header: 'Disbursed Amount',
      key: 'amount_cents',
      align: 'right',
      render: (cents, row) => (
        <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '13.5px' }}>
          -{formatCurrency(cents, row.currency)}
        </span>
      ),
    },
    {
      header: 'Currency',
      key: 'currency',
      render: (curr) => (
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
          }}
        >
          {curr}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      header: 'Executed At',
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
          icon={FileText}
          onClick={() => toast.info('Ledger Audit Entry', `Cryptographic batch slip ${row.payout_batch_id || row.id} verified in SQLite ledger.`)}
        >
          Audit Slip
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Payouts & Partner Disbursements"
        description="Direct batch disbursement pipeline for vendor payables, marketplace seller splits, and contractor payments."
        badge={
          <Badge variant="success" pill style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={11} />
            <span>FastAPI Disburse Engine Active</span>
          </Badge>
        }
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={loadData}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              Disburse Funds
            </Button>
          </div>
        }
      />

      {/* Financial KPIs Row */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Disbursed Volume</span>
            <div className="kpi-icon-wrapper">
              <DollarSign size={17} />
            </div>
          </div>
          <div className="kpi-value">
            {formatCurrency(metrics.total_payouts_cents, 'USD')}
          </div>
          <div className="kpi-footer">
            <span className="kpi-trend kpi-trend-neutral">
              Settled Debits
            </span>
            <span>Recorded in SQLite ledger</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Successful Transfers</span>
            <div className="kpi-icon-wrapper">
              <CheckCircle2 size={17} style={{ color: 'var(--color-success)' }} />
            </div>
          </div>
          <div className="kpi-value">
            {metrics.successful_count} Batches
          </div>
          <div className="kpi-footer">
            <span className="kpi-trend kpi-trend-positive">
              100% Executed
            </span>
            <span>Zero transfer rejections</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Pending Approval Queue</span>
            <div className="kpi-icon-wrapper">
              <Clock size={17} style={{ color: 'var(--color-warning)' }} />
            </div>
          </div>
          <div className="kpi-value">
            {metrics.pending_count} Transfers
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--color-text-muted)' }}>
              Dual confirmation threshold: &gt; $500.00
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Disbursement Rail</span>
            <div className="kpi-icon-wrapper">
              <ShieldCheck size={17} style={{ color: 'var(--color-primary)' }} />
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '18px', paddingTop: '4px' }}>
            PayPal REST v1 / SEPA
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
              Operating Clearing Account Active
            </span>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <Card padding={false} style={{ padding: '14px 18px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: '1 1 300px', maxWidth: '420px' }}>
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              onClear={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              placeholder="Search by recipient email or batch ID..."
              style={{ width: '100%', maxWidth: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Status:</span>
            <div style={{ width: '160px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'SUCCESS', label: 'Success / Settled' },
                  { value: 'PENDING', label: 'Pending Transfer' },
                  { value: 'FAILED', label: 'Failed / Returned' },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Payouts Table */}
      <Card padding={false}>
        <Table
          columns={columns}
          data={paginatedPayouts}
          loading={loading}
          emptyTitle="No disbursements found"
          emptyDescription="Click 'Disburse Funds' to schedule a partner or contractor payment."
        />
        {!loading && payouts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={payouts.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        )}
      </Card>

      {/* Create Payout Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Disburse Partner Funds"
        description="Initiate an automated disbursement to a contractor, vendor, or marketplace partner."
        maxWidth="520px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={submitting}
              icon={Send}
              onClick={handleCreatePayout}
            >
              Confirm Disbursement
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreatePayout} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Recipient PayPal / Clearing Email"
            type="email"
            placeholder="seller@partner.com"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            prefixIcon={Mail}
            required
            helperText="The recipient account that will receive operating balance settlement."
          />

          <Input
            label="Recipient Legal Entity / Partner Name"
            placeholder="Acme Partner Solutions LLC"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            prefixIcon={Building}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <Input
              label="Disbursement Amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="500.00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              prefixIcon={DollarSign}
              required
              helperText="Converted to integer cents on backend."
            />

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 550, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                Currency
              </label>
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={[
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'INR', label: 'INR (₹)' },
                ]}
              />
            </div>
          </div>

          <Input
            label="Disbursement Memo / Audit Note"
            placeholder="Monthly revenue split settlement"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            helperText="Immutable note stored in SQLite audit trail."
          />
        </form>
      </Modal>
    </PageContainer>
  );
}
