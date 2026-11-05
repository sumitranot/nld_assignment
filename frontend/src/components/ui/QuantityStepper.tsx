import React from 'react';
import { Minus, Plus } from 'lucide-react';
import styles from './QuantityStepper.module.css';

export interface QuantityStepperProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 9999,
  disabled = false,
  className = '',
  ariaLabel = 'Quantity',
}) => {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <div className={`${styles.stepper} ${className}`}>
      <button
        type="button"
        disabled={!canDecrease}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label={`Decrease ${ariaLabel}`}
        className={styles.button}
      >
        <Minus size={14} />
      </button>

      <span className={styles.value} aria-live="polite">
        {value}
      </span>

      <button
        type="button"
        disabled={!canIncrease}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label={`Increase ${ariaLabel}`}
        className={styles.button}
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
