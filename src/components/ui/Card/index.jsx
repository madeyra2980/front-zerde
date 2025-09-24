import React from 'react';
import './Card.css';

export const Card = ({
  children,
  variant = 'default',
  size = 'md',
  hover = false,
  clickable = false,
  onClick,
  className = '',
  style,
}) => {
  const baseClasses = 'card';
  const variantClass = `card--${variant}`;
  const sizeClass = `card--${size}`;
  const hoverClass = hover ? 'card--hover' : '';
  const clickableClass = clickable ? 'card--clickable' : '';

  const classes = [
    baseClasses,
    variantClass,
    sizeClass,
    hoverClass,
    clickableClass,
    className,
  ].filter(Boolean).join(' ');

  const Component = clickable ? 'button' : 'div';
  const props = clickable ? { onClick, type: 'button' } : {};

  return (
    <Component
      className={classes}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};

// Card Header Component
export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

// Card Title Component
export const CardTitle = ({ children, className = '', as: Component = 'h3' }) => (
  <Component className={`card-title ${className}`}>
    {children}
  </Component>
);

// Card Subtitle Component
export const CardSubtitle = ({ children, className = '' }) => (
  <div className={`card-subtitle ${className}`}>
    {children}
  </div>
);

// Card Body Component
export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>
    {children}
  </div>
);

// Card Footer Component
export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>
    {children}
  </div>
);

// Card Image Component
export const CardImage = ({ src, alt, className = '', objectFit = 'cover' }) => (
  <div className={`card-image ${className}`} style={{ objectFit }}>
    <img src={src} alt={alt} />
  </div>
);

// Card Actions Component
export const CardActions = ({ children, className = '', align = 'right' }) => (
  <div className={`card-actions card-actions--${align} ${className}`}>
    {children}
  </div>
);
