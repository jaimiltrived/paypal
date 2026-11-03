import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data to display based on your selected filters.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`state-container ${className}`.trim()}>
      <div className="state-icon-wrapper state-icon-empty">
        <Icon size={26} strokeWidth={1.8} />
      </div>
      <h4 className="state-title">{title}</h4>
      <p className="state-description">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

