import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the service. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`state-container ${className}`.trim()}>
      <div className="state-icon-wrapper state-icon-error">
        <AlertTriangle size={26} strokeWidth={1.8} />
      </div>
      <h4 className="state-title">{title}</h4>
      <p className="state-description">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Retry Request
        </Button>
      )}
    </div>
  );
}

