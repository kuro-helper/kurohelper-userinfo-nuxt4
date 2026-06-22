import { defineEventHandler, getQuery, getRouterParam } from 'h3'

import { fetchUpstreamApi } from './upstreamApi'

export const forwardGet = <T>(upstreamPath: string) =>
  defineEventHandler((event): Promise<T> => fetchUpstreamApi<T>(upstreamPath, getQuery(event)))

export const forwardGetByRouterParam = <T>(
  buildUpstreamPath: (param: string) => string,
  paramName = 'id',
) =>
  defineEventHandler((event): Promise<T> => {
    const param = String(getRouterParam(event, paramName) ?? '').trim()
    return fetchUpstreamApi<T>(buildUpstreamPath(param), {})
  })
