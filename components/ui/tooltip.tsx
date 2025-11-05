"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

const tooltipVariants = cva(
  "bg-border/40 backdrop-blur font-medium mb-2 animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-lg border px-2.5 py-0.5 text-xs select-none max-w-xs",
  {
    variants: {
      variant: {
        default: "bg-border text-foreground",
        success: "bg-green-600 text-white border-green-700",
        warning: "bg-yellow-500 text-black border-yellow-600",
        error: "bg-red-600 text-white border-red-700",
        info: "bg-blue-600 text-white border-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TooltipContent({
  className,
  sideOffset = 0,
  variant,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  variant?: "default" | "success" | "warning" | "error" | "info"
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(tooltipVariants({ variant }), className)}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
