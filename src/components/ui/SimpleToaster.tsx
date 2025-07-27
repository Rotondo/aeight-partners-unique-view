
import React from 'react';
import { useToast } from '@/hooks/use-toast';

const SimpleToaster: React.FC = () => {
  const { toasts } = useToast();

  const getToastStyles = (variant?: string) => {
    const baseStyles = "fixed bg-white border rounded-lg shadow-lg p-4 max-w-sm z-50 animate-in slide-in-from-top-2 transition-all";
    
    switch (variant) {
      case 'destructive':
        return `${baseStyles} border-red-200 bg-red-50 text-red-800`;
      default:
        return `${baseStyles} border-gray-200 bg-white text-gray-900`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={getToastStyles(toast.variant)}
          style={{ 
            top: `${16 + index * 80}px`,
            pointerEvents: 'auto'
          }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {toast.title && (
                <div className="font-semibold mb-1">{toast.title}</div>
              )}
              {toast.description && (
                <div className="text-sm">{toast.description}</div>
              )}
            </div>
            <button
              onClick={() => toast.dismiss?.()}
              className="ml-2 text-sm opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SimpleToaster;
