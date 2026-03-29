'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Clock, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'pending' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    href: string;
    target?: string;
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

export function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-0 right-0 z-[9999] pointer-events-none p-4 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const bgColor = {
    success: 'bg-emerald-950/90 border-emerald-500/40',
    error: 'bg-red-950/90 border-red-500/40',
    pending: 'bg-blue-950/90 border-blue-500/40',
    info: 'bg-violet-950/90 border-violet-500/40',
  }[toast.type];

  const textColor = {
    success: 'text-emerald-200',
    error: 'text-red-200',
    pending: 'text-blue-200',
    info: 'text-violet-200',
  }[toast.type];

  const iconColor = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    pending: 'text-blue-400',
    info: 'text-violet-400',
  }[toast.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    pending: Clock,
    info: AlertCircle,
  }[toast.type];

  return (
    <div
      className={`
        pointer-events-auto rounded-lg border backdrop-blur-sm p-4 
        flex items-start gap-3 transition-all duration-300
        ${bgColor} ${isExiting ? 'opacity-0 translate-x-96' : 'opacity-100 translate-x-0'}
      `}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${textColor}`}>{toast.title}</p>
        {toast.message && <p className="text-[13px] text-forge-muted mt-0.5">{toast.message}</p>}
        {toast.action && (
          <a
            href={toast.action.href}
            target={toast.action.target || '_blank'}
            rel="noopener noreferrer"
            className="text-[12px] font-medium mt-2 inline-block hover:underline"
            style={{ color: 'inherit' }}
          >
            {toast.action.label}
          </a>
        )}
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 text-forge-muted hover:text-white transition-colors ml-2 mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
