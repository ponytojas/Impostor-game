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

type RandomSource = () => number

function toRandomIndex(length: number, random: RandomSource): number {
  return Math.floor(random() * length)
}

export function pickRandomItem<T>(items: readonly T[], random: RandomSource = Math.random): T {
  return items[toRandomIndex(items.length, random)]
}

export function shuffleArray<T>(items: readonly T[], random: RandomSource = Math.random): T[] {
  const shuffledItems = [...items]

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = toRandomIndex(index + 1, random)
    ;[shuffledItems[index], shuffledItems[swapIndex]] = [shuffledItems[swapIndex], shuffledItems[index]]
  }

  return shuffledItems
}

export function pickFirstPlayer(names: string[], current?: string, random: RandomSource = Math.random): string {
  if (names.length === 0) return ""
  if (names.length === 1) return names[0]

  const options = current ? names.filter((name) => name !== current) : names
  return pickRandomItem(options.length ? options : names, random)
}

export function resolveGameMode(crazyMode: boolean, random: RandomSource = Math.random): GameMode {
  if (crazyMode && random() < CRAZY_MODE_PROBABILITY) {
    return pickRandomItem(CRAZY_GAME_MODES, random)
  }

  return "normal"
}

export function buildRoles(
  names: string[],
  selectedWord: string,
  mode: GameMode,
  random: RandomSource = Math.random,
): string[] {
  const roles = names.map(() => selectedWord)

  if (mode === "all-impostors") {
    return names.map(() => IMPOSTOR_ROLE)
  }

  if (mode === "one-innocent") {
    const innocentIndex = toRandomIndex(roles.length, random)
    return roles.map((_, index) => (index === innocentIndex ? selectedWord : IMPOSTOR_ROLE))
  }

  if (mode === "no-impostor") {
    return roles
  }

  const impostorIndex = toRandomIndex(roles.length, random)
  roles[impostorIndex] = IMPOSTOR_ROLE
  return roles
}

export function createGameRound(
  playerNames: string[],
  crazyMode: boolean,
  currentFirstPlayer?: string,
  random: RandomSource = Math.random,
): GameRound {
  const selectedWord = pickRandomItem(palabrasJuego, random)
  const shuffledNames = shuffleArray(playerNames, random)
  const mode = resolveGameMode(crazyMode, random)
  const roles = shuffleArray(buildRoles(shuffledNames, selectedWord, mode, random), random)

  const players: Player[] = shuffledNames.map((name, index) => ({
    name,
    role: roles[index],
    revealed: false,
  }))

  return {
    mode,
    players,
    firstPlayer: pickFirstPlayer(shuffledNames, currentFirstPlayer, random),
  }
}
