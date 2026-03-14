import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@vite-pwa/nuxt',
  ],

  app: {
    head: {
      charset: 'utf-8',
      title: 'ZShop',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
  },

  css: [
    '~/assets/css/global.css',
  ],

  build: {
    transpile: ['vant'],
  },

  vite: {
    plugins: [
      Components({
        resolvers: [VantResolver()],
      }),
    ],
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'ZShop',
      short_name: 'ZShop',
      description: 'ZShop Mobile Store',
      theme_color: '#0ea5a0',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: undefined,
    },
  },
})
