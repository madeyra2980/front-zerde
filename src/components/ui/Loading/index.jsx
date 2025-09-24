import React from 'react';
import './Loading.css';

export const Loading = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  overlay = false,
  className = '',
  style,
}) => {
  const baseClasses = 'loading';
  const sizeClass = `loading--${size}`;
  const variantClass = `loading--${variant}`;
  const colorClass = `loading--${color}`;
  const overlayClass = overlay ? 'loading--overlay' : '';

  const classes = [
    baseClasses,
    sizeClass,
    variantClass,
    colorClass,
    overlayClass,
    className,
  ].filter(Boolean).join(' ');

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className="loading__spinner">
            <div className="loading__spinner-circle" />
          </div>
        );
      
      case 'dots':
        return (
          <div className="loading__dots">
            <div className="loading__dot" />
            <div className="loading__dot" />
            <div className="loading__dot" />
          </div>
        );
      
      case 'pulse':
        return (
          <div className="loading__pulse">
            <div className="loading__pulse-circle" />
          </div>
        );
      
      case 'bars':
        return (
          <div className="loading__bars">
            <div className="loading__bar" />
            <div className="loading__bar" />
            <div className="loading__bar" />
            <div className="loading__bar" />
          </div>
        );
      
      case 'ring':
        return (
          <div className="loading__ring">
            <div className="loading__ring-circle" />
          </div>
        );
      
      case 'skeleton':
        return (
          <div className="loading__skeleton">
            <div className="loading__skeleton-line" />
            <div className="loading__skeleton-line loading__skeleton-line--short" />
            <div className="loading__skeleton-line loading__skeleton-line--medium" />
          </div>
        );
      
      default:
        return null;
    }
  };

  const content = (
    <div className={classes} style={style}>
      {renderSpinner()}
      {text && <span className="loading__text">{text}</span>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton Loading Component
export const Skeleton = ({ 
  width = '100%', 
  height = '1rem', 
  className = '', 
  lines = 1,
  variant = 'rectangular'
}) => {
  const baseClasses = 'skeleton';
  const variantClass = `skeleton--${variant}`;
  const classes = [baseClasses, variantClass, className].filter(Boolean).join(' ');

  if (lines > 1) {
    return (
      <div className="skeleton-container">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={classes}
            style={{
              width: index === lines - 1 ? '60%' : width,
              height,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={classes}
      style={{ width, height }}
    />
  );
};

// Page Loading Component
export const PageLoading = ({ text = 'Загрузка...', className = '' }) => (
  <div className={`page-loading ${className}`}>
    <Loading size="lg" variant="spinner" text={text} />
  </div>
);

// Button Loading Component
export const ButtonLoading = ({ size = 'sm', className = '' }) => (
  <Loading 
    size={size} 
    variant="spinner" 
    color="white" 
    className={`button-loading ${className}`} 
  />
);
