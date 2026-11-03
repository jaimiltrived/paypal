import React from 'react';

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  style = {},
  ...props
}) {
  let defaultHeight = '14px';
  let defaultWidth = '100%';
  let radius = 'var(--radius-sm)';

  if (variant === 'title') {
    defaultHeight = '24px';
    defaultWidth = '50%';
  } else if (variant === 'circle') {
    defaultHeight = width || '36px';
    defaultWidth = width || '36px';
    radius = '50%';
  } else if (variant === 'rect') {
    defaultHeight = height || '120px';
    radius = 'var(--radius-md)';
  }

  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{
        width: width || defaultWidth,
        height: height || defaultHeight,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
      <Skeleton variant="text" height="28px" width="100%" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} variant="text" height="18px" width={`${100 / columns}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Skeleton variant="text" width="40%" height="16px" />
        <Skeleton variant="circle" width="28px" />
      </div>
      <Skeleton variant="title" width="60%" height="32px" style={{ marginBottom: '12px' }} />
      <Skeleton variant="text" width="80%" height="14px" />
    </div>
  );
}

