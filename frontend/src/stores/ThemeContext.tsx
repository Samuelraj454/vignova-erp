import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  accentColor: string
  setAccentColor: (color: string) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  accentColor: "purple",
  setAccentColor: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  const [accentColor, setAccentColor] = useState<string>(
    () => localStorage.getItem("crm-accent") || "purple"
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement;
    const colors = {
      blue: '221.2 83.2% 53.3%',
      purple: '271 81% 56%',
      rose: '346.8 77.2% 49.8%',
      emerald: '142.1 76.2% 36.3%',
      amber: '37.7 92.1% 50.2%'
    };
    root.style.setProperty('--primary', colors[accentColor as keyof typeof colors] || colors.purple);
    root.style.setProperty('--ring', colors[accentColor as keyof typeof colors] || colors.purple);
  }, [accentColor])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    accentColor,
    setAccentColor: (color: string) => {
      localStorage.setItem("crm-accent", color)
      setAccentColor(color)
    }
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
