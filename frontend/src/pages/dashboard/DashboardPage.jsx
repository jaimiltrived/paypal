import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Download,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Percent,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';

import { PageContainer } from '../../components/layout/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
import { AiCopilotPanel } from '../../components/ai/AiCopilotPanel';
import { SettlementDonut } from '../../components/dashboard/SettlementDonut';
import { ordersService } from '../../services/ordersService';
import { exportDashboardSummaryToCSV } from '../../utils/exportUtils';
import {
  FIXTURE_KPI_METRICS,
  FIXTURE_CHART_VOLUME,
  FIXTURE_STATUS_DISTRIBUTION,
  FIXTURE_ORDERS,
  FIXTURE_AI_INSIGHTS,
} from '../../data/fixtures';
import { formatCurrency, formatDate, truncateId } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [dateRange, setDateRange] = useState('7d');
  const [metrics, setMetrics] = useState(FIXTURE_KPI_METRICS);
  const [recentOrders, setRecentOrders] = useState(FIXTURE_ORDERS.slice(0, 5));

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [mRes, oRes] = await Promise.all([
          ordersService.getMetrics(),
          ordersService.getOrders({ limit: 5 }),
        ]);
        if (isMounted) {
          if (mRes?.data) setMetrics(mRes.data);
          if (oRes?.data) setRecentOrders(oRes.data.slice(0, 5));
        }
      } catch (err) {
        console.warn('Dashboard live data fetch error:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Top AI Insight for quick action
  const priorityInsight = FIXTURE_AI_INSIGHTS[0];
  const latest = FIXTURE_CHART_VOLUME.at(-1);

  const handleExport = () => {
    exportDashboardSummaryToCSV(metrics, FIXTURE_CHART_VOLUME, FIXTURE_STATUS_DISTRIBUTION);
    toast.success('Report Export Initiated', 'Daily settlement ledger summary downloaded in CSV format.');
  };

  const isSuccessRateBelowTarget = metrics.success_rate_pct < metrics.success_rate_target_pct;
  const successRateDelta = (metrics.success_rate_pct - metrics.success_rate_target_pct).toFixed(2);

  const columns = [
    {
      header: 'Order Reference',
      key: 'id',
      render: (val, row) => (
        <div>
          <span
            className="tabular-nums"
            style={{ fontWeight: 600, color: 'var(--color-primary)' }}
          >
            {truncateId(val, 8, 4)}
          </span>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            PayPal: {row.paypal_order_id}
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
            {cust?.name || row.payer_email}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {row.payer_email}
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      key: 'amount_cents',
      align: 'right',
      render: (cents, row) => (
        <span
          className="tabular-nums"
          style={{ fontWeight: 650, color: 'var(--color-text-primary)' }}
        >
          {formatCurrency(cents, row.currency)}
        </span>
      ),
    },
    {
      header: 'Payment Method',
      key: 'payment_method',
      render: (val) => (
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            backgroundColor: 'var(--color-surface-subtle)',
            padding: '2px 7px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      key: 'created_at',
      render: (val) => (
        <span className="tabular-nums" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
          {formatDate(val)}
        </span>
      ),
    },
    {
      header: 'Gateway Status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      header: 'Action',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/transactions/${row.id}`);
          }}
        >
          Details →
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        description="Monitor end-to-end PayPal checkout volumes, settlement health, and AI-detected risk anomalies."
        actions={
          <>
            <div style={{ width: '140px' }}>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={[
                  { value: '7d', label: 'Last 7 days' },
                  { value: '30d', label: 'Last 30 days' },
                  { value: '90d', label: 'Last 90 days' },
                  { value: 'ytd', label: 'Year to date' },
                ]}
              />
            </div>
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExport}
            >
              Export Summary
            </Button>
          </>
        }
      />

      {/* Financial KPIs Row */}
      <section className="kpi-grid">
        {/* KPI 1: Total Volume */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Payment Volume</span>
            <div className="kpi-icon-wrapper">
              <CreditCard size={17} />
            </div>
          </div>
          <div>
            <div className="kpi-value">
              {formatCurrency(metrics.total_volume_cents, 'USD')}
            </div>
          </div>
          <div className="kpi-footer">
            <span className="kpi-trend kpi-trend-positive">
              <TrendingUp size={11} />
              +{metrics.total_volume_growth_pct}%
            </span>
            <span>vs previous period</span>
          </div>
        </div>

        {/* KPI 2: Successful Transactions */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Successful Transactions</span>
            <div className="kpi-icon-wrapper">
              <CheckCircle2 size={17} style={{ color: 'var(--color-success)' }} />
            </div>
          </div>
          <div>
            <div className="kpi-value">
              {metrics.successful_transactions.toLocaleString()}
            </div>
          </div>
          <div className="kpi-footer">
            <span className="kpi-trend kpi-trend-positive">
              <TrendingUp size={11} />
              +{metrics.successful_transactions_growth_pct}%
            </span>
            <span>settled captures</span>
          </div>
        </div>

        {/* KPI 3: Failed Transactions */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Failed Transactions</span>
            <div className="kpi-icon-wrapper">
              <AlertTriangle size={17} style={{ color: 'var(--color-danger)' }} />
            </div>
          </div>
          <div>
            <div className="kpi-value">
              {metrics.failed_transactions.toLocaleString()}
            </div>
          </div>
          <div className="kpi-footer">
            <span className="kpi-trend kpi-trend-positive">
              <TrendingDown size={11} />
              {metrics.failed_transactions_pct_change}%
            </span>
            <span>declines reduced</span>
          </div>
        </div>

        {/* KPI 4: Success Rate - PROPERLY REFLECTING TARGET STATUS (Amber if below target) */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Payment Success Rate</span>
            <div className="kpi-icon-wrapper">
              <Percent size={17} style={{ color: isSuccessRateBelowTarget ? 'var(--color-warning)' : 'var(--color-success)' }} />
            </div>
          </div>
          <div>
            <div className="kpi-value">
              {metrics.success_rate_pct}%
            </div>
          </div>
          <div className="kpi-footer">
            {isSuccessRateBelowTarget ? (
              <span className="kpi-trend kpi-trend-warning">
                <AlertTriangle size={11} />
                {successRateDelta}% vs Target {metrics.success_rate_target_pct}%
              </span>
            ) : (
              <span className="kpi-trend kpi-trend-positive">
                <CheckCircle2 size={11} />
                On Target ({metrics.success_rate_target_pct}%)
              </span>
            )}
            <span>Rolling 7-day average</span>
          </div>
        </div>
      </section>

      {/* Operational Attention: AI Copilot Panel */}
      {priorityInsight && (
        <AiCopilotPanel
          insight={priorityInsight}
          totalInsights={FIXTURE_AI_INSIGHTS.length}
          onOpenAll={() => navigate('/ai-insights')}
          onReview={() => navigate(`/ai-insights/${priorityInsight.id}`)}
          onApprove={(i) => toast.success('Recommendation Approved', i.title)}
        />
      )}

      {/* Analytics Section */}
      <section className="grid-charts">
        {/* Main Volume Trend Chart */}
        <Card
          title="Daily Payment Volume"
          description="Gross captured settlement volume in USD over the past 7 days"
        >
          <div style={{ height: '280px', width: '100%', marginTop: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FIXTURE_CHART_VOLUME} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" style={{ stopColor: 'var(--color-primary)' }} stopOpacity={0.2} />
                    <stop offset="95%" style={{ stopColor: 'var(--color-primary)' }} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--color-border)', strokeDasharray: '3 3' }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Captured Volume']}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-dropdown)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#volumeGrad)"
                />
                <ReferenceDot
                  x={latest.date}
                  y={latest.volume}
                  r={5}
                  fill="var(--color-danger)"
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Distribution Donut Chart */}
        <Card
          title="Payment Settlement Health"
          description="Distribution by gateway status"
        >
          <SettlementDonut data={FIXTURE_STATUS_DISTRIBUTION} />
        </Card>
      </section>

      {/* Recent Activity Table */}
      <section>
        <Card
          title="Recent Transactions & Settlement Feed"
          description="Real-time stream of incoming PayPal checkout authorizations and captures"
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/transactions')}
            >
              All Transactions
            </Button>
          }
          padding={false}
        >
          <Table
            columns={columns}
            data={recentOrders}
            onRowClick={(row) => navigate(`/transactions/${row.id}`)}
          />
        </Card>
      </section>
    </PageContainer>
  );
}
