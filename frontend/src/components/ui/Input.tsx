import React, { forwardRef } from 'react';
import styles from './Input.module.css';

/**
 * Text input with support for error states, left/right icons, and accessibility.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, leftIcon, rightIcon, className = '', ...props }, ref) => {
    const inputClasses = [
      styles.input,
      error ? styles.hasError : '',
      leftIcon ? styles.hasLeftIcon : '',
      rightIcon ? styles.hasRightIcon : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.inputWrapper}>
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
        <input ref={ref} className={inputClasses} aria-invalid={error} {...props} />
        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
