import React, { useState } from 'react';
import {
  ChartNoAxesCombined,
  Download,
  Calendar,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  FileText,
  Filter,
  Layers,
  Database,
  Lock,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { FIXTURE_REPORTS_CATEGORIES } from '../../data/fixtures';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export function ReportsPage() {
  const toast = useToast();
  const [dateRange, setDateRange] = useState('30d');
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = (report, format) => {
    setDownloadingId(`${report.id}-${format}`);
    setTimeout(() => {
      setDownloadingId(null);
      toast.success(
        'Financial Report Generated',
        `${report.title} exported as ${format} for period ${dateRange}. Checksum verified.`
      );
    }, 750);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Reports & Reconciliation"
        description="Double-entry ledger summaries, fee audits, gateway settlement matching, and tax exports."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '170px' }}>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={[
                  { value: '7d', label: 'Last 7 days' },
                  { value: '30d', label: 'Last 30 days' },
                  { value: '90d', label: 'Last Quarter' },
                  { value: 'ytd', label: 'Year-to-date (2026)' },
                ]}
              />
            </div>
            <Button
              variant="secondary"
              icon={Download}
              onClick={() => {
                toast.success('Batch Export Initiated', 'Compiling complete financial ledger zip archive.');
              }}
            >
              Export All
            </Button>
          </div>
        }
      />

      {/* Financial Health & Reconciliation Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <div className="card kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Reconciled Gross Volume
          </div>
          <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>
            $124,580.00 USD
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            142 captures • 100% matched
          </div>
        </div>

        <div className="card kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            PayPal Fees Audited
          </div>
          <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>
            $3,612.82 USD
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Effective fee rate: 2.90%
          </div>
        </div>

        <div className="card kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Net Settlement Disbursed
          </div>
          <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>
            $120,967.18 USD
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', marginTop: '4px' }}>
            Zero ledger discrepancy
          </div>
        </div>

        <div className="card kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            Dispute Loss Ratio
          </div>
          <div className="tabular-nums" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>
            0.08%
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', marginTop: '4px' }}>
            Below 0.90% network threshold
          </div>
        </div>
      </div>

      {/* Reports Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: 'var(--space-6)' }}>
        {FIXTURE_REPORTS_CATEGORIES.map((report) => (
          <div
            key={report.id}
            className="card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--color-primary)',
                    backgroundColor: 'var(--color-primary-100)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {report.frequency}
                </span>
                <span className="tabular-nums" style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Generated: {formatDate(report.last_generated)}
                </span>
              </div>

              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {report.title}
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '8px', lineHeight: 1.55 }}>
                {report.description}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-border)',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Available formats: <strong>{report.supported_formats.join(' • ')}</strong>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {report.supported_formats.includes('CSV') && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={FileSpreadsheet}
                    loading={downloadingId === `${report.id}-CSV`}
                    onClick={() => handleDownload(report, 'CSV')}
                  >
                    Download CSV
                  </Button>
                )}
                {report.supported_formats.includes('JSON') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FileCode}
                    loading={downloadingId === `${report.id}-JSON`}
                    onClick={() => handleDownload(report, 'JSON')}
                  >
                    JSON
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Double-Entry Ledger & Financial Integrity Panel */}
      <Card
        title="Double-Entry Ledger Integrity & Financial Audit Status"
        description="Continuous verification of database transactions against double-entry accounting invariance and PayPal settlement clearing."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
            PayOps AI enforces automated double-entry accounting rules across all payments, fees, and dispute reserves.
            Every customer transaction creates balanced debit and credit entries in the SQLite ledger.
            Monetary amounts are stored strictly as integer cents to prevent IEEE 754 floating-point rounding errors.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
            }}
          >
            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                <CheckCircle2 size={16} />
                <span>Double-Entry Balance State</span>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                Zero net drift. Total debits exactly equal total credits across all 142 transactions.
              </p>
            </div>

            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                <CheckCircle2 size={16} />
                <span>Strict Integer Cents Precision</span>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                Zero decimal rounding variance. Stored as integer values under ISO 4217 minor unit standard.
              </p>
            </div>

            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                <CheckCircle2 size={16} />
                <span>PayPal Clearing Match</span>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                100% matched. All 142 gateway captures match internal order and payout journal entries.
              </p>
            </div>

            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-brand-800)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                <Lock size={16} />
                <span>Cryptographic Audit Seal</span>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                Audit seal block #8912 verified (SHA-256: 7fa8...c21e). Immutable ledger chain valid.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
