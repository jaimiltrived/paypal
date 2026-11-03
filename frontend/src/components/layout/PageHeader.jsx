import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';

export function PageHeader({
  title,
  description,
  actions,
  showBreadcrumbs = true,
  customBreadcrumbs,
  badge,
  className = '',
}) {
  return (
    <div
      className={`page-header ${className}`.trim()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '24px',
      }}
    >
      {showBreadcrumbs && (
        <Breadcrumbs customCrumbs={customBreadcrumbs} style={{ marginBottom: '4px' }} />
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

