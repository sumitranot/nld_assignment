import React from 'react';
import styles from './Badge.module.css';

/**
 * Visual badge pill supporting semantic status variants.
 * @param variant - 'neutral' | 'brand' | 'success' | 'warning' | 'danger'
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon,
  className = '',
  ...props
}) => {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`} {...props}>
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

