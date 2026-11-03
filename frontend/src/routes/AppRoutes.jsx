import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';

// Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { TransactionsPage } from '../pages/transactions/TransactionsPage';
import { TransactionDetailPage } from '../pages/transactions/TransactionDetailPage';
import { PaymentsPage } from '../pages/payments/PaymentsPage';
import { PayoutsPage } from '../pages/payouts/PayoutsPage';
import { AIInsightsPage } from '../pages/ai-insights/AIInsightsPage';
import { AIInsightDetailPage } from '../pages/ai-insights/AIInsightDetailPage';
import { RiskPage } from '../pages/risk/RiskPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { ActivityPage } from '../pages/activity/ActivityPage';
import { NotFoundPage } from '../pages/common/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Workspace Shell */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Transactions */}
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/transactions/:transactionId" element={<TransactionDetailPage />} />

        {/* Payments & Payouts */}
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/payouts" element={<PayoutsPage />} />

        {/* Intelligence */}
        <Route path="/ai-insights" element={<AIInsightsPage />} />
        <Route path="/ai-insights/:insightId" element={<AIInsightDetailPage />} />
        <Route path="/risk" element={<RiskPage />} />
        <Route path="/reports" element={<ReportsPage />} />

        {/* Administration */}
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/settings" element={<SettingsPage />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={null} />
          <Route path="team" element={null} />
          <Route path="integrations" element={null} />
          <Route path="notifications" element={null} />
        </Route>

        {/* 404 Catch-All within Layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

