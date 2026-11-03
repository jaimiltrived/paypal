import React from 'react';
import { TableSkeleton } from './SkeletonLoader';
import { EmptyState } from './EmptyState';

export function Table({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No transactions found',
  emptyDescription = 'Try adjusting your search query or filters to find what you are looking for.',
  onRowClick,
  keyField = 'id',
  className = '',
}) {
  if (loading) {
    return (
      <div className={`table-container ${className}`.trim()}>
        <TableSkeleton rows={5} columns={columns.length || 5} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`table-container ${className}`.trim()}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`.trim()}>
      <table className="table">
        <thead className="table-header">
          <tr>
            {columns.map((col, index) => {
              const alignClass =
                col.align === 'right'
                  ? 'table-th-right'
                  : col.align === 'center'
                  ? 'table-th-center'
                  : '';

              return (
                <th
                  key={col.key || col.id || index}
                  className={`table-th ${alignClass}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="table-body">
          {data.map((row, rowIndex) => (
            <tr
              key={row[keyField] || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              style={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map((col, colIndex) => {
                const alignClass =
                  col.align === 'right'
                    ? 'table-td-right'
                    : col.align === 'center'
                    ? 'table-td-center'
                    : '';

                return (
                  <td key={col.key || colIndex} className={`table-td ${alignClass}`}>
                    {col.render
                      ? col.render(row[col.key], row, rowIndex)
                      : row[col.key] ?? '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

