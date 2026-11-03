import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  return (
    <div
      className={`pagination-container ${className}`.trim()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-secondary)',
      }}
    >
      <div>
        Showing <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{startItem}</span> to{' '}
        <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{endItem}</span> of{' '}
        <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{totalItems}</span> results
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={ChevronLeft}
          aria-label="Previous page"
        >
          Previous
        </Button>

        <span style={{ padding: '0 8px', fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          icon={ChevronRight}
          iconPosition="right"
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

