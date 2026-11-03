import React from 'react';

export function Badge({
  children,
  variant = 'neutral',
  pill = false,
  showDot = false,
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <span
      className={`badge badge-${variant} ${pill ? 'badge-pill' : ''} ${className}`.trim()}
      {...props}
    >
      {showDot && <span className="badge-dot" aria-hidden="true" />}
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </span>
  );
}
