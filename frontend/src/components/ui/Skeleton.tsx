import React from 'react';
import styles from './Skeleton.module.css';

/**
 * Shimmer skeleton placeholder preventing Cumulative Layout Shift (CLS).
 * @param variant - 'text' | 'title' | 'circle' | 'rect' | 'card'
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'title' | 'circle' | 'rect' | 'card';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};

