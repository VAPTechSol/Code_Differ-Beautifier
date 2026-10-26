import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none select-none max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const duration = toast.duration ?? 2600;

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const icons = {
    success: <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />,
    info: <Info size={16} className="text-[#ff6b00] shrink-0 mt-0.5" />,
    warning: <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
  };

  const borderColors = {
    success: 'border-green-500/30',
    info: 'border-[#ff6b00]/30',
    warning: 'border-amber-500/30'
  };

  return (
    <div 
      className={`pointer-events-auto card p-3 px-4 bg-white dark:bg-zinc-900 border-2 ${borderColors[toast.type || 'info']} shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ff6b00] rounded-xl flex items-start gap-3 relative overflow-hidden animate-slide-up group`}
    >
      {icons[toast.type || 'info']}

      <div className="flex-1 min-w-0 font-mono text-xs">
        <h4 className="font-extrabold text-zinc-900 dark:text-white leading-tight">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-normal">
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-0.5 rounded transition-colors"
      >
        <X size={13} />
      </button>

      {/* Shrinking progress line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff6b00]" 
        style={{
          animation: `toast-progress ${duration}ms linear forwards`
        }}
      />
    </div>
  );
}
