import React, { forwardRef } from 'react';
import styles from './Input.module.css';

/**
 * Accessible Textarea with auto-resize support and error state styling.
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, className = '', ...props }, ref) => {
    const textareaClasses = [
      styles.input,
      styles.textarea,
      error ? styles.hasError : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return <textarea ref={ref} className={textareaClasses} aria-invalid={error} {...props} />;
  },
);

Textarea.displayName = 'Textarea';
