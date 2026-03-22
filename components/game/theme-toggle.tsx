import { Moon, Sun } from "lucide-react"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"

type ThemeToggleProps = {
  isDark: boolean
  isSystemTheme: boolean
  onToggle: () => void
} & Omit<ComponentProps<typeof Button>, "onClick" | "children">

export function ThemeToggle({
  isDark,
  isSystemTheme,
  onToggle,
  className,
  ...props
}: ThemeToggleProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onToggle}
      aria-pressed={isDark}
      aria-label="Cambiar modo de color"
      className={className}
      {...props}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">{isDark ? "Modo claro" : "Modo oscuro"}</span>
      <span className="sm:hidden">{isDark ? "Claro" : "Oscuro"}</span>
      {isSystemTheme && <span className="sr-only"> (Sistema)</span>}
    </Button>
  )
}
