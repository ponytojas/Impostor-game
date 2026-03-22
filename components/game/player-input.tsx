import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type PlayerInputProps = {
  inputName: string
  onInputNameChange: (value: string) => void
  onAddPlayer: () => void
}

export function PlayerInput({ inputName, onInputNameChange, onAddPlayer }: PlayerInputProps) {
  return (
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
  )
}
