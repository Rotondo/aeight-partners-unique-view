
import React from 'react';

// Simple toast interface that matches the expected API
interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

// Global toast state management
let toastCounter = 0;
const toastListeners: Array<(toasts: any[]) => void> = [];
let currentToasts: any[] = [];

function notifyListeners() {
  toastListeners.forEach(listener => listener(currentToasts));
}

function addToast(options: ToastOptions) {
  const id = `toast-${++toastCounter}`;
  const toast = {
    id,
    ...options,
    open: true,
  };
  
  currentToasts = [...currentToasts, toast];
  notifyListeners();
  
  // Auto remove after duration
  setTimeout(() => {
    currentToasts = currentToasts.filter(t => t.id !== id);
    notifyListeners();
  }, options.duration || 4000);
  
  return {
    id,
    dismiss: () => {
      currentToasts = currentToasts.filter(t => t.id !== id);
      notifyListeners();
    },
    update: (newOptions: Partial<ToastOptions>) => {
      currentToasts = currentToasts.map(t => 
        t.id === id ? { ...t, ...newOptions } : t
      );
      notifyListeners();
    }
  };
}

// Compatible toast function
export function toast(options: ToastOptions | string) {
  if (typeof options === 'string') {
    return addToast({ description: options });
  }
  return addToast(options);
}

// Compatible useToast hook
export function useToast() {
  const [toasts, setToasts] = React.useState(currentToasts);
  
  React.useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      const index = toastListeners.indexOf(setToasts);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);
  
  return {
    toast,
    toasts,
    dismiss: (toastId?: string) => {
      if (toastId) {
        currentToasts = currentToasts.filter(t => t.id !== toastId);
      } else {
        currentToasts = [];
      }
      notifyListeners();
    }
  };
}
