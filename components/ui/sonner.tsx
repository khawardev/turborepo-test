"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group rounded-xl shadow-xs bg-linear-to-t hover:to-muted/50 to-background/30 from-muted dark:from-muted/50 text-muted-foreground font-Inter font-medium"
      style={
        {
          "--normal-bg": "var(--border)",
          "--normal-text": "var(--accent-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
