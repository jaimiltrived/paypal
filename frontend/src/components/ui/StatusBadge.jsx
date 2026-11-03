import React from 'react';
import { Badge } from './Badge';

export function StatusBadge({ status, className = '' }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  let variant = 'neutral';
  let label = status;

  switch (normalized) {
    case 'COMPLETED':
    case 'SUCCESSFUL':
      variant = 'success';
      label = 'Successful';
      break;

    case 'PAID':
      variant = 'success';
      label = 'Paid';
      break;

    case 'RESOLVED':
      variant = 'success';
      label = 'Resolved';
      break;

    case 'ACTIVE':
      variant = 'success';
      label = 'Active';
      break;

    case 'PENDING':
      variant = 'warning';
      label = 'Pending';
      break;

    case 'UNDER_REVIEW':
      variant = 'warning';
      label = 'Under Review';
      break;

    case 'WAITING_FOR_SELLER_RESPONSE':
      variant = 'warning';
      label = 'Response Needed';
      break;

    case 'INVESTIGATING':
      variant = 'warning';
      label = 'Investigating';
      break;

    case 'PROCESSING':
      variant = 'info';
      label = 'Processing';
      break;

    case 'FAILED':
      variant = 'danger';
      label = 'Failed';
      break;

    case 'DECLINED':
      variant = 'danger';
      label = 'Declined';
      break;

    case 'REJECTED':
      variant = 'danger';
      label = 'Rejected';
      break;

    case 'OVERDUE':
      variant = 'danger';
      label = 'Overdue';
      break;

    case 'CRITICAL':
      variant = 'danger';
      label = 'Critical';
      break;

    case 'CREATED':
      variant = 'info';
      label = 'Created';
      break;

    case 'APPROVED':
      variant = 'info';
      label = 'Approved';
      break;

    case 'NEW':
      variant = 'info';
      label = 'New';
      break;

    case 'CANCELLED':
      variant = 'neutral';
      label = 'Cancelled';
      break;

    default:
      variant = 'neutral';
      label = status[0].toUpperCase() + status.slice(1).toLowerCase();
      break;
  }

  return (
    <Badge variant={variant} showDot pill className={className}>
      {label}
    </Badge>
  );
}
