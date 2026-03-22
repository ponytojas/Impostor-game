import { Shuffle, X } from "lucide-react"

import { PlayerCard } from "@/components/game/player-card"
import { ThemeToggle } from "@/components/game/theme-toggle"
import { Button } from "@/components/ui/button"
import type { Player, TimerState } from "@/domain/game/types"

type PlayingScreenProps = {
  players: Player[]
  firstPlayer: string
  timers: TimerState
  isDark: boolean
  isSystemTheme: boolean
  onToggleTheme: () => void
  onShuffleFirstPlayer: () => void
  onNewRound: () => void
  onResetGame: () => void
  onToggleCard: (index: number) => void
}

export function PlayingScreen({
  players,
  firstPlayer,
  timers,
  isDark,
  isSystemTheme,
  onToggleTheme,
  onShuffleFirstPlayer,
  onNewRound,
  onResetGame,
  onToggleCard,
}: PlayingScreenProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(20,83,45,0.12),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.08),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(45,212,191,0.12),_transparent_50%)]"
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14 lg:py-20">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Impostor</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Revela tu rol en secreto.</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Cada jugador toca su carta para revelar su rol por unos segundos.
            </p>
          </div>
          <ThemeToggle
            isDark={isDark}
            isSystemTheme={isSystemTheme}
            onToggle={onToggleTheme}
            className="h-11 min-w-[120px] justify-center rounded-full border-border bg-card/80 px-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground shadow-sm hover:bg-accent sm:min-w-[168px]"
          />
        </header>

        <div className="mt-8 grid gap-4 rounded-3xl border border-border bg-card/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.4)] backdrop-blur sm:grid-cols-[1.4fr_auto] sm:items-center sm:p-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Primer jugador</p>
            <div className="flex items-center gap-3">
              <div className="flex flex-row items-center gap-4 align-middle">
                <Button
                  onClick={onShuffleFirstPlayer}
                  variant="outline"
                  size="icon"
                  aria-label="Cambiar primer jugador"
                  className="mt-1 h-8 w-auto rounded-full border-border bg-background px-5 text-foreground hover:bg-accent"
                >
                  <Shuffle className="h-4 w-4" />
                  Cambiar
                </Button>
                <p className="text-3xl font-semibold leading-tight sm:text-4xl">{firstPlayer || "Sin seleccionar"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={onNewRound}
            className="h-11 rounded-full bg-foreground px-5 text-sm font-semibold text-background hover:bg-foreground/90"
          >
            <Shuffle className="h-4 w-4" />
            Nueva Ronda
          </Button>
          <Button
            onClick={onResetGame}
            variant="outline"
            className="h-11 rounded-full border-border bg-card/80 px-5 text-sm font-semibold text-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
            Cambiar Jugadores
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player, index) => (
            <PlayerCard
              key={`${player.name}-${index}`}
              player={player}
              index={index}
              timers={timers}
              onToggle={onToggleCard}
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card/90 p-6 text-left shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
            <h3 className="text-lg font-semibold">Cómo jugar</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Cada jugador toca su carta una sola vez para ver su rol.</li>
              <li>Todos menos uno reciben la misma palabra.</li>
              <li>
                Uno de vosotros es el <span className="font-semibold text-rose-600 dark:text-rose-300">Impostor</span>.
              </li>
              <li>Por turnos, describan la palabra sin revelarla.</li>
              <li>Descubran quién es el impostor antes de que os descubra.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
