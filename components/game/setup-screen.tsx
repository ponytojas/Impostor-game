import { Plus, Play, X } from "lucide-react"

import { ThemeToggle } from "@/components/game/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type SetupScreenProps = {
  inputName: string
  playerNames: string[]
  crazyMode: boolean
  isDark: boolean
  isSystemTheme: boolean
  onInputNameChange: (value: string) => void
  onCrazyModeChange: (value: boolean) => void
  onAddPlayer: () => void
  onRemovePlayer: (name: string) => void
  onStartGame: () => void
  onToggleTheme: () => void
}

export function SetupScreen({
  inputName,
  playerNames,
  crazyMode,
  isDark,
  isSystemTheme,
  onInputNameChange,
  onCrazyModeChange,
  onAddPlayer,
  onRemovePlayer,
  onStartGame,
  onToggleTheme,
}: SetupScreenProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(20,83,45,0.12),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.08),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(45,212,191,0.12),_transparent_50%)]"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:py-14 lg:py-20">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold">
              I
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Impostor</p>
              <p className="text-sm text-muted-foreground">Juego de deducción social</p>
            </div>
          </div>
          <ThemeToggle
            isDark={isDark}
            isSystemTheme={isSystemTheme}
            onToggle={onToggleTheme}
            className="h-11 min-w-[120px] justify-center rounded-full border-border bg-card/80 px-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground shadow-sm hover:bg-accent sm:min-w-[168px]"
          />
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6 motion-reduce:animate-none animate-[fade-up_700ms_ease-out]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Rápido · Minimal · Social
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Una carta, una palabra, un impostor.
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                Prepara el grupo, reparte las cartas y descubre quién finge sin delatar la palabra.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.28em] text-muted-foreground">
              <span className="rounded-full border border-border bg-card px-3 py-1">3+ jugadores</span>
              <span className="rounded-full border border-border bg-card px-3 py-1">5 min</span>
              <span className="rounded-full border border-border bg-card px-3 py-1">1 impostor</span>
            </div>
          </div>

          <Card className="rounded-3xl border-border/80 bg-card/90 p-6 shadow-[0_32px_90px_-65px_rgba(15,23,42,0.5)] backdrop-blur sm:p-8 motion-reduce:animate-none animate-[fade-up_700ms_ease-out_120ms]">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Jugadores</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    type="text"
                    placeholder="Nombre del jugador"
                    value={inputName}
                    onChange={(event) => onInputNameChange(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && onAddPlayer()}
                    className="h-12 rounded-full border-border bg-background px-5 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/40"
                  />
                  <Button
                    onClick={onAddPlayer}
                    variant="outline"
                    className="h-12 rounded-full border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-accent"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </Button>
                </div>
              </div>

              {playerNames.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Lista</h3>
                    <span className="text-xs text-muted-foreground">{playerNames.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {playerNames.map((name) => (
                      <div
                        key={name}
                        className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                      >
                        <span className="font-medium">{name}</span>
                        <button
                          type="button"
                          onClick={() => onRemovePlayer(name)}
                          className="text-muted-foreground transition hover:text-foreground"
                          aria-label={`Eliminar ${name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={crazyMode}
                  onClick={() => onCrazyModeChange(!crazyMode)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    crazyMode ? "bg-amber-500" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      crazyMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Modo Loco</span>
                  <span className="text-xs text-muted-foreground">20% de sorpresas especiales</span>
                </div>
              </div>

              {playerNames.length >= 3 && (
                <Button
                  onClick={onStartGame}
                  className="h-14 w-full rounded-full bg-foreground text-base font-semibold text-background hover:bg-foreground/90 sm:h-12"
                >
                  <Play className="h-5 w-5" />
                  Iniciar Juego
                </Button>
              )}

              {playerNames.length > 0 && playerNames.length < 3 && (
                <p className="text-center text-sm text-muted-foreground">
                  Agrega al menos 3 jugadores para comenzar.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
