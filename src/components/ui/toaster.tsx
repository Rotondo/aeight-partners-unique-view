import * as React from "react"
import { Toast as RadixToast, ToastProps as RadixToastProps } from "@radix-ui/react-toast"
import { X } from "lucide-react"

export interface ToastProps extends RadixToastProps {
  title?: string
  description?: string
  error?: unknown
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ title = "Erro", description = "Não foi possível carregar dados.", error, ...props }, ref) => {
    // Se error for um objeto de Error ou tiver uma mensagem, mostra a mensagem real
    let errorMessage = description
    if (error) {
      if (typeof error === "string") {
        errorMessage = error
      } else if (typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string") {
        errorMessage = (error as any).message
      }
    }

    return (
      <RadixToast
        ref={ref}
        className="group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full destructive group border-destructive bg-destructive text-destructive-foreground"
        {...props}
      >
        <div className="grid gap-1">
          <div className="text-sm font-semibold">
            {title}
          </div>
          <div className="text-sm opacity-90">
            {errorMessage}
          </div>
        </div>
        <button
          type="button"
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
          toast-close=""
          data-radix-toast-announce-exclude=""
        >
          <X className="h-4 w-4" />
        </button>
      </RadixToast>
    )
  }
)
Toast.displayName = "Toast"
