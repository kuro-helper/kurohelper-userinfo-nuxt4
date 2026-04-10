// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', 'vuetify-nuxt-module'],
  eslint: {
    checker: false
  },
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'dark',
        themes: {
          light: {
            dark: false,
            colors: {
              primary: '#4F46E5',
              secondary: '#0EA5E9',
              success: '#16A34A',
              error: '#DC2626',
              background: '#F4F6FB',
              surface: '#FFFFFF'
            }
          },
          dark: {
            dark: true,
            colors: {
              primary: '#8B5CF6',
              secondary: '#38BDF8',
              success: '#22C55E',
              error: '#F87171',
              background: '#090B14',
              surface: '#12172A'
            }
          }
        }
      }
    }
  }
})
