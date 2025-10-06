import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center font-medium cursor-pointer justify-center gap-2 whitespace-nowrap rounded-lg text-sm transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[_0_0_14px_0_rgba(52,52,52,0.3),_inset_0_-1px_0.4px_0_rgba(52,52,52,0.2)] dark:shadow-[_0_0_14px_0_rgba(255,255,255,0.2),_inset_0_-1px_0.4px_0_rgba(255,255,255,0.1),_inset_0_1px_0.4px_0_rgba(255,255,255,0.15)] hover:bg-primary/90",
        background: "bg-background text-primary hover:bg-background/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "shadow-xs bg-linear-to-t hover:to-muted/50 to-background/30 from-muted dark:from-muted/50 dark:border-border border border-zinc-300 shadow-zinc-950/10 duration-200",
        secondary:
          "bg-secondary  text-secondary-foreground shadow-xs hover:bg-secondary/65",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-4 rounded-md py-2 has-[>svg]:px-3",
        sm: "h-7 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-9 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md  [&_svg:not([class*='size-'])]:size-5 [&_svg:not([class*='size-'])]:opacity-50",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
