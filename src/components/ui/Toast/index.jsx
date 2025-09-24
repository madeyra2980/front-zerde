import React, { useEffect, useState } from 'react';
import './Toast.css';

export const Toast = ({
  id = Math.random().toString(36).substr(2, 9),
  title,
  message,
  type = 'info',
  duration = 5000,
  position = 'top-right',
  showCloseButton = true,
  showIcon = true,
  onClose,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show toast with animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto close toast
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  };

  const getIcon = () => {
    if (!showIcon) return null;

    const iconProps = {
      className: 'toast__icon',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
    };

    switch (type) {
      case 'success':
        return (
          <svg {...iconProps}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        );
      case 'error':
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'warning':
        return (
          <svg {...iconProps}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  const baseClasses = 'toast';
  const typeClass = `toast--${type}`;
  const positionClass = `toast--${position}`;
  const visibleClass = isVisible ? 'toast--visible' : '';
  const exitingClass = isExiting ? 'toast--exiting' : '';

  const classes = [
    baseClasses,
    typeClass,
    positionClass,
    visibleClass,
    exitingClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role="alert" aria-live="polite">
      <div className="toast__content">
        {showIcon && (
          <div className="toast__icon-container">
            {getIcon()}
          </div>
        )}
        
        <div className="toast__body">
          {title && (
            <div className="toast__title">
              {title}
            </div>
          )}
          <div className="toast__message">
            {message}
          </div>
        </div>
        
        {showCloseButton && (
          <button
            type="button"
            className="toast__close"
            onClick={handleClose}
            aria-label="Close notification"
          >
            <svg
              className="toast__close-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="toast__progress">
        <div className="toast__progress-bar" />
      </div>
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ children, position = 'top-right', className = '' }) => {
  const positionClass = `toast-container--${position}`;
  const classes = ['toast-container', positionClass, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  const success = (message, options = {}) => {
    addToast({ ...options, message, type: 'success' });
  };

  const error = (message, options = {}) => {
    addToast({ ...options, message, type: 'error' });
  };

  const warning = (message, options = {}) => {
    addToast({ ...options, message, type: 'warning' });
  };

  const info = (message, options = {}) => {
    addToast({ ...options, message, type: 'info' });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };
};
