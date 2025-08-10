
import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

// Safe React hooks check
const isReactReady = () => {
  try {
    return (
      typeof React !== 'undefined' &&
      React !== null &&
      typeof React.useState === 'function' &&
      typeof React.useEffect === 'function'
    );
  } catch {
    return false;
  }
};

// Fallback toast display without React hooks
const FallbackToastDisplay = () => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'none' // Hidden by default, only shows when needed
      }}
      id="fallback-toast-container"
    />
  );
};

export function Toaster() {
  // Early return if React is not ready
  if (!isReactReady()) {
    console.warn('[Toaster] React hooks not ready, returning fallback');
    return <FallbackToastDisplay />;
  }

  try {
    const { toasts } = useToast();

    // If no toasts, don't render ToastProvider at all
    if (!toasts || toasts.length === 0) {
      return null;
    }

    return (
      <ToastProvider>
        {toasts.map(function ({ id, title, description, error, action, ...props }) {
          return (
            <Toast key={id} error={error} {...props}>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {(error || description) && (
                  <ToastDescription>
                    {/* Exibe mensagem detalhada do erro se existir, senão a descrição padrão */}
                    {typeof error === "string"
                      ? error
                      : error && typeof error === "object" && "message" in error
                        ? (error as any).message
                        : description}
                  </ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </Toast>
          )
        })}
        <ToastViewport />
      </ToastProvider>
    )
  } catch (error) {
    console.error('[Toaster] Component error:', error);
    return <FallbackToastDisplay />;
  }
}
