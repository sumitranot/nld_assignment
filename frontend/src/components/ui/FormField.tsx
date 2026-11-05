import React from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './Input.module.css';

/**
 * Accessible FormField wrapper that links labels, inputs, error messages, and help text.
 * @param label - Visible form label
 * @param error - Error string (triggers aria-invalid and aria-describedby)
 * @param helpText - Subtitle or instruction for user
 * @param required - Shows a red required asterisk
 * @param htmlFor - Target input ID
 */
export interface FormFieldProps {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helpText,
  required = false,
  htmlFor,
  children,
  className = '',
}) => {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const helpId = htmlFor ? `${htmlFor}-help` : undefined;

  return (
    <div className={`${styles.formField} ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      {children}

      {helpText && !error && (
        <div id={helpId} className={styles.helpText}>
          {helpText}
        </div>
      )}

      {error && (
        <div id={errorId} role="alert" className={styles.errorText}>
          <AlertCircle size={14} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
