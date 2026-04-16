import { defineEventHandler, getQuery } from 'h3'
import type { ApiResponse, UserItem } from '../../app/types/user-api'
import { fetchUpstreamApi } from '../utils/upstreamApi'

export default defineEventHandler(async (event): Promise<ApiResponse<UserItem[]>> => {
  const query = getQuery(event)
  return fetchUpstreamApi<ApiResponse<UserItem[]>>('/api/user', query)
})
