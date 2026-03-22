import { useCallback, useEffect, useRef, useState } from "react"
import type { Dispatch, SetStateAction } from "react"

import { REVEAL_DURATION_SECONDS } from "@/domain/game/constants"
import type { Player, TimerState } from "@/domain/game/types"

export function useRevealTimers(setPlayers: Dispatch<SetStateAction<Player[]>>) {
  const [timers, setTimers] = useState<TimerState>({})
  const intervalRefs = useRef<Record<number, NodeJS.Timeout>>({})

  const clearTimer = useCallback((index: number) => {
    const timer = intervalRefs.current[index]

    if (timer) {
      clearInterval(timer)
      delete intervalRefs.current[index]
    }
  }, [])

  const clearAllTimers = useCallback(() => {
    Object.values(intervalRefs.current).forEach(clearInterval)
    intervalRefs.current = {}
    setTimers({})
  }, [])

  const toggleCard = useCallback((index: number) => {
    setPlayers((currentPlayers) => {
      const updatedPlayers = [...currentPlayers]
      const player = updatedPlayers[index]

      if (!player) {
        return currentPlayers
      }

      const isRevealing = !player.revealed
      updatedPlayers[index] = { ...player, revealed: isRevealing }

      if (!isRevealing) {
        clearTimer(index)
        setTimers((previousTimers) => {
          const { [index]: _removed, ...rest } = previousTimers
          return rest
        })

        return updatedPlayers
      }

      clearTimer(index)
      setTimers((previousTimers) => ({ ...previousTimers, [index]: REVEAL_DURATION_SECONDS }))

      intervalRefs.current[index] = setInterval(() => {
        setTimers((previousTimers) => {
          const nextTime = (previousTimers[index] || 0) - 1

          if (nextTime <= 0) {
            clearTimer(index)
            setPlayers((playersAfterTimeout) => {
              const nextPlayers = [...playersAfterTimeout]
              const currentPlayer = nextPlayers[index]

              if (!currentPlayer) {
                return playersAfterTimeout
              }

              nextPlayers[index] = { ...currentPlayer, revealed: false }
              return nextPlayers
            })

            const { [index]: _expired, ...rest } = previousTimers
            return rest
          }

          return { ...previousTimers, [index]: nextTime }
        })
      }, 1000)

      return updatedPlayers
    })
  }, [clearTimer, setPlayers])

  useEffect(() => clearAllTimers, [clearAllTimers])

  return {
    timers,
    toggleCard,
    clearAllTimers,
  }
}
