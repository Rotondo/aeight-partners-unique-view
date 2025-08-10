
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

// Safe component wrapper that ensures React is ready
const SafeToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Only render if React is properly initialized
  if (!isReactReady()) {
    console.warn('[SafeToastProvider] React hooks not ready, skipping toast provider');
    return <>{children}</>;
  }

  try {
    return <ToastProvider>{children}</ToastProvider>;
  } catch (error) {
    console.error('[SafeToastProvider] ToastProvider failed:', error);
    return <>{children}</>;
  }
};

export function Toaster() {
  // Early return if React is not ready
  if (!isReactReady()) {
    console.warn('[Toaster] React hooks not ready, returning null');
    return null;
  }

  try {
    const { toasts } = useToast();

    return (
      <SafeToastProvider>
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
      </SafeToastProvider>
    )
  } catch (error) {
    console.error('[Toaster] Component error:', error);
    return null;
  }
}
