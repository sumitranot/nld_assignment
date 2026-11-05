import React, { forwardRef } from 'react';
import styles from './Button.module.css';
import { Spinner } from './Spinner';

/**
 * Accessible Icon Button. Requires `ariaLabel` for screen-reader compliance.
 * @param icon - React element (e.g. from lucide-react)
 * @param ariaLabel - Descriptive label for assistive technologies
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  ariaLabel: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      ariaLabel,
      variant = 'ghost',
      size = 'md',
      loading = false,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const sizePadding =
      size === 'sm' ? { width: 32, height: 32, padding: 0 } :
      size === 'lg' ? { width: 48, height: 48, padding: 0 } :
      { width: 40, height: 40, padding: 0 };

    const classNames = [
      styles.button,
      styles[variant],
      styles[size],
      loading ? styles.loading : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-busy={loading}
        title={ariaLabel}
        style={sizePadding}
        className={classNames}
        {...props}
      >
        {loading ? (
          <span className={styles.loadingSpinner} aria-hidden="true">
            <Spinner size="sm" />
          </span>
        ) : (
          icon
        )}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';

