import React from 'react';

export function PageContainer({ children, maxWidth = '1440px', className = '', style = {} }) {
  return (
    <div
      className={`page-container ${className}`.trim()}
      style={{
        width: '100%',
        maxWidth,
        margin: '0 auto',
        padding: '28px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

