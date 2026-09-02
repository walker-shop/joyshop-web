import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

// dev-only：去掉浏览器 Origin/Referer 头，避免本地后端 CORS 403
const stripOrigin = (proxy: any) => {
  proxy.on('proxyReq', (proxyReq: any) => {
    proxyReq.removeHeader('origin')
    proxyReq.removeHeader('referer')
  })
}

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
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
  },

  css: [
    '@fontsource-variable/archivo',
    '@fontsource-variable/noto-sans-sc',
    '@fontsource-variable/noto-sans-thai',
    '~/assets/css/global.css',
    '~/assets/css/lux.css',
  ],

  build: {
    transpile: ['vant', 'vue-i18n'],
  },

  // 纯 vue-i18n（非 @nuxtjs/i18n）：自动导入 useI18n，各页 script 直接用
  imports: {
    presets: [
      { from: 'vue-i18n', imports: ['useI18n'] },
    ],
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://zshop-admin.zwlab.app/api',
      tenantCode: process.env.NUXT_PUBLIC_TENANT_CODE || 'joyshop',
      tenantId: process.env.NUXT_PUBLIC_TENANT_ID || '3',
      iamBase: process.env.NUXT_PUBLIC_IAM_BASE || 'https://iam-api.walker-learn.xyz',
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    },
  },

  vite: {
    plugins: [
      Components({
        resolvers: [VantResolver()],
      }),
    ],
    server: {
      proxy: {
        // 本地全栈 e2e 分流（dev-only，临时）；stripOrigin 去掉浏览器 Origin 头避免后端 CORS 403
        '/v1/goods': { target: 'http://127.0.0.1:8022', changeOrigin: true, configure: stripOrigin },
        '/v1/banners': { target: 'http://127.0.0.1:8022', changeOrigin: true, configure: stripOrigin },
        '/v1/categories': { target: 'http://127.0.0.1:8022', changeOrigin: true, configure: stripOrigin },
        '/v1/cart': { target: 'http://127.0.0.1:8024', changeOrigin: true, configure: stripOrigin },
        '/v1/orders': { target: 'http://127.0.0.1:8024', changeOrigin: true, configure: stripOrigin },
        '/v1/payment': { target: 'http://127.0.0.1:8024', changeOrigin: true, configure: stripOrigin },
        '/v1/userop': { target: 'http://127.0.0.1:8025', changeOrigin: true, configure: stripOrigin },
        '/api': {
          target: 'https://zshop-admin.zwlab.app',
          changeOrigin: true,
        },
        '/iam-api': {
          target: process.env.NUXT_DEV_IAM_TARGET || 'https://iam-api.walker-learn.xyz',
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/iam-api/, ''),
          configure: stripOrigin,
        },
      },
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'ZShop',
      short_name: 'ZShop',
      description: 'ZShop curated online store',
      theme_color: '#f7f4ed',
      background_color: '#f7f4ed',
      display: 'standalone',
      icons: [
        {
          src: '/icons/icon-192x192-light.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512x512-light.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/icons/icon-192x192-dark.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icons/icon-512x512-dark.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
      ],
    },
    workbox: {
      navigateFallback: undefined,
    },
  },
})
