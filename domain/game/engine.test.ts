import { describe, expect, it } from "vitest"

import { IMPOSTOR_ROLE } from "@/domain/game/constants"
import {
  buildRoles,
  createGameRound,
  pickFirstPlayer,
  pickRandomItem,
  resolveGameMode,
  shuffleArray,
} from "@/domain/game/engine"

function randomFromSequence(values: number[]) {
  let index = 0

  return () => {
    const value = values[index]

    if (value === undefined) {
      throw new Error(`Random sequence exhausted at position ${index}`)
    }

    index += 1
    return value
  }
}

describe("pickRandomItem", () => {
  it("returns the item selected by the injected random source", () => {
    const random = randomFromSequence([0.75])

    expect(pickRandomItem(["A", "B", "C", "D"], random)).toBe("D")
  })
})

describe("shuffleArray", () => {
  it("returns a shuffled copy without mutating the input", () => {
    const original = ["Ana", "Luis", "Marta", "Pablo"]
    const random = randomFromSequence([0.9, 0.1, 0.4])

    expect(shuffleArray(original, random)).toEqual(["Luis", "Marta", "Ana", "Pablo"])
    expect(original).toEqual(["Ana", "Luis", "Marta", "Pablo"])
  })
})

describe("pickFirstPlayer", () => {
  it("avoids repeating the current first player when possible", () => {
    const random = randomFromSequence([0.99])

    expect(pickFirstPlayer(["Ana", "Luis", "Marta"], "Luis", random)).toBe("Marta")
  })

  it("returns an empty string when there are no players", () => {
    expect(pickFirstPlayer([])).toBe("")
  })
})

describe("resolveGameMode", () => {
  it("keeps normal mode when crazy mode is disabled", () => {
    const random = randomFromSequence([0])

    expect(resolveGameMode(false, random)).toBe("normal")
  })

  it("selects a crazy mode when the probability check passes", () => {
    const random = randomFromSequence([0.1, 0.5])

    expect(resolveGameMode(true, random)).toBe("one-innocent")
  })
})

describe("buildRoles", () => {
  it("assigns a single impostor in normal mode", () => {
    const random = randomFromSequence([0.34])

    expect(buildRoles(["Ana", "Luis", "Marta"], "Playa", "normal", random)).toEqual([
      "Playa",
      IMPOSTOR_ROLE,
      "Playa",
    ])
  })

  it("assigns a single innocent in one-innocent mode", () => {
    const random = randomFromSequence([0.34])

    expect(buildRoles(["Ana", "Luis", "Marta"], "Playa", "one-innocent", random)).toEqual([
      IMPOSTOR_ROLE,
      "Playa",
      IMPOSTOR_ROLE,
    ])
  })

  it("supports rounds with no impostor or all impostors", () => {
    expect(buildRoles(["Ana", "Luis"], "Playa", "no-impostor")).toEqual(["Playa", "Playa"])
    expect(buildRoles(["Ana", "Luis"], "Playa", "all-impostors")).toEqual([
      IMPOSTOR_ROLE,
      IMPOSTOR_ROLE,
    ])
  })
})

describe("createGameRound", () => {
  it("creates a deterministic normal round with shuffled seats and roles", () => {
    const random = randomFromSequence([
      0, // selected word => Playa
      0.7, 0.1, // shuffle players
      0.9, // impostor index
      0.4, 0.8, // shuffle roles
      0.2, // first player among players excluding current first player
    ])

    const round = createGameRound(["Ana", "Luis", "Marta"], false, "Luis", random)

    expect(round).toEqual({
      mode: "normal",
      firstPlayer: "Ana",
      players: [
        { name: "Luis", role: "Playa", revealed: false },
        { name: "Ana", role: IMPOSTOR_ROLE, revealed: false },
        { name: "Marta", role: "Playa", revealed: false },
      ],
    })
  })

  it("can create a deterministic crazy round", () => {
    const random = randomFromSequence([
      0, // selected word => Playa
      0.2, 0.1, // shuffle players
      0.1, // crazy probability check => special mode
      0.9, // crazy mode => no-impostor
      0.7, 0.3, // shuffle roles (all still Playa)
      0.4, // first player
    ])

    const round = createGameRound(["Ana", "Luis", "Marta"], true, undefined, random)

    expect(round.mode).toBe("no-impostor")
    expect(round.players).toHaveLength(3)
    expect(round.players.every((player) => player.role === "Playa" && !player.revealed)).toBe(true)
    expect(round.players.map((player) => player.name).sort()).toEqual(["Ana", "Luis", "Marta"])
    expect(round.players.map((player) => player.name)).toContain(round.firstPlayer)
  })
})
