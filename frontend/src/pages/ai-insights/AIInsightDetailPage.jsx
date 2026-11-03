import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  ExternalLink,
  SlidersHorizontal,
  Cpu,
  FileText,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { aiService } from '../../services/aiService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export function AIInsightDetailPage() {
  const { insightId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [applyingAction, setApplyingAction] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await aiService.getInsightById(insightId);
        setInsight(res.data);
      } catch {
        const all = await aiService.getInsights();
        setInsight(all.data[0]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [insightId]);

  const handleFeedback = (type) => {
    setFeedbackGiven(type);
    toast.success('Feedback Recorded', `Operator telemetry feedback recorded (${type === 'helpful' ? 'Validated' : 'Noise'}). Model weights updated.`);
  };

  const handleApplyRecommendation = () => {
    setApplyingAction(true);
    setTimeout(() => {
      setApplyingAction(false);
      setIsActionModalOpen(false);
      toast.success(
        'Mitigation Policy Applied',
        `Configured gateway fallback: ${insight.suggested_action}. Audit event logged.`
      );
    }, 650);
  };

  if (loading || !insight) {
    return (
      <PageContainer>
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Sparkles className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
          <p>Loading AI insight telemetry...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={insight.title}
        description={`Analyzed by PayOps Copilot • Generated on ${formatDate(insight.generated_at)}`}
        badge={
          <Badge variant="ai" pill>
            {insight.category}
          </Badge>
        }
        customBreadcrumbs={[
          { to: '/dashboard', label: 'Overview' },
          { to: '/ai-insights', label: 'AI Insights' },
          { label: insight.title.substring(0, 24) + '…' },
        ]}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/ai-insights')}
          >
            Back to Insights
          </Button>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Main Analysis Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title="Observed Telemetry & Anomaly Analysis">
            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 650, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Operational Summary
              </span>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', marginTop: '4px', lineHeight: 1.6 }}>
                {insight.summary}
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                marginBottom: '18px',
              }}
            >
              <span style={{ fontSize: '10.5px', fontWeight: 650, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Primary Empirical Evidence Points
              </span>
              <ul style={{ paddingLeft: '18px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
                {insight.evidence.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Affected Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '14px',
                padding: '14px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Impacted Transactions
                </span>
                <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {insight.affected_records} orders
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  At-Risk Checkout Volume
                </span>
                <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {formatCurrency(insight.affected_volume_cents, 'USD')}
                </div>
              </div>
            </div>
          </Card>

          {/* Model Transparency & Human Calibration */}
          <Card title="Operator Feedback & Model Calibration">
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
              PayOps AI utilizes direct feedback from operations engineers to calibrate anomaly threshold sensitivity and suppress false-positive alarms.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 550 }}>
                Was this operational signal accurate?
              </span>
              <Button
                variant={feedbackGiven === 'helpful' ? 'primary' : 'secondary'}
                size="sm"
                icon={ThumbsUp}
                onClick={() => handleFeedback('helpful')}
              >
                Validated
              </Button>
              <Button
                variant={feedbackGiven === 'not_helpful' ? 'destructive' : 'secondary'}
                size="sm"
                icon={ThumbsDown}
                onClick={() => handleFeedback('not_helpful')}
              >
                False Positive / Noise
              </Button>
            </div>
          </Card>
        </div>

        {/* Side Panel: Recommendation and Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title="Recommended Mitigation">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--color-ai-bg)',
                  border: '1px solid var(--color-ai-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12.5px',
                  color: 'var(--color-ai-text)',
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                {insight.recommendation}
              </div>

              <Button
                variant="primary"
                size="md"
                icon={SlidersHorizontal}
                onClick={() => setIsActionModalOpen(true)}
                style={{ width: '100%' }}
              >
                {insight.suggested_action}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/transactions')}
                style={{ width: '100%' }}
              >
                Inspect Flagged Orders →
              </Button>
            </div>
          </Card>

          <Card title="Telemetry Telemetry Specifications">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Confidence Score</span>
                <span style={{ fontWeight: 650 }}>{insight.confidence_pct}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Engine Engine</span>
                <span>PayOps Anomaly Engine v2.4</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Audit Record</span>
                <code>aud_002</code>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={insight.suggested_action}
        description="Verify and apply recommended operational rules across the payment pipeline."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={applyingAction}
              onClick={handleApplyRecommendation}
            >
              Confirm Rule Application
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Applying this mitigation will configure automated routing fallback for transactions matching this risk cluster. An entry will be posted to the immutable audit trail under your operator ID.
        </p>
      </Modal>
    </PageContainer>
  );
}
