
import * as React from "react"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// Safe React hooks checker
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

// Fallback component when React is not ready
const FallbackSonnerDisplay = () => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'none'
      }}
      id="fallback-sonner-container"
    />
  );
};

const Toaster = ({ ...props }: ToasterProps) => {
  try {
    if (!React || typeof React.useState !== 'function' || !isReactReady()) {
      console.warn('[Sonner Toaster] React is not properly initialized, using fallback');
      return <FallbackSonnerDisplay />;
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
    return <FallbackSonnerDisplay />;
  }
}

export { Toaster, toast }
