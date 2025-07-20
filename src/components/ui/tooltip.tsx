
import React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

// Enhanced React validation specifically for tooltip
const validateReactForTooltip = () => {
  if (!React || !React.useState || !React.useEffect || !React.useRef) {
    console.error('[Tooltip] React hooks not available:', {
      React: !!React,
      useState: !!React?.useState,
      useEffect: !!React?.useEffect,
      useRef: !!React?.useRef
    });
    return false;
  }
  return true;
};

// Safe TooltipProvider wrapper
const TooltipProvider: React.FC<React.ComponentProps<typeof TooltipPrimitive.Provider>> = (props) => {
  // Validate React before using hooks
  if (!validateReactForTooltip()) {
    console.warn('[TooltipProvider] React not ready, rendering fallback');
    return <div style={{ display: 'contents' }}>{props.children}</div>;
  }
  
  return <TooltipPrimitive.Provider {...props} />;
};

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
