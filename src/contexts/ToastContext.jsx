import { createContext, useContext, useState, useCallback, useId } from 'react';
import { CheckIcon, CloseIcon } from '../components/icons';
import './Toast.css';

const ToastContext = createContext({ showToast: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 2400) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item toast-${t.type} animate-fade-in`} role="status">
            <span className="toast-icon" aria-hidden="true">
              {t.type === 'success' ? <CheckIcon size={16} /> : 'ℹ️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button
              className="toast-close btn btn-ghost"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
