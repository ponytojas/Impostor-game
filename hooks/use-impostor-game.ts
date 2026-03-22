import { useState } from "react"

import { MIN_PLAYERS } from "@/domain/game/constants"
import { createGameRound, pickFirstPlayer } from "@/domain/game/engine"
import type { GameMode, GameStage, Player } from "@/domain/game/types"
import { useRevealTimers } from "@/hooks/use-reveal-timers"

type UseImpostorGameOptions = {
  onInvalidSetup?: (message: string) => void
}

export function useImpostorGame({ onInvalidSetup }: UseImpostorGameOptions = {}) {
  const [stage, setStage] = useState<GameStage>("setup")
  const [inputName, setInputName] = useState("")
  const [playerNames, setPlayerNames] = useState<string[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [firstPlayer, setFirstPlayer] = useState("")
  const [crazyMode, setCrazyMode] = useState(false)
  const [currentMode, setCurrentMode] = useState<GameMode>("normal")
  const { timers, toggleCard, clearAllTimers } = useRevealTimers(setPlayers)

  const addPlayer = () => {
    const normalizedName = inputName.trim()

    if (!normalizedName || playerNames.includes(normalizedName)) {
      return
    }

    setPlayerNames((currentNames) => [...currentNames, normalizedName])
    setInputName("")
  }

  const removePlayer = (name: string) => {
    setPlayerNames((currentNames) => currentNames.filter((currentName) => currentName !== name))
  }

  const applyRound = () => {
    const round = createGameRound(playerNames, crazyMode, firstPlayer)

    setCurrentMode(round.mode)
    setPlayers(round.players)
    setFirstPlayer(round.firstPlayer)

    return round
  }

  const startGame = () => {
    if (playerNames.length < MIN_PLAYERS) {
      onInvalidSetup?.(`Necesitas al menos ${MIN_PLAYERS} jugadores para jugar`)
      return false
    }

    clearAllTimers()
    applyRound()
    setStage("playing")
    return true
  }

  const resetGame = () => {
    clearAllTimers()
    setStage("setup")
    setPlayerNames([])
    setPlayers([])
    setInputName("")
    setFirstPlayer("")
    setCurrentMode("normal")
  }

  const newRound = () => {
    if (playerNames.length < MIN_PLAYERS) {
      return false
    }

    clearAllTimers()
    applyRound()
    return true
  }

  const shuffleFirstPlayer = () => {
    const names = players.length ? players.map((player) => player.name) : playerNames

    if (!names.length) {
      return
    }

    setFirstPlayer((currentFirstPlayer) => pickFirstPlayer(names, currentFirstPlayer))
  }

  return {
    stage,
    inputName,
    playerNames,
    players,
    firstPlayer,
    timers,
    crazyMode,
    currentMode,
    setInputName,
    setCrazyMode,
    addPlayer,
    removePlayer,
    startGame,
    toggleCard,
    resetGame,
    newRound,
    shuffleFirstPlayer,
  }
}
