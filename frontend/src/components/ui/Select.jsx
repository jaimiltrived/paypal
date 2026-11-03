import React, { forwardRef } from 'react';

export const Select = forwardRef(function Select(
  {
    label,
    id,
    options = [],
    error,
    helperText,
    required = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          <span>
            {label}
            {required && <span className="form-label-required" aria-hidden="true">*</span>}
          </span>
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        required={required}
        aria-invalid={Boolean(error)}
        className={`input-control ${error ? 'input-invalid' : ''}`.trim()}
        {...props}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>

      {error ? (
        <div className="input-error-msg" role="alert">
          {error}
        </div>
      ) : helperText ? (
        <div className="input-helper-msg">{helperText}</div>
      ) : null}
    </div>
  );
});

