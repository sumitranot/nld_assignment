import React from 'react';
import { getSkuGradient } from '../../lib/skuGradient';
import styles from './SkuGradient.module.css';

/**
 * Deterministic gradient and initials placeholder generated from product SKU.
 * High-performance, strictly image-free design.
 * @param sku - Unique product SKU code
 * @param name - Product name for fallback initials
 * @param size - 'sm' (44px) | 'md' (60px) | 'lg' (180px banner) | 'card' (4:3 aspect ratio)
 */
export interface SkuGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  sku: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'card';
  showSkuTag?: boolean;
}

export const SkuGradient: React.FC<SkuGradientProps> = ({
  sku,
  name,
  size = 'card',
  showSkuTag = true,
  className = '',
  style,
  ...props
}) => {
  const info = getSkuGradient(sku, name);

  return (
    <div
      aria-hidden="true"
      className={`${styles.container} ${styles[size]} ${className}`}
      style={{
        background: info.gradient,
        color: info.textColor,
        ...style,
      }}
      {...props}
    >
      <div className={styles.subtlePattern} />
      <span className={styles.initials}>{info.initials}</span>
      {showSkuTag && (size === 'lg' || size === 'card') && (
        <span className={styles.skuTag}>{sku}</span>
      )}
    </div>
  );
};

