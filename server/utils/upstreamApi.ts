import { createError } from 'h3'
import { consola } from 'consola'
import { useRuntimeConfig } from 'nitropack/runtime/internal/config'
import { $fetch } from 'ofetch'
import type { QueryObject, QueryValue } from 'ufo'

type UpstreamFetchError = {
  statusCode?: number
  status?: number
  data?: unknown
  message?: string
}

const messageForLog = (data: unknown, err: unknown): string => {
  if (data && typeof data === 'object' && 'message' in data) {
    const m = (data as { message: unknown }).message
    if (typeof m === 'string' && m.length > 0) return m
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message: unknown }).message
    if (typeof m === 'string' && m.length > 0) return m
  }
  return ''
}

const normalizeScalar = (value: QueryValue): string | undefined => {
  if (value === undefined || value === null) return undefined
  if (Array.isArray(value)) return undefined
  if (typeof value === 'object') return undefined
  return String(value)
}

const normalizeQuery = (query: QueryObject) => {
  const normalized: Record<string, string | string[]> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      const items = value
        .map((item) => normalizeScalar(item))
        .filter((item): item is string => typeof item === 'string' && item.length > 0)
      if (items.length > 0) normalized[key] = items
      continue
    }
    if (typeof value === 'object') continue
    const scalar = normalizeScalar(value)
    if (scalar !== undefined) normalized[key] = scalar
  }
  return normalized
}

export const fetchUpstreamApi = async <T>(path: string, query: QueryObject): Promise<T> => {
  const config = useRuntimeConfig()
  const baseURL = String(config.apiBaseUrl || '').replace(/\/+$/, '')
  const token = String(config.apiToken || '').trim()

  if (!baseURL) {
    throw createError({
      statusCode: 500,
      message: 'Missing API_BASE_URL configuration'
    })
  }

  if (!token) {
    throw createError({
      statusCode: 500,
      message: 'Missing API_TOKEN configuration'
    })
  }

  try {
    const data = await $fetch(path, {
      baseURL,
      method: 'GET',
      query: normalizeQuery(query),
      headers: {
        Authorization: `Bearer ${token}`
      },
      retry: 0
    })
    return data as T
  } catch (err) {
    const e = err as UpstreamFetchError
    const statusCode = e.statusCode ?? e.status ?? 502
    const data = e.data
    const detail = messageForLog(data, err) || '(no message)'
    consola.warn(`[BFF] ${path}`, `${statusCode}: ${detail}`)

    // Mirror direct client→API behavior: same status + same JSON body in `data`,
    // plus `message` (prefer over statusMessage for longer text per h3).
    const userMsg = messageForLog(data, err)
    throw createError({
      statusCode,
      ...(data !== undefined ? { data } : {}),
      ...(userMsg ? { message: userMsg } : {})
    })
  }
}
