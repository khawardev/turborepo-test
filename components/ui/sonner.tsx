"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = (props: ToasterProps) => {
  const { theme = "system" } = useTheme()

  const style: React.CSSProperties = {
    "--normal-bg": "var(--accent)",
    "--normal-text": "var(--accent-foreground)",
    "--normal-border": "var(--border)",
  } as React.CSSProperties

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group rounded-xl text-lg shadow-xs text-muted-foreground font-medium"
      style={style}
      {...props}
    />
  )
}

export { Toaster }