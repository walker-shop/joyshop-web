import { fileURLToPath } from 'node:url'
import { externalizeVantFont } from './build/vant-font'
import Components from 'unplugin-vue-components/vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
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

  // Include the initial page's CSS in SSR HTML instead of blocking on small files.
  features: { inlineStyles: true },
  experimental: {
    defaults: {
      nuxtLink: {
        // Keep route chunks out of startup until the shopper shows navigation intent.
        prefetchOn: { interaction: true, visibility: false },
      },
    },
  },

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
    define: {
      __INTLIFY_JIT_COMPILATION__: true,
      __INTLIFY_DROP_MESSAGE_COMPILER__: true,
    },
    ssr: { noExternal: ['vue-i18n', /@intlify\//] },
    plugins: [
      VueI18nPlugin({
        include: fileURLToPath(new URL('./app/i18n/locales/*.ts', import.meta.url)),
        runtimeOnly: true,
        jitCompilation: true,
        dropMessageCompiler: true,
        ssr: true,
      }),
      externalizeVantFont(fileURLToPath(new URL('.', import.meta.url))),
      {
        name: 'optional-brand-fonts',
        enforce: 'pre',
        transform(code, id) {
          if (id.includes('/@fontsource-variable/') && id.split('?')[0]?.endsWith('.css')) {
            return { code: code.replace(/font-display:\s*swap/g, 'font-display: optional'), map: null }
          }
        },
      },
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
