<script setup lang="ts">
const route = useRoute()
const userId = computed(() => String(route.params.id ?? ''))
</script>

<template>
  <div class="page-shell d-flex align-center justify-center">
    <v-card class="user-card pa-2" width="460" rounded="xl" elevation="18">
      <v-card-title class="text-h5 font-weight-bold">User Profile</v-card-title>
      <v-card-subtitle class="mb-2">目前為假資料頁面（待串接後端）</v-card-subtitle>

      <v-card-text class="text-body-1">
        目前選取的使用者 ID：<strong>{{ userId }}</strong>
      </v-card-text>

      <v-card-actions class="px-4 pb-4 pt-0">
        <v-btn color="primary" variant="flat" prepend-icon="mdi-arrow-left" @click="navigateTo('/')">
          回登入頁
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

.user-card {
  backdrop-filter: blur(8px);
  pointer-events: auto;
}
</style>
