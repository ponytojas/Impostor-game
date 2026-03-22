import { Play } from "lucide-react"

import { CrazyModeToggle } from "@/components/game/crazy-mode-toggle"
import { PlayerInput } from "@/components/game/player-input"
import { PlayersList } from "@/components/game/players-list"
import { ThemeToggle } from "@/components/game/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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
              <PlayerInput
                inputName={inputName}
                onInputNameChange={onInputNameChange}
                onAddPlayer={onAddPlayer}
              />

              <PlayersList playerNames={playerNames} onRemovePlayer={onRemovePlayer} />

              <CrazyModeToggle crazyMode={crazyMode} onToggle={() => onCrazyModeChange(!crazyMode)} />

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
