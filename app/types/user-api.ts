export type ApiResponse<T> = {
  message: string
  data: T
}

export type UserItem = {
  id: number
  name: string
  discordId: string
  role: number
  createdAt: string
  updatedAt: string
}

export type UserGameBrandErogsDto = {
  id: number
  name: string
  disband: boolean
  gameCount: number
  createdAt: string
  updatedAt: string
}

export type UserGameErogsDto = {
  id: number
  brandErogsId: number
  name: string
  image: string
  createdAt: string
  updatedAt: string
  brandErogs?: UserGameBrandErogsDto
}

export type UserGameDto = {
  userId: number
  gameErogsId: number
  status: number
  wishListMark: boolean
  blackListMark: boolean
  startDate?: string | null
  finishedDate?: string | null
  createdAt: string
  updatedAt: string
  gameErogs?: UserGameErogsDto
}

export type UserProfileDto = {
  id: number
  name: string
  discordId: string
  avatar: string
  description: string
  role: number
  createdAt: string
  updatedAt: string
}

export type GetUserGameDto = {
  user: UserProfileDto
  games: UserGameDto[]
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
