import React from 'react';
import { Search, X } from 'lucide-react';

export function SearchInput({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  ...props
}) {
  return (
    <div className={`input-container ${className}`.trim()} style={{ maxWidth: '320px' }}>
      <div className="input-prefix-icon">
        <Search size={15} />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input-control input-has-prefix input-has-suffix"
        style={{ height: '36px', fontSize: 'var(--font-size-sm)' }}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="input-suffix-icon input-suffix-interactive btn-icon-sm"
          aria-label="Clear search"
          style={{ border: 'none', background: 'none' }}
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}

