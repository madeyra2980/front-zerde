import React from 'react';
import './Badge.css';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  dot = false,
  removable = false,
  onRemove,
  className = '',
  style,
}) => {
  const baseClasses = 'badge';
  const variantClass = `badge--${variant}`;
  const sizeClass = `badge--${size}`;
  const shapeClass = `badge--${shape}`;
  const dotClass = dot ? 'badge--dot' : '';
  const removableClass = removable ? 'badge--removable' : '';

  const classes = [
    baseClasses,
    variantClass,
    sizeClass,
    shapeClass,
    dotClass,
    removableClass,
    className,
  ].filter(Boolean).join(' ');

  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <span className={classes} style={style}>
      {dot && <span className="badge__dot" />}
      {!dot && <span className="badge__content">{children}</span>}
      {removable && (
        <button
          type="button"
          className="badge__remove"
          onClick={handleRemove}
          aria-label="Remove badge"
        >
          <svg
            className="badge__remove-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </span>
  );
};

// Badge Group Component
export const BadgeGroup = ({ children, className = '', gap = 'sm' }) => {
  const gapClass = `badge-group--gap-${gap}`;
  const classes = ['badge-group', gapClass, className].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
};

// Status Badge Component
export const StatusBadge = ({ status, children, className = '', variant }) => {
  const statusMap = {
    active: 'success',
    inactive: 'default',
    pending: 'warning',
    completed: 'success',
    cancelled: 'error',
    error: 'error',
  };

  const badgeVariant = variant || statusMap[status] || 'default';
  const content = children || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Неизвестно');

  return (
    <Badge variant={badgeVariant} className={className}>
      {content}
    </Badge>
  );
};

// Notification Badge Component
export const NotificationBadge = ({ count, max = 99, children, className = '' }) => {
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <div className={`notification-badge ${className}`}>
      {children}
      {count > 0 && (
        <Badge variant="error" size="sm" shape="pill" className="notification-badge__badge">
          {displayCount}
        </Badge>
      )}
    </div>
  );
};
