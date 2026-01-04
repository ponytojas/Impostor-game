"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Shuffle, Plus, X, Play, Moon, Sun } from "lucide-react"
import { palabrasJuego } from "@/lib/words"

type Player = {
  name: string
  role: string // La palabra o "Impostor"
  revealed: boolean
}

type TimerState = {
  [key: number]: number
}

export default function ImpostorGame() {
  const [stage, setStage] = useState<"setup" | "playing">("setup")
  const [inputName, setInputName] = useState("")
  const [playerNames, setPlayerNames] = useState<string[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [firstPlayer, setFirstPlayer] = useState<string>("")
  const [timers, setTimers] = useState<TimerState>({})
  const [mounted, setMounted] = useState(false)
  const intervalRefs = useRef<{ [key: number]: NodeJS.Timeout }>({})
  const { resolvedTheme, setTheme, theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval)
    }
  }, [])

  const addPlayer = () => {
    if (inputName.trim() && !playerNames.includes(inputName.trim())) {
      setPlayerNames([...playerNames, inputName.trim()])
      setInputName("")
    }
  }

  const removePlayer = (name: string) => {
    setPlayerNames(playerNames.filter((n) => n !== name))
  }

  const pickFirstPlayer = (names: string[], current?: string) => {
    if (names.length === 0) return ""
    if (names.length === 1) return names[0]
    const options = current ? names.filter((name) => name !== current) : names
    return options[Math.floor(Math.random() * options.length)]
  }

  const startGame = () => {
    if (playerNames.length < 3) {
      alert("Necesitas al menos 3 jugadores para jugar")
      return
    }

    const palabraSeleccionada = palabrasJuego[Math.floor(Math.random() * palabrasJuego.length)]
    const shuffledNames = [...playerNames].sort(() => Math.random() - 0.5)
    const impostorIndex = Math.floor(Math.random() * shuffledNames.length)

    const gamePlayers: Player[] = shuffledNames.map((name, index) => ({
      name,
      role: index === impostorIndex ? "Impostor" : palabraSeleccionada,
      revealed: false,
    }))

    setPlayers(gamePlayers)
    setFirstPlayer(pickFirstPlayer(shuffledNames, firstPlayer))
    setStage("playing")
  }

  const toggleCard = (index: number) => {
    const newPlayers = [...players]
    const isRevealing = !newPlayers[index].revealed
    newPlayers[index].revealed = isRevealing
    setPlayers(newPlayers)

    if (isRevealing) {
      setTimers((prev) => ({ ...prev, [index]: 5 }))

      intervalRefs.current[index] = setInterval(() => {
        setTimers((prev) => {
          const newTime = (prev[index] || 0) - 1
          if (newTime <= 0) {
            clearInterval(intervalRefs.current[index])
            setPlayers((currentPlayers) => {
              const updated = [...currentPlayers]
              updated[index].revealed = false
              return updated
            })
            const { [index]: _, ...rest } = prev
            return rest
          }
          return { ...prev, [index]: newTime }
        })
      }, 1000)
    } else {
      if (intervalRefs.current[index]) {
        clearInterval(intervalRefs.current[index])
      }
      setTimers((prev) => {
        const { [index]: _, ...rest } = prev
        return rest
      })
    }
  }

  const resetGame = () => {
    Object.values(intervalRefs.current).forEach(clearInterval)
    intervalRefs.current = {}
    setTimers({})
    setStage("setup")
    setPlayerNames([])
    setPlayers([])
    setInputName("")
    setFirstPlayer("")
  }

  const newRound = () => {
    if (playerNames.length < 3) return

    Object.values(intervalRefs.current).forEach(clearInterval)
    intervalRefs.current = {}
    setTimers({})

    const palabraSeleccionada = palabrasJuego[Math.floor(Math.random() * palabrasJuego.length)]
    const shuffledNames = [...playerNames].sort(() => Math.random() - 0.5)
    const impostorIndex = Math.floor(Math.random() * shuffledNames.length)

    const gamePlayers: Player[] = shuffledNames.map((name, index) => ({
      name,
      role: index === impostorIndex ? "Impostor" : palabraSeleccionada,
      revealed: false,
    }))

    setPlayers(gamePlayers)
    setFirstPlayer(pickFirstPlayer(shuffledNames, firstPlayer))
  }

  const shuffleFirstPlayer = () => {
    const names = players.length ? players.map((player) => player.name) : playerNames
    if (!names.length) return
    setFirstPlayer(pickFirstPlayer(names, firstPlayer))
  }

  const isDark = mounted ? resolvedTheme === "dark" : false
  const toggleTheme = () => setTheme(isDark ? "light" : "dark")

  const ThemeToggle = () => (
    <Button
      type="button"
      variant="outline"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label="Cambiar modo de color"
      className="h-11 min-w-[120px] justify-center rounded-full border-border bg-card/80 px-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground shadow-sm hover:bg-accent sm:min-w-[168px]"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">{isDark ? "Modo claro" : "Modo oscuro"}</span>
      <span className="sm:hidden">{isDark ? "Claro" : "Oscuro"}</span>
      {theme === "system" && <span className="sr-only"> (Sistema)</span>}
    </Button>
  )

  if (stage === "setup") {
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
            <ThemeToggle />
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
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                    Jugadores
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      type="text"
                      placeholder="Nombre del jugador"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                      className="h-12 rounded-full border-border bg-background px-5 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/40"
                    />
                    <Button
                      onClick={addPlayer}
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
                            onClick={() => removePlayer(name)}
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

                {playerNames.length >= 3 && (
                  <Button
                    onClick={startGame}
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
          <ThemeToggle />
        </header>

        <div className="mt-8 grid gap-4 rounded-3xl border border-border bg-card/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.4)] backdrop-blur sm:grid-cols-[1.4fr_auto] sm:items-center sm:p-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Primer jugador</p>
            <div className="flex items-center gap-3">
              <div className="flex flex-row gap-4 items-center align-middle">

                <Button
                  onClick={shuffleFirstPlayer}
                  variant="outline"
                  size="icon"
                  aria-label="Cambiar primer jugador"
                  className="mt-1 h-8 w-auto px-5 rounded-full border-border bg-background text-foreground hover:bg-accent"
                >
                  <Shuffle className="h-4 w-4" />
                  Cambiar
                </Button>
                <p className="text-3xl font-semibold leading-tight sm:text-4xl">
                  {firstPlayer || "Sin seleccionar"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={newRound}
            className="h-11 rounded-full bg-foreground px-5 text-sm font-semibold text-background hover:bg-foreground/90"
          >
            <Shuffle className="h-4 w-4" />
            Nueva Ronda
          </Button>
          <Button
            onClick={resetGame}
            variant="outline"
            className="h-11 rounded-full border-border bg-card/80 px-5 text-sm font-semibold text-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
            Cambiar Jugadores
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player, index) => (
            <button
              key={`${player.name}-${index}`}
              onClick={() => toggleCard(index)}
              style={{ animationDelay: `${index * 60}ms` }}
              className={`group relative flex h-56 flex-col items-center justify-center gap-3 rounded-3xl border px-6 py-8 text-center shadow-sm transition-all duration-300 motion-reduce:animate-none sm:h-60 lg:h-64 ${!player.revealed
                ? "border-border bg-card/90 text-foreground shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)] hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_28px_60px_-35px_rgba(15,23,42,0.45)] active:translate-y-0"
                : player.role === "Impostor"
                  ? "border-rose-200 bg-rose-50 text-rose-950 shadow-[0_20px_50px_-35px_rgba(127,29,29,0.25)] dark:border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-100 dark:shadow-[0_20px_50px_-35px_rgba(244,63,94,0.35)]"
                  : "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-[0_20px_50px_-35px_rgba(6,78,59,0.2)] dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-100 dark:shadow-[0_20px_50px_-35px_rgba(16,185,129,0.35)]"
                } animate-[fade-up_600ms_ease-out_forwards]`}
            >
              {player.revealed && timers[index] !== undefined && (
                <div
                  className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-medium ${player.role === "Impostor"
                    ? "border-rose-200 bg-rose-100/80 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-100"
                    : "border-emerald-200 bg-emerald-100/80 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100"
                    }`}
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
                    className={`text-xs uppercase tracking-[0.35em] ${player.role === "Impostor" ? "text-rose-500 dark:text-rose-300" : "text-emerald-600 dark:text-emerald-300"
                      }`}
                  >
                    Tu rol
                  </span>
                  <h3 className="text-2xl font-semibold">{player.name}</h3>
                  <div
                    className={`rounded-2xl border px-6 py-3 text-center text-2xl font-semibold tracking-wide ${player.role === "Impostor"
                      ? "border-rose-200 bg-rose-100/70 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-100"
                      : "border-emerald-200 bg-emerald-100/70 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100"
                      }`}
                  >
                    {player.role === "Impostor" ? "IMPOSTOR" : player.role}
                  </div>
                  <span className="text-xs text-muted-foreground">Toca para ocultar</span>
                </>
              )}

              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(120deg,_transparent,_rgba(15,23,42,0.06),_transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </button>
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
