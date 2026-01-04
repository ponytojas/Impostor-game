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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="bg-slate-800/50 border-indigo-500/20 backdrop-blur-sm p-8">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-2 text-balance">Impostor</h1>
              <p className="text-indigo-300 text-lg">¿Quién es el impostor?</p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Nombre del jugador"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addPlayer()}
                  className="bg-slate-900/50 border-indigo-500/30 text-white placeholder:text-slate-400 focus:border-indigo-400"
                />
                <Button onClick={addPlayer} className="bg-indigo-600 hover:bg-indigo-700 text-white" size="icon">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {playerNames.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-indigo-300 mb-3">Jugadores ({playerNames.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {playerNames.map((name) => (
                      <div
                        key={name}
                        className="flex items-center justify-between bg-slate-900/50 border border-indigo-500/20 rounded-lg px-4 py-3"
                      >
                        <span className="text-white font-medium">{name}</span>
                        <button
                          onClick={() => removePlayer(name)}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {playerNames.length >= 3 && (
                <Button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg py-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar Juego
                </Button>
              )}

              {playerNames.length > 0 && playerNames.length < 3 && (
                <p className="text-amber-400 text-center text-sm">Agrega al menos 3 jugadores para comenzar</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Impostor</h1>
          <p className="text-indigo-300 mb-4">Cada jugador debe tocar su carta para revelar su rol</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              onClick={() => setShowFirstPlayer(!showFirstPlayer)}
              variant="outline"
              className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 bg-transparent"
            >
              <Play className="w-4 h-4 mr-2" />
              {showFirstPlayer ? "Ocultar" : "¿Quién Empieza?"}
            </Button>
            <Button onClick={newRound} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Shuffle className="w-4 h-4 mr-2" />
              Nueva Ronda
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              Cambiar Jugadores
            </Button>
          </div>
        </div>

        {showFirstPlayer && (
          <div className="mb-8 bg-slate-800/50 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Primer Jugador</h2>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-xl">
                1
              </div>
              <span className="text-3xl font-bold text-white">{firstPlayer}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player, index) => (
            <button
              key={`${player.name}-${index}`}
              onClick={() => toggleCard(index)}
              className={`
                relative h-64 rounded-2xl transition-all duration-500 transform
                ${
                  !player.revealed
                    ? "bg-gradient-to-br from-indigo-600 to-purple-700 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50 cursor-pointer active:scale-95"
                    : player.role === "Impostor"
                      ? "bg-gradient-to-br from-red-600 to-rose-700 hover:scale-105 cursor-pointer active:scale-95"
                      : "bg-gradient-to-br from-emerald-600 to-teal-700 hover:scale-105 cursor-pointer active:scale-95"
                }
                border-2 border-white/20 backdrop-blur-sm
                overflow-hidden group
              `}
            >
              {player.revealed && timers[index] !== undefined && (
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center border border-white/20">
                  <span className={`font-bold text-lg ${timers[index] <= 5 ? "text-red-400" : "text-white"}`}>
                    {timers[index]}
                  </span>
                </div>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                {!player.revealed ? (
                  <>
                    <div className="text-white/90 text-6xl mb-4">❓</div>
                    <h3 className="text-2xl font-bold text-white mb-2 text-balance">{player.name}</h3>
                    <p className="text-white/70 text-sm">Toca para revelar</p>
                  </>
                ) : (
                  <>
                    {player.role === "Impostor" ? (
                      <>
                        <div className="text-6xl mb-4">🕵️</div>
                        <h3 className="text-2xl font-bold text-white mb-3 text-balance">{player.name}</h3>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
                          <p className="text-2xl font-black text-white tracking-wide">IMPOSTOR</p>
                        </div>
                        <p className="text-white/60 text-xs mt-3">Toca para ocultar</p>
                      </>
                    ) : (
                      <>
                        <div className="text-6xl mb-4">🎯</div>
                        <h3 className="text-2xl font-bold text-white mb-3 text-balance">{player.name}</h3>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
                          <p className="text-3xl font-black text-white tracking-wide">{player.role}</p>
                        </div>
                        <p className="text-white/60 text-xs mt-3">Toca para ocultar</p>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block bg-slate-800/50 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Cómo Jugar</h3>
            <ul className="text-indigo-300 space-y-1 text-left text-sm max-w-md">
              <li>• Cada jugador toca su carta una sola vez para ver su rol</li>
              <li>• Todos menos uno reciben la misma palabra</li>
              <li>
                • Uno de vosotros es el <span className="text-red-400 font-bold">Impostor</span>
              </li>
              <li>• Por turnos, describan la palabra sin revelarla</li>
              <li>• Descubran quién es el Impostor antes de que os descubra</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
