import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Input.module.css';

/**
 * Accessible Select component with custom chevron and error state styling.
 */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error = false, className = '', children, ...props }, ref) => {
    const selectClasses = [styles.input, styles.select, error ? styles.hasError : '', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.inputWrapper}>
        <select ref={ref} className={selectClasses} aria-invalid={error} {...props}>
          {children}
        </select>
        <span className={styles.selectChevron} aria-hidden="true">
          <ChevronDown size={16} />
        </span>
      </div>
    );
  },
);

Select.displayName = 'Select';

