// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { MIN_PLAYERS } from "@/domain/game/constants"
import type { GameRound } from "@/domain/game/types"
import { useImpostorGame } from "@/hooks/use-impostor-game"

const { createGameRoundMock, pickFirstPlayerMock } = vi.hoisted(() => ({
  createGameRoundMock: vi.fn<(
    playerNames: string[],
    crazyMode: boolean,
    currentFirstPlayer?: string,
  ) => GameRound>(),
  pickFirstPlayerMock: vi.fn<(names: string[], current?: string) => string>(),
}))

vi.mock("@/domain/game/engine", () => ({
  createGameRound: createGameRoundMock,
  pickFirstPlayer: pickFirstPlayerMock,
}))

const normalRound: GameRound = {
  mode: "normal",
  firstPlayer: "Ana",
  players: [
    { name: "Ana", role: "Playa", revealed: false },
    { name: "Luis", role: "Impostor", revealed: false },
    { name: "Marta", role: "Playa", revealed: false },
  ],
}

const crazyRound: GameRound = {
  mode: "one-innocent",
  firstPlayer: "Luis",
  players: [
    { name: "Ana", role: "Impostor", revealed: false },
    { name: "Luis", role: "Playa", revealed: false },
    { name: "Marta", role: "Impostor", revealed: false },
  ],
}

describe("useImpostorGame", () => {
  beforeEach(() => {
    createGameRoundMock.mockReset()
    pickFirstPlayerMock.mockReset()
    createGameRoundMock.mockReturnValue(normalRound)
    pickFirstPlayerMock.mockReturnValue("Marta")
  })

  it("blocks invalid setup and reports it through the callback", () => {
    const onInvalidSetup = vi.fn()
    const { result } = renderHook(() => useImpostorGame({ onInvalidSetup }))

    let started = true

    act(() => {
      started = result.current.startGame()
    })

    expect(started).toBe(false)
    expect(onInvalidSetup).toHaveBeenCalledWith(`Necesitas al menos ${MIN_PLAYERS} jugadores para jugar`)
    expect(createGameRoundMock).not.toHaveBeenCalled()
    expect(result.current.stage).toBe("setup")
  })

  it("starts a round, exposes round state, and can reshuffle the first player", () => {
    const { result } = renderHook(() => useImpostorGame())

    act(() => {
      result.current.setInputName(" Ana ")
    })
    act(() => {
      result.current.addPlayer()
    })
    act(() => {
      result.current.setInputName("Luis")
    })
    act(() => {
      result.current.addPlayer()
    })
    act(() => {
      result.current.setInputName("Marta")
    })
    act(() => {
      result.current.addPlayer()
    })
    act(() => {
      result.current.setCrazyMode(true)
    })

    let started = false

    act(() => {
      started = result.current.startGame()
    })

    expect(started).toBe(true)
    expect(createGameRoundMock).toHaveBeenCalledWith(["Ana", "Luis", "Marta"], true, "")
    expect(result.current.stage).toBe("playing")
    expect(result.current.players).toEqual(normalRound.players)
    expect(result.current.firstPlayer).toBe("Ana")
    expect(result.current.currentMode).toBe("normal")

    act(() => {
      result.current.shuffleFirstPlayer()
    })

    expect(pickFirstPlayerMock).toHaveBeenCalledWith(["Ana", "Luis", "Marta"], "Ana")
    expect(result.current.firstPlayer).toBe("Marta")
  })

  it("supports a fresh round and reset without dragging previous round state", () => {
    createGameRoundMock.mockReturnValueOnce(normalRound).mockReturnValueOnce(crazyRound)

    const { result } = renderHook(() => useImpostorGame())

    for (const name of ["Ana", "Luis", "Marta"]) {
      act(() => {
        result.current.setInputName(name)
      })
      act(() => {
        result.current.addPlayer()
      })
    }

    act(() => {
      result.current.startGame()
    })

    act(() => {
      result.current.newRound()
    })

    expect(createGameRoundMock).toHaveBeenNthCalledWith(1, ["Ana", "Luis", "Marta"], false, "")
    expect(createGameRoundMock).toHaveBeenNthCalledWith(2, ["Ana", "Luis", "Marta"], false, "Ana")
    expect(result.current.players).toEqual(crazyRound.players)
    expect(result.current.firstPlayer).toBe("Luis")
    expect(result.current.currentMode).toBe("one-innocent")
    expect(result.current.stage).toBe("playing")

    act(() => {
      result.current.resetGame()
    })

    expect(result.current.stage).toBe("setup")
    expect(result.current.playerNames).toEqual([])
    expect(result.current.players).toEqual([])
    expect(result.current.inputName).toBe("")
    expect(result.current.firstPlayer).toBe("")
    expect(result.current.currentMode).toBe("normal")
  })
})
