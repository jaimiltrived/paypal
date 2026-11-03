import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    id,
    type = 'text',
    error,
    helperText,
    required = false,
    prefixIcon: PrefixIcon,
    suffixIcon: SuffixIcon,
    onSuffixClick,
    className = '',
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = inputId ? `${inputId}-error` : undefined;
  const helperId = inputId ? `${inputId}-helper` : undefined;

  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          <span>
            {label}
            {required && <span className="form-label-required" aria-hidden="true">*</span>}
          </span>
        </label>
      )}

      <div className="input-container">
        {PrefixIcon && (
          <div className="input-prefix-icon">
            <PrefixIcon size={16} />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`input-control ${PrefixIcon ? 'input-has-prefix' : ''} ${
            SuffixIcon ? 'input-has-suffix' : ''
          } ${error ? 'input-invalid' : ''}`.trim()}
          {...props}
        />

        {SuffixIcon && (
          <div
            className={`input-suffix-icon ${onSuffixClick ? 'input-suffix-interactive' : ''}`}
            onClick={onSuffixClick}
            role={onSuffixClick ? 'button' : undefined}
            tabIndex={onSuffixClick ? 0 : undefined}
          >
            <SuffixIcon size={16} />
          </div>
        )}
      </div>

      {error ? (
        <div id={errorId} className="input-error-msg" role="alert">
          {error}
        </div>
      ) : helperText ? (
        <div id={helperId} className="input-helper-msg">
          {helperText}
        </div>
      ) : null}
    </div>
  );
});

