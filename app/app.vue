<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const isSolidPage = computed(() =>
  route.path.startsWith('/user/')
)
const showTagCanvas = computed(() => !isSolidPage.value)

const { isDark, toggleTheme } = useAppTheme()

const onBackgroundTagClick = (tag: { text: string; value: string }) => {
  const userId = tag.value.trim()
  if (!userId) return

  navigateTo(`/user/${encodeURIComponent(userId)}`)
}
</script>

<template>
  <v-app>
    <NuxtRouteAnnouncer />
    <UserTagCanvas v-if="showTagCanvas" :dark="isDark" @tag-click="onBackgroundTagClick" />
    <v-main class="app-main" :class="{ 'app-main--solid': isSolidPage }">
      <NuxtPage :is-dark="isDark" :toggle-theme="toggleTheme" />
    </v-main>
  </v-app>
</template>

<style scoped>
.app-main {
  min-height: 100vh;
  position: relative;
  z-index: 3;
  background: transparent !important;
  pointer-events: none;
}

.app-main--solid {
  background: rgb(var(--v-theme-background)) !important;
  pointer-events: auto;
}
</style>
