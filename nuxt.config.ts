// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', 'vuetify-nuxt-module'],
  eslint: {
    checker: true
  },
  vuetify: {
    moduleOptions: {
      // Keep defaults for stable setup on Nuxt 4.
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'light'
      }
    }
  }
})
