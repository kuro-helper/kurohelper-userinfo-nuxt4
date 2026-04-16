import { defineEventHandler, getQuery } from 'h3'
import type { ApiResponse, UserInWishDto } from '../../../app/types/user-api'
import { fetchUpstreamApi } from '../../utils/upstreamApi'

export default defineEventHandler(async (event): Promise<ApiResponse<UserInWishDto[]>> => {
  const query = getQuery(event)
  return fetchUpstreamApi<ApiResponse<UserInWishDto[]>>('/api/user/wish', query)
})
