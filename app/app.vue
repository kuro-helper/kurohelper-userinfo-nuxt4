<script setup lang="ts">
import { computed, ref } from 'vue'

const route = useRoute()
const showTagCanvas = computed(() => !route.path.startsWith('/user/'))

const snackbarVisible = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

const { isDark, toggleTheme } = useAppTheme()

const onBackgroundTagClick = (tag: { text: string; value: string }) => {
  const userId = tag.value.trim()
  if (!userId) return

  snackbarColor.value = 'success'
  snackbarMessage.value = `Redirecting to /user/${userId}`
  snackbarVisible.value = true
  navigateTo(`/user/${encodeURIComponent(userId)}`)
}
</script>

<template>
  <v-app>
    <NuxtRouteAnnouncer />
    <UserTagCanvas v-if="showTagCanvas" :dark="isDark" @tag-click="onBackgroundTagClick" />
    <v-main class="app-main" :class="{ 'app-main--solid': !showTagCanvas }">
      <NuxtPage :is-dark="isDark" :toggle-theme="toggleTheme" />
    </v-main>

    <v-snackbar v-model="snackbarVisible" :color="snackbarColor" timeout="2200">
      {{ snackbarMessage }}
    </v-snackbar>
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
