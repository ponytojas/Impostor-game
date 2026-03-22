import { X } from "lucide-react"

type PlayersListProps = {
  playerNames: string[]
  onRemovePlayer: (name: string) => void
}

export function PlayersList({ playerNames, onRemovePlayer }: PlayersListProps) {
  if (playerNames.length === 0) {
    return null
  }

  return (
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
  )
}
