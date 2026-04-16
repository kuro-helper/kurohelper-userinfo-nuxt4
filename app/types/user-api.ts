export type ApiResponse<T> = {
  message: string
  data: T
}

export type UserItem = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type UserHasPlayedDto = {
  userId: string
  gameErogsId: number
  completedAt?: string | null
  createdAt: string
  gameId: number
  brandId: number
  gameName: string
  gameimage: string
  brandName: string
  disband: boolean
  brandGameCount: number
}

export type UserInWishDto = {
  userId: string
  gameErogsId: number
  createdAt: string
  gameId: number
  brandId: number
  gameName: string
  gameimage: string
  brandName: string
  disband: boolean
  brandGameCount: number
}

export type ApiErrorResponse = {
  message?: string
  data?: null
}

export type FetchErrorData = {
  error?: string
  message?: string
} | null

export type FetchErrorLike = {
  statusCode?: number
  status?: number
  statusText?: string
  statusMessage?: string
  message?: string
  data?: ApiErrorResponse | FetchErrorData
}
