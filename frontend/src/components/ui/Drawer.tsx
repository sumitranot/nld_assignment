import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import styles from './Drawer.module.css';

/**
 * Accessible Slide-out Drawer supporting left and right placements.
 * @param isOpen - Controls drawer visibility
 * @param onClose - Callback invoked on ESC key or backdrop click
 * @param position - 'right' (default) or 'left'
 * @param title - Drawer title
 * @param footer - Optional footer action elements
 */
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  position?: 'left' | 'right';
  maxWidth?: number | string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  position = 'right',
  maxWidth = 440,
  children,
  footer,
}) => {
  const titleId = useId();
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background body scroll
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`${styles.backdrop} ${styles[position]}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.drawer}
        style={{ maxWidth }}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <IconButton
            icon={<X size={18} />}
            ariaLabel="Close drawer"
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </aside>
    </div>,
    document.body,
  );
};
