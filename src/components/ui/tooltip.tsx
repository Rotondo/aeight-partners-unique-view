
import * as React from "react"
import { cn } from "@/lib/utils"

// Simple tooltip implementation without external dependencies
// This avoids React initialization issues with Radix UI

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextType | null>(null);

const TooltipProvider: React.FC<{ children: React.ReactNode; delayDuration?: number }> = ({ 
  children, 
  delayDuration = 700 
}) => {
  // Simple implementation that just renders children
  // Tooltips will work but without the advanced Radix features
  return <>{children}</>;
};

const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  
  const contextValue = React.useMemo(() => ({ open, setOpen }), [open]);
  
  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  );
};

const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ children, asChild, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, ref) => {
  const context = React.useContext(TooltipContext);
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    context?.setOpen(true);
    onMouseEnter?.(e);
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    context?.setOpen(false);
    onMouseLeave?.(e);
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    context?.setOpen(true);
    onFocus?.(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    context?.setOpen(false);
    onBlur?.(e);
  };
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
    });
  }
  
  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </div>
  );
});

TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    sideOffset?: number;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
  }
>(({ className, sideOffset = 4, side = 'top', align = 'center', children, ...props }, ref) => {
  const context = React.useContext(TooltipContext);
  
  if (!context?.open) {
    return null;
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        "pointer-events-none select-none",
        className
      )}
      style={{
        top: side === 'bottom' ? `${sideOffset}px` : undefined,
        bottom: side === 'top' ? `${sideOffset}px` : undefined,
        left: side === 'right' ? `${sideOffset}px` : undefined,
        right: side === 'left' ? `${sideOffset}px` : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
});

TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
