/** 與 kurohelper-api dto.UserGameStatus* 對齊 */
export const USER_GAME_STATUS = {
  NONE: 0,
  FINISHED: 1,
  PLAYING: 2,
  STALLED: 3,
  DROPPED: 4,
} as const

export type UserGameStatus = (typeof USER_GAME_STATUS)[keyof typeof USER_GAME_STATUS]

export const USER_GAME_STATUS_LABELS: Record<UserGameStatus, string> = {
  [USER_GAME_STATUS.NONE]: '沒有狀態',
  [USER_GAME_STATUS.FINISHED]: '遊玩完畢',
  [USER_GAME_STATUS.PLAYING]: '遊玩中',
  [USER_GAME_STATUS.STALLED]: '暫停遊玩',
  [USER_GAME_STATUS.DROPPED]: '放棄遊玩',
}

export function isUserGameFinished(status: number): boolean {
  return status === USER_GAME_STATUS.FINISHED
}
