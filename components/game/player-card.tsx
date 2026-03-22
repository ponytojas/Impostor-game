import { IMPOSTOR_ROLE } from "@/domain/game/constants"
import type { Player, TimerState } from "@/domain/game/types"

type PlayerCardProps = {
  player: Player
  index: number
  timers: TimerState
  onToggle: (index: number) => void
}

export function PlayerCard({ player, index, timers, onToggle }: PlayerCardProps) {
  return (
    <button
      data-testid={`player-card-${index}`}
      onClick={() => onToggle(index)}
      style={{ animationDelay: `${index * 60}ms` }}
      className={`group relative flex h-56 animate-[fade-up_600ms_ease-out_forwards] flex-col items-center justify-center gap-3 rounded-3xl border px-6 py-8 text-center shadow-sm transition-all duration-300 motion-reduce:animate-none sm:h-60 lg:h-64 ${
        !player.revealed
          ? "border-border bg-card/90 text-foreground shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)] hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_28px_60px_-35px_rgba(15,23,42,0.45)] active:translate-y-0"
          : player.role === IMPOSTOR_ROLE
            ? "border-rose-200 bg-rose-50 text-rose-950 shadow-[0_20px_50px_-35px_rgba(127,29,29,0.25)] dark:border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-100 dark:shadow-[0_20px_50px_-35px_rgba(244,63,94,0.35)]"
            : "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-[0_20px_50px_-35px_rgba(6,78,59,0.2)] dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-100 dark:shadow-[0_20px_50px_-35px_rgba(16,185,129,0.35)]"
      }`}
    >
      {player.revealed && timers[index] !== undefined && (
        <div
          className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-medium ${
            player.role === IMPOSTOR_ROLE
              ? "border-rose-200 bg-rose-100/80 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-100"
              : "border-emerald-200 bg-emerald-100/80 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100"
          }`}
          data-testid="player-timer"
        >
          {timers[index]}s
        </div>
      )}

      {!player.revealed ? (
        <>
          <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Carta</span>
          <span className="text-5xl font-light text-muted-foreground">?</span>
          <h3 className="text-2xl font-semibold">{player.name}</h3>
          <span className="rounded-full border border-border bg-background px-4 py-1.5 text-xs text-muted-foreground">
            Toca para revelar
          </span>
        </>
      ) : (
        <>
          <span
            className={`text-xs uppercase tracking-[0.35em] ${
              player.role === IMPOSTOR_ROLE ? "text-rose-500 dark:text-rose-300" : "text-emerald-600 dark:text-emerald-300"
            }`}
          >
            Tu rol
          </span>
          <h3 className="text-2xl font-semibold">{player.name}</h3>
          <div
            data-testid="player-role"
            className={`rounded-2xl border px-6 py-3 text-center text-2xl font-semibold tracking-wide ${
              player.role === IMPOSTOR_ROLE
                ? "border-rose-200 bg-rose-100/70 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-100"
                : "border-emerald-200 bg-emerald-100/70 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100"
            }`}
          >
            {player.role === IMPOSTOR_ROLE ? "IMPOSTOR" : player.role}
          </div>
          <span className="text-xs text-muted-foreground">Toca para ocultar</span>
        </>
      )}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(120deg,_transparent,_rgba(15,23,42,0.06),_transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </button>
  )
}
