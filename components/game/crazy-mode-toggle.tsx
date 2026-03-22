type CrazyModeToggleProps = {
  crazyMode: boolean
  onToggle: () => void
}

export function CrazyModeToggle({ crazyMode, onToggle }: CrazyModeToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={crazyMode}
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors ${crazyMode ? "bg-amber-500" : "bg-muted"}`}
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
  )
}
