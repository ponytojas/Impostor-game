"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

import { PlayingScreen } from "@/components/game/playing-screen"
import { SetupScreen } from "@/components/game/setup-screen"
import { useImpostorGame } from "@/hooks/use-impostor-game"

export default function ImpostorGame() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme, theme } = useTheme()
  const {
    stage,
    inputName,
    playerNames,
    players,
    firstPlayer,
    timers,
    crazyMode,
    setInputName,
    setCrazyMode,
    addPlayer,
    removePlayer,
    startGame,
    toggleCard,
    resetGame,
    newRound,
    shuffleFirstPlayer,
  } = useImpostorGame({
    onInvalidSetup: (message) => alert(message),
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === "dark" : false
  const toggleTheme = () => setTheme(isDark ? "light" : "dark")
  const isSystemTheme = theme === "system"

  if (stage === "setup") {
    return (
      <SetupScreen
        inputName={inputName}
        playerNames={playerNames}
        crazyMode={crazyMode}
        isDark={isDark}
        isSystemTheme={isSystemTheme}
        onInputNameChange={setInputName}
        onCrazyModeChange={setCrazyMode}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
        onStartGame={startGame}
        onToggleTheme={toggleTheme}
      />
    )
  }

  return (
    <PlayingScreen
      players={players}
      firstPlayer={firstPlayer}
      timers={timers}
      isDark={isDark}
      isSystemTheme={isSystemTheme}
      onToggleTheme={toggleTheme}
      onShuffleFirstPlayer={shuffleFirstPlayer}
      onNewRound={newRound}
      onResetGame={resetGame}
      onToggleCard={toggleCard}
    />
  )
}
