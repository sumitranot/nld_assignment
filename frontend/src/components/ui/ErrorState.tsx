import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import styles from './EmptyState.module.css';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this data. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div role="alert" className={`${styles.container} ${className}`}>
      <div className={styles.iconWrapper} style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' }}>
        <AlertTriangle size={32} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{message}</p>
      {onRetry && (
        <Button variant="secondary" leftIcon={<RotateCcw size={16} />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

