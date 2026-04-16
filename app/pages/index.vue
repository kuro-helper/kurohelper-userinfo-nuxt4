<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isDark?: boolean
  toggleTheme?: () => void
}>()

const username = ref('')
const password = ref('')
const isSubmitting = ref(false)

const onLogin = async () => {
  if (!username.value || !password.value) return

  isSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 900))
  isSubmitting.value = false

  await navigateTo({
    path: `/user/${encodeURIComponent(username.value)}`,
  })
}
</script>

<template>
  <div class="page-shell d-flex align-center justify-center">
    <v-card class="login-card pa-2" width="420" rounded="xl" elevation="18">
      <v-card-title class="text-h5 font-weight-bold">Kurohelper使用者登入</v-card-title>
      <v-card-subtitle class="mb-2">使用Discord帳號ID登入</v-card-subtitle>

      <v-card-text class="d-flex flex-column ga-4">
        <v-text-field
          v-model="username"
          label="Username"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
        />
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          prepend-inner-icon="mdi-lock"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
        />
      </v-card-text>

      <v-card-actions class="px-4 pb-4 pt-0">
        <v-btn color="primary" variant="flat" block :loading="isSubmitting" @click="onLogin">
          Sign In
        </v-btn>
      </v-card-actions>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-btn
          color="secondary"
          variant="tonal"
          block
          prepend-icon="mdi-theme-light-dark"
          @click="props.toggleTheme?.()"
        >
          切換 {{ props.isDark ? '亮色' : '深色' }} 主題
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  pointer-events: none;
}

.login-card {
  backdrop-filter: blur(8px);
  pointer-events: auto;
}
</style>
