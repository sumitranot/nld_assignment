import React from 'react';
import styles from './Spinner.module.css';

/**
 * Props for accessible Spinner component.
 * @param size - 'sm' (14px), 'md' (20px), or 'lg' (32px)
 * @param ariaLabel - Accessible text announced to screen readers
 */
export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  ariaLabel = 'Loading...',
  className = '',
  ...props
}) => {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`${styles.spinner} ${styles[size]} ${className}`}
      {...props}
    >
      <span className="sr-only">{ariaLabel}</span>
    </span>
  );
};

