import React from 'react';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '' }) => {
  if (!content) return <>{children}</>;

  return (
    <div className={`${styles.container} ${className}`}>
      {children}
      <div role="tooltip" className={styles.tooltip}>
        {content}
      </div>
    </div>
  );
};

