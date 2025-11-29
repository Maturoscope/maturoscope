"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { AccentTheme } from "@/actions/organization"

interface ThemeContextType {
  accentTheme: AccentTheme
  setAccentTheme: (theme: AccentTheme) => void
}

export const DEFAULT_ACCENT_THEME: AccentTheme = "default"
const ThemeContext = createContext<ThemeContextType | null>(null)

interface ThemeProviderProps {
  children: React.ReactNode
  initialTheme?: AccentTheme
}

export const ThemeProvider = ({
  children,
  initialTheme = DEFAULT_ACCENT_THEME,
}: ThemeProviderProps) => {
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>(initialTheme)

  const setAccentTheme = (theme: AccentTheme) => {
    setAccentThemeState(theme)

    if (typeof window !== "undefined") {
      const html = document.documentElement
      if (theme) {
        html.setAttribute("data-accent-theme", theme)
      } else {
        html.removeAttribute("data-accent-theme")
      }
    }
  }

  useEffect(() => {
    setAccentTheme(initialTheme)
  }, [initialTheme])

  return (
    <ThemeContext.Provider value={{ accentTheme, setAccentTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
