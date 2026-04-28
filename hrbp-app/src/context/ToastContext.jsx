import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const remove = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext).toast;
}

const typeStyles = {
  success: { bg: 'bg-success', icon: '✓' },
  error: { bg: 'bg-danger', icon: '✕' },
  warning: { bg: 'bg-warning', icon: '⚠' },
  info: { bg: 'bg-secondary', icon: 'ℹ' },
};

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none" style={{ maxWidth: '360px' }}>
      {toasts.map(t => {
        const style = typeStyles[t.type] || typeStyles.info;
        return (
          <div
            key={t.id}
            className="toast-enter pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl text-white card-shadow"
            style={{ background: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : t.type === 'warning' ? '#f59e0b' : '#006a67', backdropFilter: 'blur(8px)' }}
          >
            <span className="text-lg leading-none mt-0.5">{style.icon}</span>
            <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
            <button onClick={() => onRemove(t.id)} className="opacity-70 hover:opacity-100 text-xs leading-none">✕</button>
          </div>
        );
      })}
    </div>
  );
}
