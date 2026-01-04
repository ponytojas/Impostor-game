"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Shuffle, Plus, X, Play } from "lucide-react"
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
  const [showFirstPlayer, setShowFirstPlayer] = useState(false)
  const [firstPlayer, setFirstPlayer] = useState<string>("")
  const [timers, setTimers] = useState<TimerState>({})
  const intervalRefs = useRef<{ [key: number]: NodeJS.Timeout }>({})

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

  const startGame = () => {
    if (playerNames.length < 3) {
      alert("Necesitas al menos 3 jugadores para jugar")
      return
    }

    // Elegir palabra aleatoria
    const palabraSeleccionada = palabrasJuego[Math.floor(Math.random() * palabrasJuego.length)]

    // Mezclar nombres aleatoriamente
    const shuffledNames = [...playerNames].sort(() => Math.random() - 0.5)

    const impostorIndex = Math.floor(Math.random() * shuffledNames.length)

    // Crear jugadores con roles
    const gamePlayers: Player[] = shuffledNames.map((name, index) => ({
      name,
      role: index === impostorIndex ? "Impostor" : palabraSeleccionada,
      revealed: false,
    }))

    setPlayers(gamePlayers)
    setFirstPlayer(shuffledNames[Math.floor(Math.random() * shuffledNames.length)])
    setStage("playing")
  }

  const toggleCard = (index: number) => {
    const newPlayers = [...players]
    const isRevealing = !newPlayers[index].revealed
    newPlayers[index].revealed = isRevealing
    setPlayers(newPlayers)

    if (isRevealing) {
      // Start 5 second countdown
      setTimers((prev) => ({ ...prev, [index]: 5 }))

      intervalRefs.current[index] = setInterval(() => {
        setTimers((prev) => {
          const newTime = (prev[index] || 0) - 1
          if (newTime <= 0) {
            // Auto-hide the card
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
      // Card was hidden manually, clear timer
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
    setShowFirstPlayer(false)
  }

  const newRound = () => {
    if (playerNames.length < 3) return

    Object.values(intervalRefs.current).forEach(clearInterval)
    intervalRefs.current = {}
    setTimers({})

    // Elegir palabra aleatoria
    const palabraSeleccionada = palabrasJuego[Math.floor(Math.random() * palabrasJuego.length)]

    // Mezclar nombres aleatoriamente
    const shuffledNames = [...playerNames].sort(() => Math.random() - 0.5)

    const impostorIndex = Math.floor(Math.random() * shuffledNames.length)

    // Crear jugadores con roles
    const gamePlayers: Player[] = shuffledNames.map((name, index) => ({
      name,
      role: index === impostorIndex ? "Impostor" : palabraSeleccionada,
      revealed: false,
    }))

    setPlayers(gamePlayers)
    setFirstPlayer(shuffledNames[Math.floor(Math.random() * shuffledNames.length)])
    setShowFirstPlayer(false)
  }

  if (stage === "setup") {
    return (
      <div className="relative min-h-screen overflow-hidden bg-stone-50 text-stone-950">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(14,116,144,0.08),_transparent_50%)]"
        />
        <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-4 py-16">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Juego social</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-stone-950">Impostor</h1>
            <p className="mt-3 text-base text-stone-600">
              ¿Quién es el impostor? Un juego rápido de deducción para grupos.
            </p>
          </div>

          <Card className="mt-10 rounded-3xl border-stone-200/80 bg-white/80 p-8 shadow-[0_32px_90px_-65px_rgba(15,23,42,0.5)] backdrop-blur">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="text"
                  placeholder="Nombre del jugador"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                  className="h-12 rounded-full border-stone-300 bg-white px-5 text-base text-stone-900 placeholder:text-stone-400 focus-visible:ring-stone-400/40"
                />
                <Button
                  onClick={addPlayer}
                  className="h-12 rounded-full border border-stone-300 bg-white px-5 text-stone-700 hover:bg-stone-100"
                >
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>

              {playerNames.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-[0.35em] text-stone-500">Jugadores</h3>
                    <span className="text-xs text-stone-400">{playerNames.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {playerNames.map((name) => (
                      <div
                        key={name}
                        className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-100 px-3 py-1.5 text-sm text-stone-700"
                      >
                        <span className="font-medium">{name}</span>
                        <button
                          type="button"
                          onClick={() => removePlayer(name)}
                          className="text-stone-400 transition hover:text-stone-700"
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
                  className="w-full rounded-full bg-stone-900 py-6 text-lg text-stone-50 hover:bg-stone-800"
                >
                  <Play className="h-5 w-5" />
                  Iniciar Juego
                </Button>
              )}

              {playerNames.length > 0 && playerNames.length < 3 && (
                <p className="text-center text-sm text-stone-500">Agrega al menos 3 jugadores para comenzar</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-50 text-stone-950">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(14,116,144,0.08),_transparent_50%)]"
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950">Impostor</h1>
          <p className="mt-2 text-stone-600">Cada jugador toca su carta para revelar su rol.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => setShowFirstPlayer(!showFirstPlayer)}
              variant="outline"
              className="rounded-full border-stone-300 bg-white/80 text-stone-700 hover:bg-stone-100"
            >
              <Play className="h-4 w-4" />
              {showFirstPlayer ? "Ocultar" : "¿Quién Empieza?"}
            </Button>
            <Button onClick={newRound} className="rounded-full bg-stone-900 text-stone-50 hover:bg-stone-800">
              <Shuffle className="h-4 w-4" />
              Nueva Ronda
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              className="rounded-full border-stone-300 bg-white/80 text-stone-700 hover:bg-stone-100"
            >
              <X className="h-4 w-4" />
              Cambiar Jugadores
            </Button>
          </div>
        </div>

        {showFirstPlayer && (
          <div className="mt-8 rounded-3xl border border-stone-200 bg-white/80 p-6 text-center shadow-[0_20px_60px_-45px_rgba(15,23,42,0.4)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Primer Jugador</p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-stone-100 text-lg font-semibold text-stone-700">
                1
              </div>
              <span className="text-3xl font-semibold text-stone-950">{firstPlayer}</span>
            </div>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player, index) => (
            <button
              key={`${player.name}-${index}`}
              onClick={() => toggleCard(index)}
              className={`group relative flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border px-6 py-8 text-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400/50 ${
                !player.revealed
                  ? "border-stone-200 bg-white/90 text-stone-900 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)] hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_28px_60px_-35px_rgba(15,23,42,0.45)] active:translate-y-0"
                  : player.role === "Impostor"
                    ? "border-rose-200 bg-rose-50 text-rose-950 shadow-[0_20px_50px_-35px_rgba(127,29,29,0.25)]"
                    : "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-[0_20px_50px_-35px_rgba(6,78,59,0.2)]"
              }`}
            >
              {player.revealed && timers[index] !== undefined && (
                <div
                  className={`absolute right-4 top-4 rounded-full border px-3 py-1 text-xs font-medium ${
                    player.role === "Impostor"
                      ? "border-rose-200 bg-rose-100/80 text-rose-700"
                      : "border-emerald-200 bg-emerald-100/80 text-emerald-700"
                  }`}
                >
                  {timers[index]}s
                </div>
              )}

              {!player.revealed ? (
                <>
                  <span className="text-xs uppercase tracking-[0.35em] text-stone-400">Carta</span>
                  <span className="text-5xl font-light text-stone-200">?</span>
                  <h3 className="text-2xl font-semibold text-stone-900">{player.name}</h3>
                  <span className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs text-stone-500">
                    Toca para revelar
                  </span>
                </>
              ) : (
                <>
                  <span
                    className={`text-xs uppercase tracking-[0.35em] ${
                      player.role === "Impostor" ? "text-rose-500" : "text-emerald-600"
                    }`}
                  >
                    Tu rol
                  </span>
                  <h3 className="text-2xl font-semibold">{player.name}</h3>
                  <div
                    className={`rounded-2xl border px-6 py-3 text-center text-2xl font-semibold tracking-wide ${
                      player.role === "Impostor"
                        ? "border-rose-200 bg-rose-100/70 text-rose-900"
                        : "border-emerald-200 bg-emerald-100/70 text-emerald-900"
                    }`}
                  >
                    {player.role === "Impostor" ? "IMPOSTOR" : player.role}
                  </div>
                  <span className="text-xs text-stone-500">Toca para ocultar</span>
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
          <div className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white/80 p-6 text-left shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] backdrop-blur">
            <h3 className="text-lg font-semibold text-stone-900">Cómo jugar</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stone-600">
              <li>Cada jugador toca su carta una sola vez para ver su rol.</li>
              <li>Todos menos uno reciben la misma palabra.</li>
              <li>
                Uno de vosotros es el <span className="font-semibold text-rose-600">Impostor</span>.
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
