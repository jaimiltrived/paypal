import React from 'react';

export function Card({
  title,
  description,
  action,
  children,
  footer,
  interactive = false,
  padding = true,
  className = '',
  ...props
}) {
  const hasHeader = Boolean(title || description || action);

  return (
    <div
      className={`card ${interactive ? 'card-interactive' : ''} ${className}`.trim()}
      {...props}
    >
      {hasHeader && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {description && <p className="card-description">{description}</p>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}

      <div className={padding ? 'card-body' : ''}>{children}</div>

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

