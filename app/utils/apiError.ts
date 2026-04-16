import type { FetchErrorLike } from '~/types/user-api'

export const throwApiError = (err: unknown): never => {
  const e = err as FetchErrorLike | null | undefined
  const responseMessage = e?.data && typeof e.data === 'object' && 'message' in e.data
    ? e.data.message
    : ''
  const fallbackMessage = typeof e?.message === 'string'
    ? e.message
    : (typeof e?.statusText === 'string' ? e.statusText : '')
  const message = typeof responseMessage === 'string' && responseMessage.length > 0
    ? responseMessage
    : fallbackMessage

  throw createError({
    status: e?.status ?? e?.statusCode ?? 500,
    statusText: message || e?.statusText || e?.statusMessage || '發生未知錯誤'
  })
}
