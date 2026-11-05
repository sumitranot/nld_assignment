import React, { forwardRef } from 'react';
import styles from './Input.module.css';

/**
 * Accessible Checkbox component with custom styling and accessible label.
 */
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `chk-${Math.random().toString(36).substring(2, 9)}` : undefined);

    if (!label) {
      return (
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={`${styles.checkboxInput} ${className}`}
          {...props}
        />
      );
    }

    return (
      <label htmlFor={inputId} className={`${styles.checkboxContainer} ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={styles.checkboxInput}
          {...props}
        />
        <span>{label}</span>
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';

