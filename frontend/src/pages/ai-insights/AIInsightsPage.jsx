import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  Bot,
  ExternalLink,
  Cpu,
  Activity,
  Layers,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { FIXTURE_AI_INSIGHTS } from '../../data/fixtures';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export function AIInsightsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredInsights = FIXTURE_AI_INSIGHTS.filter((item) => {
    if (severityFilter !== 'ALL' && item.severity !== severityFilter) return false;
    return true;
  });

  return (
    <PageContainer>
      <PageHeader
        title="AI Operational Intelligence"
        description="Continuous machine learning telemetry analyzing decline clusters, velocity anomalies, and gateway latency spikes."
        badge={
          <Badge variant="ai" pill style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={11} />
            <span>Copilot Telemetry Active</span>
          </Badge>
        }
        actions={
          <div style={{ width: '160px' }}>
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Severities' },
                { value: 'high', label: 'High Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'low', label: 'Low / Optimization' },
              ]}
            />
          </div>
        }
      />

      {/* Operational Notice Banner */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderLeft: '4px solid var(--color-ai)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: 'var(--color-ai-bg)',
            color: 'var(--color-ai)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Cpu size={15} />
        </div>
        <div style={{ flex: 1, lineHeight: 1.45 }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Forensic Governance Notice:</strong> AI telemetry models synthesize raw SQLite transaction logs and PayPal webhook event queues. Suggested rules are decision-support hypotheses and are never applied to gateway routing without explicit human approval.
        </div>
      </div>

      {/* Structured AI Investigation Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {filteredInsights.map((insight) => {
          let badgeVariant = 'neutral';
          if (insight.severity === 'high') badgeVariant = 'danger';
          else if (insight.severity === 'medium') badgeVariant = 'warning';
          else if (insight.severity === 'low') badgeVariant = 'ai';

          return (
            <div
              key={insight.id}
              className="card"
              style={{
                padding: '22px 24px',
                borderLeft:
                  insight.severity === 'high'
                    ? '4px solid var(--color-danger)'
                    : insight.severity === 'medium'
                    ? '4px solid var(--color-warning)'
                    : '4px solid var(--color-ai)',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <Badge variant={badgeVariant} pill showDot>
                      {insight.severity.toUpperCase()} SEVERITY
                    </Badge>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 650,
                        color: 'var(--color-ai-text)',
                        backgroundColor: 'var(--color-ai-bg)',
                        border: '1px solid var(--color-ai-border)',
                        padding: '1px 7px',
                        borderRadius: '4px',
                      }}
                    >
                      {insight.category}
                    </span>
                    <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                      • <strong>{insight.confidence_pct}%</strong> model confidence
                    </span>
                    <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                      • <strong>{insight.affected_records}</strong> transactions flagged
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 650, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                    {insight.title}
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Signal Detected
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '12px', fontWeight: 550, color: 'var(--color-text-secondary)' }}>
                    {formatDate(insight.generated_at)}
                  </div>
                </div>
              </div>

              {/* Observed Telemetry Summary */}
              <div style={{ marginBottom: '14px' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                  {insight.summary}
                </p>
              </div>

              {/* Telemetry Evidence Box */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '10.5px', fontWeight: 650, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Empirical Evidence & Telemetry Signals
                </div>
                <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
                  {insight.evidence.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>

              {/* Recommendation Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <div style={{ flex: '1 1 450px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 650, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    Recommended Mitigation
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 550, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    {insight.recommendation}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => navigate(`/ai-insights/${insight.id}`)}
                  >
                    Triage & Evidence →
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
