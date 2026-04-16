import { defineEventHandler, getQuery } from 'h3'
import type { ApiResponse, UserHasPlayedDto } from '../../../app/types/user-api'
import { fetchUpstreamApi } from '../../utils/upstreamApi'

export default defineEventHandler(async (event): Promise<ApiResponse<UserHasPlayedDto[]>> => {
  const query = getQuery(event)
  return fetchUpstreamApi<ApiResponse<UserHasPlayedDto[]>>('/api/user/played', query)
})
