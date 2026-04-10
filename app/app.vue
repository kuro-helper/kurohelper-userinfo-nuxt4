<script setup lang="ts">
import { ref } from 'vue'

const snackbarVisible = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

const { isDark, toggleTheme } = useAppTheme()

const onBackgroundTagClick = (tag: { text: string }) => {
  const userId = tag.text.trim()
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
    <UserTagCanvas :dark="isDark" @tag-click="onBackgroundTagClick" />
    <v-main class="app-main">
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
</style>
