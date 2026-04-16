<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { throwApiError } from '~/utils/apiError'

/*
 * 全螢幕背景：對角漂移的數字膠囊。hover 暫停動畫；click 對外 emit `text` 供路由用。
 * 圖層在 v-main 之下（z-index:2）；上層需設 pointer-events:none 才能把事件傳到膠囊（見下方樣式）。
 */

interface NumberTag {
  id: number
  label: string
  value: string
  x: number
  y: number
  width: number
  height: number
  vx: number
  vy: number
  opacity: number
  hue: number
}

interface UserItem {
  id: string
  name: string
}

interface UserApiResponse {
  data?: UserItem[]
}

/** 對角線方向：right-top → left-bottom 等，決定出生邊緣與速度正負。 */
type DirectionMode = 'rt-lb' | 'lb-rt' | 'lt-rb' | 'rb-lt'

const DIRECTIONS: DirectionMode[] = ['rt-lb', 'lb-rt', 'lt-rb', 'rb-lt']

const props = defineProps<{
  dark?: boolean
  density?: number
}>()

const emit = defineEmits<{
  tagClick: [payload: { text: string; value: string }]
}>()

const tags = ref<NumberTag[]>([])
const apiUsers = ref<UserItem[]>([])
/** hover 中的膠囊不參與 tick 位移，方便點擊與閱讀。 */
const pausedTagIds = ref<Set<number>>(new Set())
let animationId = 0
let resizeRafId = 0
let viewportWidth = 0
let viewportHeight = 0
/** 單調遞增 id，供 :key 與暫停用 Set 對應，避免列表重排時狀態錯亂。 */
let counter = 0
const density = props.density ?? 18
const runtimeConfig = useRuntimeConfig()

/**
 * @param spawnInsideViewport 初次載入在視窗內散佈；出界重生時在視窗外側生成再飛入。
 */
const buildTag = (
  width: number,
  height: number,
  direction: DirectionMode,
  spawnInsideViewport = false,
  user: UserItem
): NumberTag => {
  const label = user.name
  const value = user.id
  if (!label.length || !value.length) {
    throw new Error('Tag label and value are required')
  }

  const n1 = Math.random()
  const n2 = Math.random()
  const n3 = Math.random()
  const n4 = Math.random()
  const textWidth = Math.max(72, label.length * 13)
  const tagWidth = textWidth + 48
  const tagHeight = 46
  const speed = 0.78 + n1 * 0.75
  const offset = 260

  const speedX = speed
  const speedY = speed * 0.72

  const spawnOutside = () => {
    switch (direction) {
      case 'rt-lb':
        return {
          x: width + n2 * offset,
          y: -tagHeight - n3 * offset
        }
      case 'lb-rt':
        return {
          x: -tagWidth - n2 * offset,
          y: height + n3 * offset
        }
      case 'lt-rb':
        return {
          x: -tagWidth - n2 * offset,
          y: -tagHeight - n3 * offset
        }
      case 'rb-lt':
        return {
          x: width + n2 * offset,
          y: height + n3 * offset
        }
    }
  }

  const outside = spawnOutside()
  const x = spawnInsideViewport ? n2 * Math.max(1, width - tagWidth) : outside.x
  const y = spawnInsideViewport ? n3 * Math.max(1, height - tagHeight) : outside.y

  const velocity = (() => {
    switch (direction) {
      case 'rt-lb':
        return { vx: -speedX, vy: speedY }
      case 'lb-rt':
        return { vx: speedX, vy: -speedY }
      case 'lt-rb':
        return { vx: speedX, vy: speedY }
      case 'rb-lt':
        return { vx: -speedX, vy: -speedY }
    }
  })()

  return {
    id: counter++,
    label,
    value,
    x,
    y,
    width: tagWidth,
    height: tagHeight,
    vx: velocity.vx,
    vy: velocity.vy,
    opacity: 0.42 + n4 * 0.33,
    hue: Math.floor(n1 * 360)
  }
}

const updateViewport = () => {
  viewportWidth = Math.max(1, window.innerWidth)
  viewportHeight = Math.max(1, window.innerHeight)
}

const resetTags = () => {
  const sourceUsers = apiUsers.value
  if (sourceUsers.length === 0) {
    tags.value = []
    return
  }

  const next: NumberTag[] = []
  for (let i = 0; i < density; i++) {
    const direction = DIRECTIONS[i % DIRECTIONS.length]!
    const user = sourceUsers[i % sourceUsers.length]!
    next.push(buildTag(viewportWidth, viewportHeight, direction, true, user))
  }
  tags.value = next
}

