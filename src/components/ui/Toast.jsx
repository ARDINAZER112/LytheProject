import { useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

// ── Toast Item ──────────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />,
    error:   <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />,
    info:    <CheckCircle className="h-5 w-5 text-ocean-500 flex-shrink-0" />,
  };

  const bg = {
    success: 'bg-green-50  border-green-200',
    error:   'bg-red-50    border-red-200',
    info:    'bg-ocean-50  border-ocean-200',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-toast-in ${bg[toast.type] || bg.info}`}
    >
      {icons[toast.type] || icons.info}
      <span className="text-sm font-medium text-ocean-900 flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-ocean-400 hover:text-ocean-700">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Toast Container ─────────────────────────────────────────
export function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

// ── useToast hook ───────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
