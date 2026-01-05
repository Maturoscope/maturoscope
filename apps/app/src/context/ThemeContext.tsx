"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { AccentTheme, FontTheme } from "@/types/shared"

interface ThemeContextType {
  accentTheme: AccentTheme
  setAccentTheme: (theme: AccentTheme) => void
  fontTheme: FontTheme
  setFontTheme: (theme: FontTheme) => void
}

export const DEFAULT_ACCENT_THEME: AccentTheme = "default"
export const DEFAULT_FONT_THEME: FontTheme = "geist"

const ThemeContext = createContext<ThemeContextType | null>(null)

interface ThemeProviderProps {
  children: React.ReactNode
  initialTheme?: AccentTheme
  initialFont?: FontTheme
  fontClassNames?: Record<FontTheme, string>
}

export const ThemeProvider = ({
  children,
  initialTheme = DEFAULT_ACCENT_THEME,
  initialFont = DEFAULT_FONT_THEME,
  fontClassNames,
}: ThemeProviderProps) => {
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>(initialTheme)
  const [fontTheme, setFontThemeState] = useState<FontTheme>(initialFont)

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

  const setFontTheme = (theme: FontTheme) => {
    setFontThemeState(theme)

    if (typeof window !== "undefined" && fontClassNames) {
      const html = document.documentElement
      const fontClassName = fontClassNames[theme]

      if (fontClassName) {
        // Remove all existing font classes
        const currentClasses = html.className.split(" ").filter(Boolean)
        const fontClasses = Object.values(fontClassNames)
        const filteredClasses = currentClasses.filter(
          (cls) => !fontClasses.includes(cls)
        )

        // Add the new font class and preserve other classes like "antialiased"
        html.className = [...filteredClasses, fontClassName].join(" ").trim()
        html.setAttribute("data-font-theme", theme)
      }
    }
  }

  useEffect(() => {
    setAccentTheme(initialTheme)
  }, [initialTheme])

  // Apply font theme on mount and when it changes
  useEffect(() => {
    if (typeof window !== "undefined" && fontClassNames) {
      const html = document.documentElement
      const fontClassName = fontClassNames[initialFont]

      if (fontClassName) {
        // Remove all existing font classes
        const currentClasses = html.className.split(" ").filter(Boolean)
        const fontClasses = Object.values(fontClassNames)
        const filteredClasses = currentClasses.filter(
          (cls) => !fontClasses.includes(cls)
        )

        // Add the new font class and preserve other classes like "antialiased"
        html.className = [...filteredClasses, fontClassName].join(" ").trim()
        html.setAttribute("data-font-theme", initialFont)
      }
    }
    setFontThemeState(initialFont)
  }, [initialFont, fontClassNames])

  return (
    <ThemeContext.Provider value={{ accentTheme, setAccentTheme, fontTheme, setFontTheme }}>
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