const fetchUserNumbers = async () => {
  try {
    const baseUrl = String(runtimeConfig.public.apiBaseUrl || '').replace(/\/+$/, '')
    if (!baseUrl) {
      apiUsers.value = []
      tags.value = []
      return
    }

    const response = await $fetch<UserApiResponse>('/api/user', {
      baseURL: baseUrl,
      method: 'GET'
    })
    const nextUsers = (response.data ?? []).filter(
      (user): user is UserItem =>
        typeof user?.id === 'string' &&
        user.id.length > 0 &&
        typeof user?.name === 'string' &&
        user.name.length > 0
    )
    apiUsers.value = nextUsers
    if (nextUsers.length === 0) {
      tags.value = []
    }
  } catch (error) {
    throwApiError(error)
  }
}

const tick = () => {
  const width = viewportWidth
  const height = viewportHeight
  const updated = tags.value.map((tag, index) => {
    if (pausedTagIds.value.has(tag.id)) {
      return tag
    }

    const direction = DIRECTIONS[index % DIRECTIONS.length]!
    const x = tag.x + tag.vx
    const y = tag.y + tag.vy
    // 留白緩衝，完全離屏後才重生，避免邊緣閃爍
    const outOfView =
      x + tag.width < -280 || x > width + 280 || y + tag.height < -280 || y > height + 280

    if (outOfView) {
      return buildTag(width, height, direction, false, { id: tag.value, name: tag.label })
    }

    return {
      ...tag,
      x,
      y
    }
  })
  tags.value = updated
  animationId = window.requestAnimationFrame(tick)
}

/** 依視窗比例縮放座標，維持相對位置。 */
const handleResize = () => {
  if (resizeRafId) {
    window.cancelAnimationFrame(resizeRafId)
  }
  resizeRafId = window.requestAnimationFrame(() => {
    const prevWidth = viewportWidth || window.innerWidth
    const prevHeight = viewportHeight || window.innerHeight
    updateViewport()
    const scaleX = viewportWidth / Math.max(1, prevWidth)
    const scaleY = viewportHeight / Math.max(1, prevHeight)
    tags.value = tags.value.map(tag => ({
      ...tag,
      x: tag.x * scaleX,
      y: tag.y * scaleY
    }))
    resizeRafId = 0
  })
}

const handleTagClick = (tag: NumberTag) => {
  emit('tagClick', { text: tag.value, value: tag.value })
}

const pauseTag = (tagId: number) => {
  pausedTagIds.value.add(tagId)
}

const resumeTag = (tagId: number) => {
  pausedTagIds.value.delete(tagId)
}

onMounted(async () => {
  updateViewport()
  await fetchUserNumbers()
  resetTags()
  tick()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (animationId) {
    window.cancelAnimationFrame(animationId)
  }
  if (resizeRafId) {
    window.cancelAnimationFrame(resizeRafId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="number-stream-layer" aria-hidden="true">
    <button
      v-for="tag in tags"
      :key="tag.id"
      class="number-pill"
      type="button"
      :style="{
        left: `${tag.x}px`,
        top: `${tag.y}px`,
        width: `${tag.width}px`,
        height: `${tag.height}px`,
        opacity: `${tag.opacity}`,
        '--pill-hue': `${tag.hue}`,
        '--pill-text': dark ? '248,250,252' : '30,41,59'
      }"
      @mouseenter="pauseTag(tag.id)"
      @mouseleave="resumeTag(tag.id)"
      @click="handleTagClick(tag)"
    >
      {{ tag.label }}
    </button>
  </div>
</template>

<style scoped>
.number-stream-layer {
  position: fixed;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  pointer-events: none;
}

.number-pill {
  position: absolute;
  border-radius: 999px;
  border: 1.6px solid hsla(var(--pill-hue), 86%, 68%, 0.78);
  background: hsla(var(--pill-hue), 80%, 58%, 0.38);
  color: rgb(var(--pill-text));
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  backdrop-filter: blur(4px);
  box-shadow: 0 6px 16px hsla(var(--pill-hue), 85%, 60%, 0.2);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
  pointer-events: auto;
  cursor: pointer;
}

.number-pill:hover {
  transform: translateY(-6px) scale(1.04);
  box-shadow: 0 12px 24px hsla(var(--pill-hue), 85%, 60%, 0.32);
  filter: saturate(1.1);
  animation: pill-float 1.2s ease-in-out infinite;
}

.number-pill:active {
  transform: translateY(-1px) scale(0.99);
  box-shadow: 0 4px 10px hsla(var(--pill-hue), 85%, 60%, 0.18);
}

@keyframes pill-float {
  0% {
    transform: translateY(-6px) scale(1.04);
  }
  50% {
    transform: translateY(-10px) scale(1.045);
  }
  100% {
    transform: translateY(-6px) scale(1.04);
  }
}
</style>
