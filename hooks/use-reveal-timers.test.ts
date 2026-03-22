// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useState } from "react"

import { REVEAL_DURATION_SECONDS } from "@/domain/game/constants"
import type { Player } from "@/domain/game/types"
import { useRevealTimers } from "@/hooks/use-reveal-timers"

function createPlayers(): Player[] {
  return [
    { name: "Ana", role: "Playa", revealed: false },
    { name: "Luis", role: "Impostor", revealed: false },
  ]
}

function renderUseRevealTimers(initialPlayers: Player[] = createPlayers()) {
  return renderHook(() => {
    const [players, setPlayers] = useState(initialPlayers)
    const revealTimers = useRevealTimers(setPlayers)

    return {
      players,
      setPlayers,
      ...revealTimers,
    }
  })
}

describe("useRevealTimers", () => {
  it("reveals a card, counts down, and hides it automatically when the timer expires", () => {
    vi.useFakeTimers()

    const { result } = renderUseRevealTimers()

    act(() => {
      result.current.toggleCard(0)
    })

    expect(result.current.players[0]?.revealed).toBe(true)
    expect(result.current.timers[0]).toBe(REVEAL_DURATION_SECONDS)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.timers[0]).toBe(REVEAL_DURATION_SECONDS - 1)
    expect(result.current.players[0]?.revealed).toBe(true)

    act(() => {
      vi.advanceTimersByTime((REVEAL_DURATION_SECONDS - 1) * 1000)
    })

    expect(result.current.players[0]?.revealed).toBe(false)
    expect(result.current.timers[0]).toBeUndefined()

    vi.useRealTimers()
  })

  it("clears the timer immediately when the same card is hidden manually", () => {
    vi.useFakeTimers()

    const { result } = renderUseRevealTimers()

    act(() => {
      result.current.toggleCard(1)
    })

    expect(result.current.players[1]?.revealed).toBe(true)
    expect(result.current.timers[1]).toBe(REVEAL_DURATION_SECONDS)

    act(() => {
      result.current.toggleCard(1)
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.players[1]?.revealed).toBe(false)
    expect(result.current.timers[1]).toBeUndefined()

    vi.useRealTimers()
  })

  it("clearAllTimers resets countdown state and leaves cards ready for a new round", () => {
    vi.useFakeTimers()

    const { result } = renderUseRevealTimers()

    act(() => {
      result.current.toggleCard(0)
      result.current.toggleCard(1)
    })

    expect(result.current.timers).toEqual({
      0: REVEAL_DURATION_SECONDS,
      1: REVEAL_DURATION_SECONDS,
    })

    act(() => {
      result.current.clearAllTimers()
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.timers).toEqual({})
    expect(result.current.players[0]?.revealed).toBe(true)
    expect(result.current.players[1]?.revealed).toBe(true)

    vi.useRealTimers()
  })
})
