<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => props.error?.status ?? 500)
const apiMessage = computed(() => props.error?.statusText || props.error?.message || '請稍後再試一次。')

const goHome = () => {
  clearError({ redirect: '/' })
}
</script>

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center error-main">
      <v-card class="error-card pa-4 text-center" width="520" rounded="xl" elevation="12">
        <v-card-title class="text-h4 font-weight-bold mb-2">{{ statusCode }}</v-card-title>
        <v-card-subtitle class="text-h6 mb-4">{{ apiMessage }}</v-card-subtitle>
        <v-card-actions class="justify-center">
          <v-btn color="primary" variant="flat" prepend-icon="mdi-home" @click="goHome">
            回首頁
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-main>
  </v-app>
</template>

<style scoped>
.error-main {
  min-height: 100vh;
}

.error-card {
  backdrop-filter: blur(8px);
}
</style>
