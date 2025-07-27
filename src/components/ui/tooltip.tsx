
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

// Simple non-hook based initialization check
let isReactReady = false;
let initTimeout: NodeJS.Timeout;

// Check React readiness without using hooks
const checkReactInitialization = () => {
  if (typeof window !== 'undefined' && window.React && typeof window.React.useState === 'function') {
    isReactReady = true;
  } else {
    // Keep checking every 10ms until React is ready
    initTimeout = setTimeout(checkReactInitialization, 10);
  }
};

// Start checking immediately
checkReactInitialization();

// Safe wrapper that doesn't use hooks during initialization
const SafeTooltipProvider: React.FC<React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>> = ({ children, ...props }) => {
  // If React isn't ready, just render children without provider
  if (!isReactReady) {
    return React.createElement(React.Fragment, null, children);
  }

  try {
    return React.createElement(TooltipPrimitive.Provider, { ...props, children });
  } catch (error) {
    console.error('[SafeTooltipProvider] Error:', error);
    return React.createElement(React.Fragment, null, children);
  }
};

SafeTooltipProvider.displayName = "SafeTooltipProvider";

const TooltipProvider = SafeTooltipProvider;

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
