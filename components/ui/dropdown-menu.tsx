"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle, X } from "lucide-react"

import { cn } from "@/lib/utils"

// --- Hover Tracker Logic & Context ---

interface HoverTrackerContextType {
  onHover: (element: HTMLElement) => void
  onLeave: () => void
}

const HoverTrackerContext = React.createContext<HoverTrackerContextType | null>(null)

function useHoverTracker() {
  const [hoverStyle, setHoverStyle] = React.useState({ top: 0, left: 0, height: 0, width: 0, opacity: 0 })

  const onHover = React.useCallback((element: HTMLElement) => {
    setHoverStyle({
      top: element.offsetTop,
      left: element.offsetLeft,
      height: element.offsetHeight,
      width: element.offsetWidth,
      opacity: 1,
    })
  }, [])

  const onLeave = React.useCallback(() => {
    setHoverStyle((prev) => ({ ...prev, opacity: 0 }))
  }, [])

  return { hoverStyle, onHover, onLeave }
}

function HoverTrackerBackground({ hoverStyle }: { hoverStyle: any }) {
  return (
    <div
      className="absolute rounded-lg dark:bg-border bg-accent z-0 transition-all duration-300 ease-out pointer-events-none"
      style={{
        top: hoverStyle.top,
        left: hoverStyle.left,
        width: hoverStyle.width,
        height: hoverStyle.height,
        opacity: hoverStyle.opacity,
      }}
    />
  )
}

// --- Components ---

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn("outline-none focus-visible:ring-0 ", className)}
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  const { hoverStyle, onHover, onLeave } = useHoverTracker()

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        onMouseLeave={onLeave}
        className={cn(
          "relative z-50 min-w-[8rem] overflow-hidden rounded-2xl border  dark:bg-accent  bg-popover p-2 text-popover-foreground shadow-xl shadow-black/5",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        <HoverTrackerBackground hoverStyle={hoverStyle} />
        <HoverTrackerContext.Provider value={{ onHover, onLeave }}>
          {children}
        </HoverTrackerContext.Provider>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  onMouseEnter,
  onFocus,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  const context = React.useContext(HoverTrackerContext)

  const handleInteraction = (e: any) => {
    context?.onHover(e.currentTarget)
  }

  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      onMouseEnter={(e) => {
        onMouseEnter?.(e)
        handleInteraction(e)
      }}
      onFocus={(e) => {
        onFocus?.(e)
        handleInteraction(e)
      }}
      className={cn(
        "relative z-10 flex cursor-pointer select-none items-center gap-3 rounded-lg px-2 py-2 text-sm outline-none transition-colors",
        // Disabled default focus background to let HoverTracker handle it
        "focus:bg-transparent focus:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "data-inset:pl-8",
        // Default Icon Styling
        "[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
        // Destructive Variant Styling
        variant === "destructive" &&
        "text-destructive focus:bg-destructive/10 focus:text-destructive [&>svg]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onMouseEnter,
  onFocus,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  const context = React.useContext(HoverTrackerContext)

  const handleInteraction = (e: any) => {
    context?.onHover(e.currentTarget)
  }

  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "relative z-10 flex cursor-default select-none items-center gap-3 rounded-lg py-2.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-transparent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      checked={checked}
      onMouseEnter={(e) => {
        onMouseEnter?.(e)
        handleInteraction(e)
      }}
      onFocus={(e) => {
        onFocus?.(e)
        handleInteraction(e)
      }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  onMouseEnter,
  onFocus,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  const context = React.useContext(HoverTrackerContext)

  const handleInteraction = (e: any) => {
    context?.onHover(e.currentTarget)
  }

  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "relative z-10 flex cursor-default select-none items-center gap-3 rounded-lg py-2.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-transparent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onMouseEnter={(e) => {
        onMouseEnter?.(e)
        handleInteraction(e)
      }}
      onFocus={(e) => {
        onFocus?.(e)
        handleInteraction(e)
      }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  label,
  rootOpenSetter,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
  label: string
  rootOpenSetter?: (open: boolean) => void
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-2 text-sm font-normal text-muted-foreground data-[inset]:pl-8 flex items-center justify-between",
        className
      )}
      {...props}
    >
      <span>{label}</span>
      <X
        className="size-3 cursor-pointer hover:text-foreground"
        onClick={() => rootOpenSetter?.(false)}
      />
    </DropdownMenuPrimitive.Label>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-2 my-1 h-px bg-border/50", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  onMouseEnter,
  onFocus,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  const context = React.useContext(HoverTrackerContext)

  const handleInteraction = (e: any) => {
    context?.onHover(e.currentTarget)
  }

  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      onMouseEnter={(e) => {
        onMouseEnter?.(e)
        handleInteraction(e)
      }}
      onFocus={(e) => {
        onFocus?.(e)
        handleInteraction(e)
      }}
      className={cn(
        "relative z-10 flex cursor-default select-none items-center gap-3 rounded-lg px-2 py-2.5 text-sm outline-none focus:bg-transparent  [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
        "data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  const { hoverStyle, onHover, onLeave } = useHoverTracker()

  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      onMouseLeave={onLeave}
      className={cn(
        "relative z-50 min-w-[8rem] mx-2 overflow-hidden rounded-2xl border dark:border-border border-zinc-200 dark:bg-accent bg-popover p-2 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      <HoverTrackerBackground hoverStyle={hoverStyle} />
      <HoverTrackerContext.Provider value={{ onHover, onLeave }}>
        {children}
      </HoverTrackerContext.Provider>
    </DropdownMenuPrimitive.SubContent>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}