import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  ariaLabel = 'Loading...',
  className = '',
}) => {
  const sizeClass = size === 'sm' ? 'spinner--sm' : size === 'lg' ? 'spinner--lg' : '';

  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`spinner ${sizeClass} ${className}`.trim()}
    >
      <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
        {ariaLabel}
      </span>
    </div>
  );
};

