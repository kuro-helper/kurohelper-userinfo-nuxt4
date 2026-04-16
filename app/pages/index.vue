<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isDark?: boolean
  toggleTheme?: () => void
}>()

const username = ref('')
const password = ref('')
</script>

<template>
  <div class="page-shell d-flex align-center justify-center">
    <v-card class="login-card pa-2" width="420" rounded="xl" elevation="18">
      <v-card-title class="text-h5 font-weight-bold">Kurohelper使用者登入</v-card-title>
      <v-card-subtitle class="mb-2 login-notice">目前不開放登入</v-card-subtitle>

      <v-card-text class="d-flex flex-column ga-4">
        <v-text-field
          v-model="username"
          label="Username"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          disabled
        />
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          prepend-inner-icon="mdi-lock"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          disabled
        />
      </v-card-text>

      <v-card-actions class="px-4 pb-4 pt-0">
        <v-btn color="primary" variant="flat" block disabled>
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

.login-notice {
  color: rgb(var(--v-theme-error));
  font-weight: 700;
  opacity: 1 !important;
}
</style>
