import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  FileCheck2,
  Lock,
  ArrowRight,
  Info,
  Calendar,
  AlertOctagon,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { riskService } from '../../services/riskService';
import { FIXTURE_RISK_ALERTS, FIXTURE_PENDING_ACTIONS } from '../../data/fixtures';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export function RiskPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [alerts, setAlerts] = useState(FIXTURE_RISK_ALERTS);
  const [pendingActions, setPendingActions] = useState(FIXTURE_PENDING_ACTIONS);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' | 'reject'
  const [confirming, setConfirming] = useState(false);
  const [complianceChecked, setComplianceChecked] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadRiskData() {
      try {
        const [alertsRes, actionsRes] = await Promise.all([
          riskService.getAlerts(),
          riskService.getPendingActions(),
        ]);
        if (isMounted) {
          if (alertsRes?.data) setAlerts(alertsRes.data);
          if (actionsRes?.data) setPendingActions(actionsRes.data);
        }
      } catch (e) {
        console.warn('Risk data fetch error:', e);
      }
    }
    loadRiskData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && a.entity_type !== typeFilter) return false;
    return true;
  });

  const handleOpenActionModal = (action, type) => {
    setSelectedAction(action);
    setActionType(type);
    setComplianceChecked(false);
    setRejectReason('');
  };

  const handleConfirmPendingAction = async () => {
    setConfirming(true);
    const isApproval = actionType === 'approve';
    const targetAction = selectedAction;

    try {
      if (isApproval) {
        await riskService.confirmPendingAction(targetAction.id);
        setPendingActions((prev) => prev.filter((p) => p.id !== targetAction.id));
        setSelectedAction(null);
        toast.success(
          'Dual Authorization Executed & Sealed',
          `Executed ${targetAction.action_type} for ${formatCurrency(
            targetAction.amount_cents,
            targetAction.currency
          )}. Audit ledger hash generated.`
        );
      } else {
        await riskService.rejectPendingAction(targetAction.id, rejectReason);
        setPendingActions((prev) => prev.filter((p) => p.id !== targetAction.id));
        setSelectedAction(null);
        toast.warning(
          'Action Rejected',
          `Rejected pending action ${targetAction.id}. Ledger state preserved.`
        );
      }
    } catch (err) {
      toast.error('Execution Failed', err.message || 'Operation could not be completed.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Risk & Fraud Alerts"
        description="Automated chargeback defense, card velocity monitoring, and dual-authorization queue for high-value operations."
      />

      {/* KPI Overview Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <div className="card kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Dual Confirmation Queue
            </span>
            <span className="badge badge-warning" style={{ fontSize: '11px' }}>
              Requires Admin Sign-off
            </span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>
            {pendingActions.length} Actions
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Pending total: {formatCurrency(129500, 'USD')}
          </div>
        </div>

        <div className="card kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Active PayPal Disputes
            </span>
            <span className="badge badge-warning" style={{ fontSize: '11px' }}>
              Action Deadline Active
            </span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>
            1 Case
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            $345.00 USD at risk • 7 days left
          </div>
        </div>

        <div className="card kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Blocked Velocity Attacks
            </span>
            <span className="badge badge-success" style={{ fontSize: '11px' }}>
              Auto-Mitigated
            </span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>
            3 Incidents
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Card testing heuristic blocked (09:50 UTC)
          </div>
        </div>

        <div className="card kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Fraud Engine Rules
            </span>
            <span className="badge badge-info" style={{ fontSize: '11px' }}>
              v2.4.1 Active
            </span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>
            Enforcing
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Threshold: &gt; $100.00 USD triggers dual review
          </div>
        </div>
      </div>

      {/* Dual Confirmation Queue Section */}
      <Card
        title="Dual-Confirmation Approval Queue"
        description="Irreversible balance debits (> $100.00) and dispute settlements requiring independent secondary sign-off."
        action={
          <Badge variant={pendingActions.length > 0 ? 'warning' : 'success'} pill>
            {pendingActions.length} Pending Actions
          </Badge>
        }
      >
        {/* Governance banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'var(--color-brand-50)',
            border: '1px solid var(--color-brand-100)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
          }}
        >
          <ShieldCheck size={18} style={{ color: 'var(--color-brand-800)', marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-brand-900)', lineHeight: 1.5 }}>
            <strong>Separation of Duties Governance (FIPS 140-2 / SOC-2 Compliance):</strong>{' '}
            To prevent rogue ledger mutations, an operator proposing a refund or dispute concession cannot authorize it.
            An authenticated Administrator must verify and sign off. Every sign-off event generates an immutable cryptographic audit record.
          </div>
        </div>

        {pendingActions.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <CheckCircle2 size={32} style={{ color: 'var(--color-success)', margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Dual Confirmation Queue Cleared
            </h4>
            <p style={{ fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
              No transactions currently await secondary sign-off.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingActions.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  padding: '16px 20px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderLeft: '4px solid var(--color-warning)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ flex: '1 1 500px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <Badge variant="warning" pill>
                      {item.action_type}
                    </Badge>
                    <span
                      className="tabular-nums"
                      style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {formatCurrency(item.amount_cents, item.currency)}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                      Ref: {item.id}
                    </span>
                  </div>

                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    {item.reason}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-secondary)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>
                      Proposed by: <strong style={{ color: 'var(--color-text-primary)' }}>{item.proposed_by}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Target Entity: <code style={{ fontSize: '11px' }}>{item.entity_id}</code>
                    </span>
                    <span>•</span>
                    <span className="tabular-nums">{formatDate(item.created_at)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => handleOpenActionModal(item, 'reject')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ShieldCheck}
                    onClick={() => handleOpenActionModal(item, 'approve')}
                  >
                    Review & Authorize
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: 'var(--space-6)',
          marginBottom: 'var(--space-3)',
        }}
      >
        <div>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Active Security & Dispute Alerts
          </h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Heuristic security signals, velocity threshold violations, and third-party dispute cases.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ width: '160px' }}>
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Severities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />
          </div>

          <div style={{ width: '160px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'NEW', label: 'New' },
                { value: 'INVESTIGATING', label: 'Investigating' },
                { value: 'RESOLVED', label: 'Resolved' },
              ]}
            />
          </div>

          <div style={{ width: '160px' }}>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Entity Types' },
                { value: 'Order', label: 'Orders' },
                { value: 'Dispute', label: 'Disputes' },
                { value: 'PendingAction', label: 'Pending Actions' },
                { value: 'Event', label: 'Gateway Events' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Alerts Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p>No risk alerts match the selected filters.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            let badgeVariant = 'neutral';
            let iconColor = 'var(--color-text-muted)';
            let iconBg = 'var(--color-surface-subtle)';
            let borderAccent = 'var(--color-border)';

            if (alert.severity === 'critical') {
              badgeVariant = 'danger';
              iconColor = 'var(--color-danger)';
              iconBg = 'var(--color-danger-bg)';
              borderAccent = 'var(--color-danger)';
            } else if (alert.severity === 'high') {
              badgeVariant = 'danger';
              iconColor = 'var(--color-danger)';
              iconBg = 'var(--color-danger-bg)';
              borderAccent = 'var(--color-danger)';
            } else if (alert.severity === 'medium') {
              badgeVariant = 'warning';
              iconColor = 'var(--color-warning)';
              iconBg = 'var(--color-warning-bg)';
              borderAccent = 'var(--color-warning)';
            } else if (alert.severity === 'low') {
              badgeVariant = 'info';
              iconColor = 'var(--color-primary)';
              iconBg = 'var(--color-primary-100)';
              borderAccent = 'var(--color-primary)';
            }

            return (
              <div
                key={alert.id}
                className="card"
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderLeft: `4px solid ${borderAccent}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', maxWidth: '850px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: iconBg,
                      color: iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {alert.severity === 'critical' ? (
                      <AlertOctagon size={22} />
                    ) : alert.severity === 'high' ? (
                      <ShieldAlert size={22} />
                    ) : (
                      <AlertTriangle size={22} />
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <Badge variant={badgeVariant} pill showDot>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Rule: <code>{alert.alert_code}</code>
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>•</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        Target: <strong>{alert.entity_type}</strong> (<code>{alert.entity_id}</code>)
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>•</span>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                        {alert.status}
                      </span>
                    </div>

                    <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {alert.title}
                    </h4>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                      {alert.description}
                    </p>

                    {/* Dispute Countdown / Velocity Highlight */}
                    {alert.alert_code === 'DISPUTE_OPENED' && (
                      <div
                        style={{
                          marginTop: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          backgroundColor: 'var(--color-warning-bg)',
                          border: '1px solid var(--color-warning-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-warning-text)',
                          fontWeight: 550,
                        }}
                      >
                        <Clock size={13} />
                        Dispute Response Window: 7 days remaining (Due Nov 10, 2026 23:59 UTC)
                      </div>
                    )}

                    {alert.alert_code === 'FRAUD_SUSPECT_01' && (
                      <div
                        style={{
                          marginTop: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          backgroundColor: 'var(--color-danger-bg)',
                          border: '1px solid var(--color-danger-border)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-danger-text)',
                          fontWeight: 550,
                        }}
                      >
                        <ShieldAlert size={13} />
                        Velocity Breach: 3 consecutive card testing handshakes blocked within 45s
                      </div>
                    )}

                    {/* Action Required Box */}
                    <div
                      style={{
                        marginTop: '10px',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-brand-900)',
                        backgroundColor: 'var(--color-brand-50)',
                        border: '1px solid var(--color-brand-100)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Info size={13} style={{ color: 'var(--color-brand-700)' }} />
                      <span>
                        <strong>Action Required:</strong> {alert.action_required}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div
                    className="tabular-nums"
                    style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}
                  >
                    {formatDate(alert.created_at)}
                  </div>
                  {alert.entity_type === 'Order' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/transactions/${alert.entity_id}`)}
                    >
                      View Order →
                    </Button>
                  )}
                  {alert.entity_type === 'PendingAction' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const targetPending = pendingActions.find((p) => p.id === alert.entity_id) || pendingActions[0];
                        if (targetPending) {
                          handleOpenActionModal(targetPending, 'approve');
                        }
                      }}
                    >
                      Review Action →
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Enhanced Dual-Confirmation Modal */}
      {selectedAction && (
        <Modal
          isOpen={Boolean(selectedAction)}
          onClose={() => setSelectedAction(null)}
          title={
            actionType === 'approve'
              ? 'Approve Dual-Confirmation Action'
              : 'Reject Pending Operation'
          }
          description={`Action Reference: ${selectedAction.id} • SOC-2 / FIPS 140-2 Compliance Queue`}
          maxWidth="600px"
          footer={
            <>
              <Button
                variant="secondary"
                disabled={confirming}
                onClick={() => setSelectedAction(null)}
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'approve' ? 'primary' : 'destructive'}
                loading={confirming}
                disabled={actionType === 'approve' && !complianceChecked}
                icon={actionType === 'approve' ? ShieldCheck : X}
                onClick={handleConfirmPendingAction}
              >
                {actionType === 'approve'
                  ? 'Confirm & Sign Authorization'
                  : 'Reject & Restore State'}
              </Button>
            </>
          }
        >
          {actionType === 'approve' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Financial Consequence Warning Box */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--color-warning-bg)',
                  border: '1px solid var(--color-warning-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-warning-text)', fontWeight: 700 }}>
                    Irreversible Financial Debit
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Authorizing will immediately deduct funds from operating settlement reserves.
                  </div>
                </div>
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: '26px',
                    fontWeight: 700,
                    color: 'var(--color-danger)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  -{formatCurrency(selectedAction.amount_cents, selectedAction.currency)}
                </div>
              </div>

              {/* Separation of Duties Attestation Box */}
              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  backgroundColor: 'var(--color-surface-subtle)',
                }}
              >
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Separation of Duties Verification
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Proposing Operator</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                      {selectedAction.proposed_by}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Role: Operator (Initiator)
                    </div>
                  </div>

                  <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Authorizing Sign-off</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                      Alex Vance (Admin)
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '2px' }}>
                      Role: Administrator (Signer)
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-success-text)',
                    backgroundColor: 'var(--color-success-bg)',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-success-border)',
                  }}
                >
                  <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                  <span>Separation of Duties Verified: Signer and Proposer are distinct identities.</span>
                </div>
              </div>

              {/* Action Details Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: '8px 12px',
                  fontSize: 'var(--font-size-sm)',
                  padding: '0 4px',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Action Type:</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  <code>{selectedAction.action_type}</code>
                </span>

                <span style={{ color: 'var(--color-text-muted)' }}>Entity Target:</span>
                <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'monospace', fontSize: '12px' }}>
                  {selectedAction.entity_type} ({selectedAction.entity_id})
                </span>

                <span style={{ color: 'var(--color-text-muted)' }}>Context / Reason:</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {selectedAction.reason}
                </span>

                <span style={{ color: 'var(--color-text-muted)' }}>Submitted:</span>
                <span className="tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatDate(selectedAction.created_at)}
                </span>
              </div>

              {/* Explicit Confirmation Safeguard */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={complianceChecked}
                  onChange={(e) => setComplianceChecked(e.target.checked)}
                  style={{
                    marginTop: '3px',
                    accentColor: 'var(--color-primary)',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)', lineHeight: 1.45 }}>
                  <strong>Compliance Verification:</strong> I confirm that I have reviewed the customer file and authorize this irreversible disbursement of{' '}
                  <strong>{formatCurrency(selectedAction.amount_cents, selectedAction.currency)}</strong> under company dual-control financial governance policies.
                </span>
              </label>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                You are about to reject the pending action{' '}
                <code style={{ fontWeight: 600 }}>{selectedAction.id}</code> ({selectedAction.action_type}) proposed by {selectedAction.proposed_by}.
              </p>

              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--color-danger-bg)',
                  border: '1px solid var(--color-danger-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-danger-text)',
                }}
              >
                <strong>Warning:</strong> The pending debit of{' '}
                <strong>{formatCurrency(selectedAction.amount_cents, selectedAction.currency)}</strong> will be cancelled and the parent transaction state will remain untouched.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Rejection Reason (Logged to Immutable Audit Trail)
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Chargeback defense submitted to PayPal instead of concession; refund denied."
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>
          )}
        </Modal>
      )}
    </PageContainer>
  );
}
