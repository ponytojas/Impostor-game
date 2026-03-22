import { Shuffle } from "lucide-react"

import { Button } from "@/components/ui/button"

type FirstPlayerPanelProps = {
  firstPlayer: string
  onShuffle: () => void
}

export function FirstPlayerPanel({ firstPlayer, onShuffle }: FirstPlayerPanelProps) {
  return (
    <div className="mt-8 grid gap-4 rounded-3xl border border-border bg-card/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.4)] backdrop-blur sm:grid-cols-[1.4fr_auto] sm:items-center sm:p-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Primer jugador</p>
        <div className="flex items-center gap-3">
          <div className="flex flex-row items-center gap-4 align-middle">
            <Button
              onClick={onShuffle}
              variant="outline"
              size="icon"
              aria-label="Cambiar primer jugador"
              className="mt-1 h-8 w-auto rounded-full border-border bg-background px-5 text-foreground hover:bg-accent"
            >
              <Shuffle className="h-4 w-4" />
              Cambiar
            </Button>
            <p data-testid="first-player-name" className="text-3xl font-semibold leading-tight sm:text-4xl">
              {firstPlayer || "Sin seleccionar"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
