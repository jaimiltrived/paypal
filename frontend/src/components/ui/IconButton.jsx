import React from 'react';

export function IconButton({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-icon-sm' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`btn btn-icon ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      <Icon size={size === 'sm' ? 15 : 18} />
    </button>
  );
}

