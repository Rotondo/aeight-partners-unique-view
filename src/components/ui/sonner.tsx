

import * as React from "react"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  try {
    if (!React || typeof React.useState !== 'function') {
      console.error('[Sonner Toaster] React is not properly initialized')
      return <div style={{ display: 'none' }} />
    }

    // Simplified version without theme dependency to avoid useContext issues
    return (
      <Sonner
        theme="light"
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
        {...props}
      />
    )
  } catch (error) {
    console.error('[Sonner Toaster] Component error:', error)
    return <div style={{ display: 'none' }} />
  }
}

export { Toaster, toast }

