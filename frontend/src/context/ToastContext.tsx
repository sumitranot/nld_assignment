import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from '../components/ui/Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  action?: ToastAction;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string, title?: string, duration?: number, action?: ToastAction) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string, action?: ToastAction) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000, action?: ToastAction) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, message, title, duration, action };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, title?: string, action?: ToastAction) =>
      addToast('success', message, title ?? 'Success', 4000, action),
    [addToast],
  );

  const error = useCallback(
    (message: string, title?: string) => addToast('error', message, title ?? 'Error', 6000),
    [addToast],
  );

  const warning = useCallback(
    (message: string, title?: string) => addToast('warning', message, title ?? 'Warning', 5000),
    [addToast],
  );

  const info = useCallback(
    (message: string, title?: string) => addToast('info', message, title ?? 'Notice', 4000),
    [addToast],
  );

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      success,
      error,
      warning,
      info,
    }),
    [toasts, addToast, removeToast, success, error, warning, info],
  );

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: 2 }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />;
      case 'info':
        return <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />;
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.container} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`${styles.toast} ${styles[toast.type]}`}
          >
            {getIcon(toast.type)}
            <div className={styles.content}>
              {toast.title && <div className={styles.title}>{toast.title}</div>}
              <div className={styles.message}>{toast.message}</div>
              {toast.action && (
                <button
                  type="button"
                  className={styles.undoButton}
                  onClick={() => {
                    toast.action?.onClick();
                    removeToast(toast.id);
                  }}
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Dismiss notification"
              onClick={() => removeToast(toast.id)}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
