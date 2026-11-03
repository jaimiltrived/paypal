import React, { useEffect, useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useTypewriter } from '../../hooks/useTypewriter';
import './ai-copilot.css';

const SEVERITY_VARIANT = { high: 'danger', medium: 'warning', low: 'neutral' };

function ConfidenceRing({ pct }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const offset = ready ? c * (1 - pct / 100) : c;

  return (
    <div
      className="copilot-ring"
      role="img"
      aria-label={`Model confidence ${pct} percent`}
    >
      <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
        <circle cx="22" cy="22" r={r} className="copilot-ring-track" />
        <circle
          cx="22"
          cy="22"
          r={r}
          className="copilot-ring-value"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span className="copilot-ring-label tabular-nums">{Math.round(pct)}</span>
    </div>
  );
}

/**
 * Props map to the shape of FIXTURE_AI_INSIGHTS[0]. Fields used:
 *   id, title, summary, confidence_pct          (already in your banner)
 *   severity            optional, 'high' | 'medium' | 'low' (defaults to 'high')
 *   evidence            optional, string[]  (rename if your fixture calls it signals)
 *   recommended_action  optional, string
 */
export function AiCopilotPanel({
  insight,
  totalInsights,
  onOpenAll,
  onReview,
  onApprove,
}) {
  const [stage, setStage] = useState('idle'); // idle | confirming | approved
  const { text, done } = useTypewriter(insight.summary, { key: insight.id });

  const severity = insight.severity ?? 'high';
  const evidence = (insight.evidence ?? insight.signals ?? []).slice(0, 3);
  const action = insight.recommended_action ?? insight.recommendation ?? insight.suggested_action;

  const confirm = () => {
    setStage('approved');
    onApprove?.(insight);
  };

  return (
    <section className="copilot" aria-labelledby="copilot-title">
      <div className="copilot-head">
        <ConfidenceRing pct={insight.confidence_pct} />
        <div className="copilot-meta">
          <div className="copilot-kicker">
            <Sparkles size={14} aria-hidden="true" />
            <span>Copilot found something</span>
            <Badge variant={SEVERITY_VARIANT[severity] ?? 'neutral'} pill>
              {severity[0].toUpperCase() + severity.slice(1)} severity
            </Badge>
          </div>
          <h3 id="copilot-title" className="copilot-title">
            {insight.title}
          </h3>
        </div>
      </div>

      <div className="copilot-body">
        {/* Full text for screen readers; the streamed copy is decorative */}
        <p className="copilot-sr">{insight.summary}</p>
        <p className="copilot-summary" aria-hidden="true">
          {text}
          {!done && <span className="copilot-caret" />}
        </p>

        {evidence.length > 0 && (
          <ul className={`copilot-evidence ${done ? 'is-visible' : ''}`}>
            {evidence.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="copilot-foot">
        <div className="copilot-action-text">
          {stage === 'approved' ? (
            <span className="copilot-approved">
              <Check size={14} aria-hidden="true" /> Approved
            </span>
          ) : stage === 'confirming' ? (
            <span>Nothing runs until you confirm.</span>
          ) : (
            action && (
              <>
                <span className="copilot-action-label">Suggested fix</span>
                <span>{action}</span>
              </>
            )
          )}
        </div>

        <div className="copilot-buttons">
          {stage === 'idle' && (
            <>
              <Button variant="ghost" size="sm" onClick={onOpenAll}>
                All insights ({totalInsights})
              </Button>
              <Button variant="secondary" size="sm" onClick={onReview}>
                Review details
              </Button>
              {action && (
                <Button variant="primary" size="sm" onClick={() => setStage('confirming')}>
                  Approve fix
                </Button>
              )}
            </>
          )}
          {stage === 'confirming' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setStage('idle')}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={confirm}>
                Confirm and apply
              </Button>
            </>
          )}
          {stage === 'approved' && (
            <Button variant="secondary" size="sm" onClick={onReview}>
              View details
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

