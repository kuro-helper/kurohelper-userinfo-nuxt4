import type { ApiResponse, GetUserGameDto } from '../../../../app/types/user-api'
import { forwardGetByRouterParam } from '../../../utils/forwardUpstream'

export default forwardGetByRouterParam<ApiResponse<GetUserGameDto>>(
  (id) => `/api/user/${encodeURIComponent(id)}/game`,
)
