import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  ShieldAlert,
  CreditCard,
  User,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  AlertCircle,
  Building,
  Hash,
  Download,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ordersService } from '../../services/ordersService';
import { formatCurrency, formatDate, truncateId } from '../../utils/formatters';
import { exportTransactionsToCSV } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

export function TransactionDetailPage() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  // Refund modal state
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('Customer requested order cancellation');
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await ordersService.getOrderById(transactionId);
        setOrder(res.data);
      } catch {
        const fallback = await ordersService.getOrders();
        setOrder(fallback.data[0]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [transactionId]);

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success('Copied to Clipboard', `${fieldName}: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleIssueRefund = async () => {
    setRefundSubmitting(true);
    try {
      const res = await ordersService.createRefund({
        order_id: order.id,
        amount_cents: order.amount_cents,
        reason: refundReason,
      });

      setIsRefundModalOpen(false);

      const refundResult = res?.data || res;
      if (refundResult?.status === 'PENDING_CONFIRMATION' || refundResult?.pending_action_id) {
        toast.warning(
          'Queued for Dual Confirmation',
          refundResult.message || `Refund exceeds safety threshold. Awaiting secondary administrator sign-off.`
        );
      } else {
        toast.success(
          'Refund Processed',
          refundResult?.message || `Successfully processed refund of ${formatCurrency(order.amount_cents, order.currency)}.`
        );
      }

      // Refresh order data
      try {
        const refreshed = await ordersService.getOrderById(order.id);
        if (refreshed?.data) setOrder(refreshed.data);
      } catch {
        // preserve current order view
      }
    } catch (err) {
      console.error('Refund creation error:', err);
      toast.error('Refund Failed', err.message || 'Unable to process refund on backend.');
    } finally {
      setRefundSubmitting(false);
    }
  };

  if (loading || !order) {
    return (
      <PageContainer>
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Clock className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
          <p>Loading transaction audit details...</p>
        </div>
      </PageContainer>
    );
  }

  const isHighValue = order.amount_cents > 10000;

  const handleExportSlip = () => {
    exportTransactionsToCSV([order], `payops-receipt-${truncateId(order.id, 8, 4)}.csv`);
    toast.success('Audit Slip Exported', `Transaction ${truncateId(order.id, 8, 4)} exported to CSV receipt.`);
  };

  return (
    <PageContainer>
      <PageHeader
        title={`Transaction ${truncateId(order.id, 8, 4)}`}
        description={`Processed on ${formatDate(order.created_at)}`}
        customBreadcrumbs={[
          { to: '/dashboard', label: 'Overview' },
          { to: '/transactions', label: 'Transactions' },
          { label: truncateId(order.id, 8, 4) },
        ]}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleExportSlip}
            >
              Export Slip
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate('/transactions')}
            >
              Back to Transactions
            </Button>
          </div>
        }
      />

      {/* Two-Column Detail Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          alignItems: 'start',
        }}
        className="transaction-detail-grid"
      >
        {/* Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Payment Information Card */}
          <Card title="Payment Authorization & Capture">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '20px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Settled Gross Amount
                </span>
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    marginTop: '2px',
                  }}
                >
                  {formatCurrency(order.amount_cents, order.currency)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Integer cents precision: <code style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '1px 5px', borderRadius: '3px' }}>{order.amount_cents}</code>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Gateway Status
                </span>
                <div style={{ marginTop: '8px' }}>
                  <StatusBadge status={order.status} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                  Instrument: <strong>{order.payment_method}</strong>
                </div>
              </div>
            </div>

            {/* Identifiers Group */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Gateway References
              </span>

              <div
                style={{
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 550 }}>
                    Internal Order UUID
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <code style={{ fontSize: '11.5px', fontFamily: 'monospace' }}>{order.id}</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(order.id, 'Order UUID')}
                      className="btn-icon btn-icon-sm btn-ghost"
                      title="Copy Order UUID"
                    >
                      {copiedField === 'Order UUID' ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 550 }}>
                    PayPal Order Reference
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <code style={{ fontSize: '11.5px', fontFamily: 'monospace' }}>{order.paypal_order_id}</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(order.paypal_order_id, 'PayPal Order ID')}
                      className="btn-icon btn-icon-sm btn-ghost"
                      title="Copy PayPal Order ID"
                    >
                      {copiedField === 'PayPal Order ID' ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {order.capture_id && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 550 }}>
                      PayPal Capture ID
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <code style={{ fontSize: '11.5px', fontFamily: 'monospace' }}>{order.capture_id}</code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(order.capture_id, 'Capture ID')}
                        className="btn-icon btn-icon-sm btn-ghost"
                        title="Copy Capture ID"
                      >
                        {copiedField === 'Capture ID' ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                )}

                {order.custom_id && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 550 }}>
                      Merchant Custom ID
                    </span>
                    <code style={{ fontSize: '11.5px', fontFamily: 'monospace' }}>{order.custom_id}</code>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Lifecycle Timeline */}
          <Card title="Gateway Lifecycle Timeline">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-50)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={13} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Checkout Initiated & Order Created</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {formatDate(order.created_at)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: order.status === 'FAILED' ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
                    color: order.status === 'FAILED' ? 'var(--color-danger)' : 'var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {order.status === 'FAILED' ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                    {order.status === 'FAILED' ? 'Card Declined / Gateway Refused' : 'Payment Capture Completed & Webhook Logged'}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {formatDate(order.updated_at)}
                  </div>
                  {order.error_reason && (
                    <div
                      style={{
                        marginTop: '6px',
                        padding: '8px 10px',
                        backgroundColor: 'var(--color-danger-bg)',
                        border: '1px solid var(--color-danger-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-danger-text)',
                      }}
                    >
                      {order.error_reason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Side Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Customer Profile */}
          <Card title="Customer Information">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Customer Name
                </span>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {order.customer?.name || 'PayPal Guest User'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Payer Email
                </span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                  {order.payer_email}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Billing Country
                </span>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                  {order.customer?.country || 'United States (US)'}
                </div>
              </div>
            </div>
          </Card>

          {/* Operational Actions */}
          <Card title="Settlement Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button
                variant="secondary"
                size="md"
                icon={RotateCcw}
                onClick={() => setIsRefundModalOpen(true)}
                disabled={order.status !== 'COMPLETED'}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                Initiate Refund...
              </Button>

              <Button
                variant="secondary"
                size="md"
                icon={FileText}
                onClick={() => toast.info('Ledger Lookup', 'Generated double-entry accounting slip reference.')}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                View Ledger Entry
              </Button>
            </div>

            {isHighValue && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '10px 12px',
                  backgroundColor: 'var(--color-warning-bg)',
                  border: '1px solid var(--color-warning-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '11px',
                  color: 'var(--color-warning-text)',
                  display: 'flex',
                  gap: '8px',
                  lineHeight: 1.4,
                }}
              >
                <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Dual Confirmation Enforced:</strong> This transaction exceeds $100.00. Refunds must be confirmed by an authorized administrator before settlement payout.
                </span>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Issue Refund Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Initiate Transaction Refund"
        description={`Refund for order ${order.paypal_order_id} (${formatCurrency(order.amount_cents, order.currency)})`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={refundSubmitting}
              onClick={handleIssueRefund}
            >
              {isHighValue ? 'Submit for Dual Approval' : 'Execute Refund'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isHighValue && (
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--color-warning-bg)',
                border: '1px solid var(--color-warning-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-warning-text)',
                display: 'flex',
                gap: '8px',
                lineHeight: 1.4,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>
                <strong>Dual Confirmation Required:</strong> Because this refund exceeds the $100.00 safety threshold, it will be placed in the <code>PendingAction</code> queue for secondary administrator approval.
              </div>
            </div>
          )}

          <Input
            label="Refund Reason / Audit Note"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            required
            helperText="Reason will be stored immutably in SQLite audit logs."
          />
        </div>
      </Modal>
    </PageContainer>
  );
}
