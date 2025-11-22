import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center  [&_svg:not([class*='size-'])]:opacity-50   font-medium cursor-pointer justify-center gap-2 whitespace-nowrap rounded-lg text-sm transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: ` bg-gradient-to-b from-[#36393E] to-[#030712] text-primary-foreground border dark:border-transparent border-black shadow-[inset_0px_0.5px_0px_0px_rgba(255,255,255,0.40),inset_0px_0px_0px_0.5px_rgba(255,255,255,0.30)] hover:from-[#3a3f45] hover:to-[#1a1f2e] dark:bg-primary dark:from-primary dark:to-primary/90 dark:shadow-[_0_0_14px_0_rgba(255,255,255,0.2),_inset_0_-1px_0.4px_0_rgba(255,255,255,0.1),_inset_0_1px_0.4px_0_rgba(255,255,255,0.15)] dark:hover:bg-primary/90`,
        background: "bg-background text-primary hover:bg-background/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "shadow-xs bg-linear-to-t  from-border dark:from-border  to-border/40  dark:border-border border border-zinc-300 shadow-zinc-950/10  duration-200 hover:to-border/80",
        secondary:
          "bg-secondary  text-secondary-foreground shadow-xs hover:bg-secondary/65",
        ghost:
          "hover:bg-linear-to-t border-none border hover:to-border/50 hover:from-muted dark:hover:from-border/50 dark:hover:border-border dark:hover:to-border hover:border hover:border-zinc-300 hover:shadow-zinc-950/10 hover:duration-200 ",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-4 rounded-md py-2 has-[>svg]:px-3 ",
        sm: "h-7 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-lg px-6 has-[>svg]:px-4",
        icon: "size-8 rounded-md  [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='size-'])]:opacity-50",
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
