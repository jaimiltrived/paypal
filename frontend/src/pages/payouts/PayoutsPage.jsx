import React from 'react';
import { Wallet, Info, ArrowLeft, ArrowRight, CheckCircle2, Clock, ShieldCheck, Layers, GitBranch, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export function PayoutsPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageHeader
        title="Payouts & Partner Disbursements"
        description="Batch disbursement pipeline for vendor payables, marketplace seller splits, and contractor disbursements."
        badge={
          <Badge variant="neutral" pill>
            Planned Capability • Milestone 2
          </Badge>
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        }
      />

      {/* Architectural Status Banner */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Wallet size={22} />
          </div>

          <div style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 650, color: 'var(--color-text-primary)' }}>
                PayPal Payouts Engine Integration Roadmap
              </h3>
              <Badge variant="info" pill>In Progress</Badge>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              The core PayOps backend milestone enforces incoming checkout captures, refunds, and double-entry ledger tracking. Outgoing batch disbursements via PayPal Payouts SDK will connect in Milestone 2 without disrupting active ledger accounting.
            </p>
          </div>
        </div>

        {/* Integration Phases Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--color-success-bg)',
              border: '1px solid var(--color-success-border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <CheckCircle2 size={16} color="var(--color-success)" />
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-success-text)', textTransform: 'uppercase' }}>
                Milestone 1 (Operational)
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Capture & Inbound Ledger
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              PayPal REST v2 orders, captures, refund holding queues, and immutable SQLite audit trails.
            </p>
          </div>

          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--color-primary-50)',
              border: '1px solid var(--color-primary-100)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Clock size={16} color="var(--color-primary)" />
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Milestone 2 (Current Focus)
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Batch Payouts REST v1 Adapter
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Multi-recipient payout batches with asynchronous webhook tracking (SUCCESS, UNCLAIMED, RETURNED).
            </p>
          </div>

          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <ShieldCheck size={16} color="var(--color-text-muted)" />
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Milestone 3 (Governance)
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Dual-Signoff Payout Thresholds
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Automatic escrow reservation with secondary administrator confirmation on single payouts exceeding $500.00.
            </p>
          </div>
        </div>
      </Card>

      {/* Planned Technical Specifications */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        <Card title="Pre-Flight Ledger Verification">
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            To prevent negative balance states in PayPal operating clearing balances, each batch disbursement initiates a synchronous double-entry pre-flight debit validation against the local SQLite ledger before dispatching requests to PayPal.
          </p>
          <div style={{ marginTop: '14px', fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
            Status: Schema verified in <code>app.schemas.ledger</code>
          </div>
        </Card>

        <Card title="Disbursement Actions & Navigation">
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            You can review settled capture balances and historical reconciliation slips in the Reports workspace while the payout batch engine is under active development.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
            <Button
              variant="primary"
              size="sm"
              icon={FileText}
              onClick={() => navigate('/reports')}
            >
              Inspect Ledger Reports
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Back to Overview
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
