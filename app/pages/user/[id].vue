<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useDisplay } from 'vuetify'
import { throwApiError } from '~/utils/apiError'
import type {
  ApiResponse,
  FetchErrorLike,
  UserHasPlayedDto,
  UserInWishDto,
  UserItem
} from '~/types/user-api'
const props = defineProps<{
  isDark?: boolean
  toggleTheme?: () => void
}>()

const route = useRoute()
const userId = computed(() => String(route.params.id ?? ''))
const display = useDisplay()

const emptyApiResponse = <T,>(data: T): ApiResponse<T> => ({
  message: '',
  data
})

const userQuery = computed(() => ({ id: userId.value }))
const {
  data: userResponse,
  pending: userPending,
  status: userStatus,
  error: userError
} = useFetch<ApiResponse<UserItem[]>, FetchErrorLike>('/api/user', {
  method: 'GET',
  query: userQuery,
  default: () => emptyApiResponse<UserItem[]>([]),
  watch: [userId]
})

watchEffect(() => {
  if (userError.value) {
    throwApiError(userError.value)
  }
})

const apiUser = computed(() => {
  const list = Array.isArray(userResponse.value?.data) ? userResponse.value.data : []
  return list[0] ?? null
})

const userName = computed(() => {
  const apiName = String(apiUser.value?.name ?? '').trim()
  return apiName || `使用者 ${userId.value}`
})
const fmtDate = (input?: string | null) => {
  if (!input) return ''
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return String(input)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const EROGAMESCAPE_GAME_URL = 'https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/game.php'

const openErogameScapeGame = (gameId: number) => {
  const url = `${EROGAMESCAPE_GAME_URL}?game=${gameId}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

const joinedAt = computed(() => fmtDate(apiUser.value?.createdAt ?? ''))
const updatedAt = computed(() => fmtDate(apiUser.value?.updatedAt ?? ''))
const playedErrorMessage = ref('')
const wishErrorMessage = ref('')

const toStatusCodeMessage = (err: unknown) => {
  const e = err as FetchErrorLike | null | undefined
  const code = e?.status ?? e?.statusCode ?? 500
  const responseMessage = e?.data && typeof e.data === 'object' && 'message' in e.data
    ? e.data.message
    : ''
  const fallbackMessage = typeof e?.message === 'string'
    ? e.message
    : (typeof e?.statusText === 'string' ? e.statusText : '')
  const message = typeof responseMessage === 'string' && responseMessage.length > 0
    ? responseMessage
    : (fallbackMessage || e?.statusMessage || '發生未知錯誤')
  return `${code}-${message}`
}

const fetchUserPlayed = async () => {
  const response = await $fetch<ApiResponse<UserHasPlayedDto[]>>('/api/user/played', {
    method: 'GET',
    query: { id: userId.value },
    retry: 0
  })
  return (response.data ?? []) as UserHasPlayedDto[]
}

const fetchUserWish = async () => {
  const response = await $fetch<ApiResponse<UserInWishDto[]>>('/api/user/wish', {
    method: 'GET',
    query: { id: userId.value },
    retry: 0
  })
  return (response.data ?? []) as UserInWishDto[]
}

const columns = computed(() => {
  if (display.lgAndUp.value) return 3
  if (display.smAndUp.value) return 2
  return 1
})
const pageSize = computed(() => columns.value * 2) // 最多兩排

const chunk = <T,>(items: T[], size: number) => {
  if (size <= 0) return []
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

const playedPage = ref(0)
const wishPage = ref(0)

const playedGames = ref<UserHasPlayedDto[]>([])
const wishGames = ref<UserInWishDto[]>([])
const playedPending = ref(false)
const wishPending = ref(false)

const playedPages = computed(() => chunk(playedGames.value ?? [], pageSize.value))
watchEffect(() => {
  if (playedPage.value > Math.max(0, playedPages.value.length - 1)) playedPage.value = 0
})

const loadPlayed = async () => {
  playedPending.value = true
  playedErrorMessage.value = ''
  try {
    playedGames.value = await fetchUserPlayed()
  } catch (e) {
    playedGames.value = []
    playedErrorMessage.value = toStatusCodeMessage(e)
  } finally {
    playedPending.value = false
  }
}

const loadWish = async () => {
  wishPending.value = true
  wishErrorMessage.value = ''
  try {
    wishGames.value = await fetchUserWish()
  } catch (e) {
    wishGames.value = []
    wishErrorMessage.value = toStatusCodeMessage(e)
  } finally {
    wishPending.value = false
  }
}

const wishPages = computed(() => chunk(wishGames.value ?? [], pageSize.value))
watchEffect(() => {
  if (wishPage.value > Math.max(0, wishPages.value.length - 1)) wishPage.value = 0
})

const canFetchRelated = computed(() =>
  userStatus.value === 'success' &&
  !!apiUser.value &&
  apiUser.value.id === userId.value
)
const relatedFetchedForUserId = ref('')

watchEffect(() => {
  // 強制流程：只有 user 成功且 id 完全對上當前頁面，才抓 played/wish
  if (canFetchRelated.value) {
    if (relatedFetchedForUserId.value === userId.value) return
    // SSR 與 client 各會跑一次 watchEffect，避免同一 API 被請求兩次
    if (typeof window === 'undefined') return

    relatedFetchedForUserId.value = userId.value
    void loadPlayed()
    void loadWish()
    return
  }

  // 無 user（404、pending、id 不匹配）時，不發送 played/wish 並清空畫面資料
  relatedFetchedForUserId.value = ''
  playedGames.value = []
  wishGames.value = []
  playedErrorMessage.value = ''
  wishErrorMessage.value = ''
  playedPage.value = 0
  wishPage.value = 0
})
</script>

<template>
  <div class="profile-page">
    <v-container class="py-6 py-md-10" max-width="960">
      <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
        <v-btn
          color="primary"
          variant="tonal"
          rounded="xl"
          prepend-icon="mdi-arrow-left"
          @click="navigateTo('/')"
        >
          回登入頁
        </v-btn>
        <v-btn
          variant="text"
          prepend-icon="mdi-theme-light-dark"
          @click="props.toggleTheme?.()"
        >
          {{ props.isDark ? '亮色' : '深色' }} 主題
        </v-btn>
      </div>

      <div v-if="userPending || userStatus === 'idle'" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="primary" size="40" />
      </div>
      <template v-else-if="apiUser">
        <!-- 區塊一：使用者詳細資料 -->
        <section class="mb-10">
          <h1 class="text-h5 font-weight-bold mb-4">使用者詳細資料</h1>
          <v-card rounded="xl" elevation="4" class="profile-card overflow-hidden">
            <v-row no-gutters class="flex-column flex-md-row">
              <v-col cols="12" md="auto" class="pa-6 pa-md-8 d-flex justify-center bg-surface-variant">
                <v-avatar size="120" rounded="lg" color="primary" class="text-h3 font-weight-bold">
                  {{ userId.slice(0, 2) || '?' }}
                </v-avatar>
              </v-col>
              <v-col class="pa-6 pa-md-8">
                <div class="user-name mb-6">{{ userName }}</div>

                <v-row density="comfortable">
                  <v-col cols="12" sm="6">
                    <div class="detail-label">Discord / 帳號 ID</div>
                    <div class="detail-value text-truncate">{{ userId }}</div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="detail-label">註冊日期</div>
                    <div class="detail-value">{{ joinedAt }}</div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="detail-label">更新日期</div>
                    <div class="detail-value">{{ updatedAt }}</div>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card>
        </section>

        <!-- 區塊二：遊玩的遊戲 -->
        <section>
        <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-4">
          <h2 class="text-h5 font-weight-bold">遊玩的遊戲</h2>
          <div class="d-flex align-center ga-2">
            <v-chip v-if="playedPending" size="small" color="primary" variant="tonal">載入中</v-chip>
            <v-btn
              icon="mdi-chevron-left"
              variant="tonal"
              size="small"
              rounded="xl"
              :disabled="playedPage <= 0"
              @click="playedPage--"
            />
            <v-btn
              icon="mdi-chevron-right"
              variant="tonal"
              size="small"
              rounded="xl"
              :disabled="playedPage >= playedPages.length - 1"
              @click="playedPage++"
            />
          </div>
        </div>

        <v-alert
          v-if="playedErrorMessage"
          type="error"
          variant="tonal"
          density="comfortable"
          class="mb-2"
        >
          {{ playedErrorMessage }}
        </v-alert>
        <v-window v-else v-model="playedPage" class="carousel-window" :touch="false">
          <v-window-item v-for="(page, pageIndex) in playedPages" :key="`played-page-${pageIndex}`">
            <div class="carousel-grid" :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }">
              <v-card
                v-for="game in page"
                :key="`${game.gameErogsId}-${game.createdAt}`"
                rounded="xl"
                elevation="3"
                class="game-card game-card--clickable d-flex flex-column"
                role="link"
                tabindex="0"
                :aria-label="`在批評空間開啟：${game.gameName}`"
                @click="openErogameScapeGame(game.gameId)"
                @keydown.enter.prevent="openErogameScapeGame(game.gameId)"
              >
                <v-img :src="game.gameimage" height="160" cover class="flex-shrink-0">
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-surface-variant">
                      <v-progress-circular indeterminate color="primary" size="32" />
                    </div>
                  </template>
                </v-img>
                <v-card-item class="flex-grow-1">
                  <v-card-title class="game-title pa-0" :title="game.gameName">{{ game.gameName }}</v-card-title>
                  <v-card-subtitle class="game-subtitle pa-0 mt-2">
                    <div class="game-brand text-medium-emphasis" :title="game.brandName">{{ game.brandName }}</div>
                    <div class="game-tags mt-1">
                      <v-chip size="x-small" color="secondary" variant="tonal">GameID {{ game.gameId }}</v-chip>
                      <v-chip v-if="game.completedAt" size="x-small" color="success" variant="tonal">
                        完成 {{ fmtDate(game.completedAt) }}
                      </v-chip>
                    </div>
                  </v-card-subtitle>
                </v-card-item>
              </v-card>
            </div>
          </v-window-item>
        </v-window>

        <div v-if="!playedPending && !playedErrorMessage && playedPages.length === 0" class="text-medium-emphasis">
          目前沒有遊玩資料。
        </div>
        </section>

        <!-- 區塊三：願望清單 -->
        <section class="mt-10">
        <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-4">
          <h2 class="text-h5 font-weight-bold">願望清單</h2>
          <div class="d-flex align-center ga-2">
            <v-chip v-if="wishPending" size="small" color="primary" variant="tonal">載入中</v-chip>
            <v-btn
              icon="mdi-chevron-left"
              variant="tonal"
              size="small"
              rounded="xl"
              :disabled="wishPage <= 0"
              @click="wishPage--"
            />
            <v-btn
              icon="mdi-chevron-right"
              variant="tonal"
              size="small"
              rounded="xl"
              :disabled="wishPage >= wishPages.length - 1"
              @click="wishPage++"
            />
          </div>
        </div>

        <v-alert
          v-if="wishErrorMessage"
          type="error"
          variant="tonal"
          density="comfortable"
          class="mb-2"
        >
          {{ wishErrorMessage }}
        </v-alert>
        <v-window v-else v-model="wishPage" class="carousel-window" :touch="false">
          <v-window-item v-for="(page, pageIndex) in wishPages" :key="`wish-page-${pageIndex}`">
            <div class="carousel-grid" :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }">
              <v-card
                v-for="game in page"
                :key="`${game.gameErogsId}-${game.createdAt}`"
                rounded="xl"
                elevation="3"
                class="game-card game-card--clickable d-flex flex-column"
                role="link"
                tabindex="0"
                :aria-label="`在批評空間開啟：${game.gameName}`"
                @click="openErogameScapeGame(game.gameId)"
                @keydown.enter.prevent="openErogameScapeGame(game.gameId)"
              >
                <v-img :src="game.gameimage" height="160" cover class="flex-shrink-0">
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-surface-variant">
                      <v-progress-circular indeterminate color="primary" size="32" />
                    </div>
                  </template>
                </v-img>
                <v-card-item class="flex-grow-1">
                  <v-card-title class="game-title pa-0" :title="game.gameName">{{ game.gameName }}</v-card-title>
                  <v-card-subtitle class="game-subtitle pa-0 mt-2">
                    <div class="game-brand text-medium-emphasis" :title="game.brandName">{{ game.brandName }}</div>
                    <div class="game-tags mt-1">
                      <v-chip size="x-small" color="secondary" variant="tonal">GameID {{ game.gameId }}</v-chip>
                      <v-chip size="x-small" color="primary" variant="tonal">加入 {{ fmtDate(game.createdAt) }}</v-chip>
                    </div>
                  </v-card-subtitle>
                </v-card-item>
              </v-card>
            </div>
          </v-window-item>
        </v-window>

        <div v-if="!wishPending && !wishErrorMessage && wishPages.length === 0" class="text-medium-emphasis">
          目前沒有願望清單資料。
        </div>
        </section>
      </template>
    </v-container>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  pointer-events: auto;
}

.profile-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.detail-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(var(--v-theme-on-surface), 0.82);
  margin-bottom: 2px;
  font-weight: 600;
}

.detail-value {
  font-size: 1rem;
  font-weight: 500;
}

.user-name {
  font-size: clamp(1.5rem, 2.4vw, 2rem);
  line-height: 1.2;
  font-weight: 700;
}

.game-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  height: 100%;
}

.game-card--clickable {
  cursor: pointer;
}

.game-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18) !important;
  transform: translateY(-2px);
}

.carousel-window {
  overflow: hidden;
}

.carousel-grid {
  display: grid;
  grid-auto-rows: 1fr;
  gap: 16px;
  padding: 10px;
  box-sizing: border-box;
  align-items: stretch;
}

.game-title {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
  min-height: calc(1.25em * 2);
  letter-spacing: 0.01em;
}

.game-subtitle {
  line-height: 1.2;
  min-height: 2.8em;
  text-align: left;
}

.game-brand {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left;
}

.game-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-start;
}
</style>
