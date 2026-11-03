import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS = {
  dashboard: 'Overview',
  transactions: 'Transactions',
  payments: 'Payments',
  payouts: 'Payouts',
  'ai-insights': 'AI Insights',
  risk: 'Risk & Alerts',
  reports: 'Reports',
  activity: 'Activity Log',
  settings: 'Settings',
  profile: 'Profile',
  team: 'Team & Roles',
  integrations: 'Integrations',
  notifications: 'Notifications',
};

export function Breadcrumbs({ customCrumbs, className = '' }) {
  const location = useLocation();

  if (customCrumbs) {
    return (
      <nav aria-label="Breadcrumb" className={className}>
        <ol style={{ display: 'flex', alignItems: 'center', gap: '6px', listStyle: 'none', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {customCrumbs.map((crumb, idx) => {
            const isLast = idx === customCrumbs.length - 1;
            return (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {crumb.to && !isLast ? (
                  <Link to={crumb.to} style={{ color: 'var(--color-text-secondary)' }}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={{ color: isLast ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontWeight: isLast ? 600 : 400 }}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0 || pathnames[0] === 'login') return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          listStyle: 'none',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
        }}
      >
        <li>
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-secondary)',
            }}
            title="Dashboard Overview"
          >
            <Home size={13} />
          </Link>
        </li>

        {pathnames.map((segment, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = ROUTE_LABELS[segment] || segment;

          return (
            <li key={routeTo} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronRight size={12} style={{ color: 'var(--color-text-muted)' }} />
              {isLast ? (
                <span
                  style={{
                    color: 'var(--color-text-primary)',
                    fontWeight: 600,
                  }}
                  aria-current="page"
                >
                  {label}
                </span>
              ) : (
                <Link to={routeTo} style={{ color: 'var(--color-text-secondary)' }}>
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

