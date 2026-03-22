export function HowToPlayCard() {
  return (
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
  )
}
