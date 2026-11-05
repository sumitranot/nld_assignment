import React from 'react';
import { formatPrice } from '../../lib/formatters';

export interface PriceTagProps {
  price: string | number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  unit?: string;
  className?: string;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  size = 'md',
  unit,
  className = '',
}) => {
  const fontSizes = {
    sm: 'var(--font-sm)',
    md: 'var(--font-base)',
    lg: 'var(--font-xl)',
    xl: 'var(--font-2xl)',
  };

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '2px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        fontSize: fontSizes[size],
        letterSpacing: '-0.02em',
      }}
    >
      <span>{formatPrice(price)}</span>
      {unit && (
        <span
          style={{
            fontSize: 'var(--font-xs)',
            fontWeight: 400,
            color: 'var(--text-muted)',
            marginLeft: '2px',
          }}
        >
          {unit}
        </span>
      )}
    </span>
  );
};

