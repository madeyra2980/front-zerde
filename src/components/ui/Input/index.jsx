import React, { useState, forwardRef, useCallback, memo } from 'react';
import './Input.css';

export const Input = memo(forwardRef(({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  required = false,
  error,
  success,
  label,
  helperText,
  size = 'md',
  variant = 'default',
  icon,
  iconPosition = 'left',
  className = '',
  name,
  id,
  autoComplete,
  maxLength,
  minLength,
  pattern,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const baseClasses = 'input';
  const sizeClass = `input--${size}`;
  const variantClass = `input--${variant}`;
  const errorClass = error ? 'input--error' : '';
  const successClass = success ? 'input--success' : '';
  const disabledClass = disabled ? 'input--disabled' : '';
  const focusedClass = isFocused ? 'input--focused' : '';
  const iconClass = icon ? `input--with-icon input--icon-${iconPosition}` : '';

  const inputClasses = [
    baseClasses,
    sizeClass,
    variantClass,
    errorClass,
    successClass,
    disabledClass,
    focusedClass,
    iconClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      
      <div className="input-container">
        {icon && iconPosition === 'left' && (
          <div className="input-icon input-icon--left">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={inputClasses}
        />
        
        {type === 'password' && (
          <button
            type="button"
            className="input-password-toggle"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="input-password-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg className="input-password-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
        
        {icon && iconPosition === 'right' && (
          <div className="input-icon input-icon--right">
            {icon}
          </div>
        )}
        
        {error && (
          <div className="input-error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
        )}
        
        {success && (
          <div className="input-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
        )}
      </div>
      
      {(error || success || helperText) && (
        <div className="input-message">
          {error && <span className="input-error-text">{error}</span>}
          {success && <span className="input-success-text">{success}</span>}
          {!error && !success && helperText && (
            <span className="input-helper-text">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
}));

Input.displayName = 'Input';
