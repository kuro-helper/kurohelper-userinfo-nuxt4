// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['vuetify-nuxt-module'],
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
