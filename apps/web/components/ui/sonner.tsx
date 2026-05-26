"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#fff9ef",
          "--normal-text": "#16110d",
          "--normal-border": "#000000",
          "--success-bg": "#dcfce7",
          "--success-text": "#14532d",
          "--success-border": "#14532d",
          "--error-bg": "#fee2e2",
          "--error-text": "#991b1b",
          "--error-border": "#991b1b",
          "--warning-bg": "#fef3c7",
          "--warning-text": "#92400e",
          "--warning-border": "#92400e",
          "--info-bg": "#dbeafe",
          "--info-text": "#1d4ed8",
          "--info-border": "#1d4ed8",
          "--border-radius": "18px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
