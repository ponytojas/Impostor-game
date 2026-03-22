export const GAME_STAGES = ["setup", "playing"] as const
export type GameStage = (typeof GAME_STAGES)[number]

export const GAME_MODES = ["normal", "all-impostors", "one-innocent", "no-impostor"] as const
export type GameMode = (typeof GAME_MODES)[number]

export type Player = {
  name: string
  role: string
  revealed: boolean
}

export type TimerState = Record<number, number>

export type GameRound = {
  mode: GameMode
  players: Player[]
  firstPlayer: string
}
