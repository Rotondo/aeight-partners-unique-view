
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

export function Toaster() {
  // Add comprehensive error boundary protection for React initialization issues
  try {
    // Check if React and useState are properly initialized
    if (!React || typeof React.useState !== 'function') {
      console.error('[Toaster] React hooks are not properly initialized')
      return null
    }

    const { toasts } = useToast()

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
    console.error('[Toaster] Component error:', error)
    // Return null instead of a visible error to prevent cascading failures
    return null
  }
}
