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
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
  },

  css: [
    '~/assets/css/global.css',
    '~/assets/css/lux.css',
  ],

  build: {
    transpile: ['vant'],
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'https://zshop-admin.zwlab.app/api',
      tenantCode: process.env.NUXT_PUBLIC_TENANT_CODE || 'joyshop',
      tenantId: process.env.NUXT_PUBLIC_TENANT_ID || '3',
      iamBase: process.env.NUXT_PUBLIC_IAM_BASE || 'https://iam-api.walker-learn.xyz',
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
      description: 'ZShop Mobile Store',
      theme_color: '#0ea5a0',
      background_color: '#ffffff',
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
