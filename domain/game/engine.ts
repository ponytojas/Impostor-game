import { palabrasJuego } from "@/lib/words"
import {
  CRAZY_MODE_PROBABILITY,
  IMPOSTOR_ROLE,
} from "@/domain/game/constants"
import type { GameMode, GameRound, Player } from "@/domain/game/types"

const CRAZY_GAME_MODES: Exclude<GameMode, "normal">[] = [
  "all-impostors",
  "one-innocent",
  "no-impostor",
]

export function pickRandomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function shuffleArray<T>(items: readonly T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5)
}

export function pickFirstPlayer(names: string[], current?: string): string {
  if (names.length === 0) return ""
  if (names.length === 1) return names[0]

  const options = current ? names.filter((name) => name !== current) : names
  return pickRandomItem(options.length ? options : names)
}

export function resolveGameMode(crazyMode: boolean): GameMode {
  if (crazyMode && Math.random() < CRAZY_MODE_PROBABILITY) {
    return pickRandomItem(CRAZY_GAME_MODES)
  }

  return "normal"
}

export function buildRoles(names: string[], selectedWord: string, mode: GameMode): string[] {
  const roles = names.map(() => selectedWord)

  if (mode === "all-impostors") {
    return names.map(() => IMPOSTOR_ROLE)
  }

  if (mode === "one-innocent") {
    const innocentIndex = Math.floor(Math.random() * roles.length)
    roles[innocentIndex] = selectedWord
    return roles.map((_, index) => (index === innocentIndex ? selectedWord : IMPOSTOR_ROLE))
  }

  if (mode === "no-impostor") {
    return roles
  }

  const impostorIndex = Math.floor(Math.random() * roles.length)
  roles[impostorIndex] = IMPOSTOR_ROLE
  return roles
}

export function createGameRound(playerNames: string[], crazyMode: boolean, currentFirstPlayer?: string): GameRound {
  const selectedWord = pickRandomItem(palabrasJuego)
  const shuffledNames = shuffleArray(playerNames)
  const mode = resolveGameMode(crazyMode)
  const roles = shuffleArray(buildRoles(shuffledNames, selectedWord, mode))

  const players: Player[] = shuffledNames.map((name, index) => ({
    name,
    role: roles[index],
    revealed: false,
  }))

  return {
    mode,
    players,
    firstPlayer: pickFirstPlayer(shuffledNames, currentFirstPlayer),
  }
}
