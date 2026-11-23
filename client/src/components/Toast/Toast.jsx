// Short confirmations such as "Reading saved." announced politely to screen readers.
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircleIcon } from '@phosphor-icons/react';
import styles from './Toast.module.css';

const ToastContext = createContext(null);
const VISIBLE_MS = 4000;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((message) => {
    clearTimeout(timer.current);
    setToast({ message, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), VISIBLE_MS);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.region} aria-live="polite" role="status">
        {toast && (
          <p key={toast.id} className={styles.toast}>
            <CheckCircleIcon size={20} weight="fill" aria-hidden="true" className={styles.icon} />
            {toast.message}
          </p>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
