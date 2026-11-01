export default defineNuxtPlugin(() => {
  const route = useRoute()
  // The app uses a custom vue-i18n plugin, not Nuxt's $i18n injection.
  const locale = useCookie<string>('zshop_lang', { default: () => 'zh-CN' })
  const origin = 'https://zshop.zwlab.app'
  const privatePage = computed(() => /^\/(login|register|auth|cart|checkout|order|user|search|creative-studio)(\/|$)/.test(route.path))
  const title = computed(() => route.path === '/' ? 'ZShop — 商品选购与在线商店' : route.path === '/category' ? '商品分类与选购 · ZShop' : 'ZShop')
  const description = '浏览 ZShop 商品目录、分类、商品图片与价格，查看商品详情并管理你的购物清单。'
  const canonical = computed(() => origin + (route.path.replace(/\/+$/, '') || '/'))
  useHead(() => ({
    htmlAttrs: { lang: String(locale.value || 'zh-CN') },
    title: title.value,
    link: [{ rel: 'canonical', href: canonical.value }],
    meta: [
      { name: 'description', content: description },
      { name: 'robots', content: privatePage.value ? 'noindex, follow' : 'index, follow, max-image-preview:large' },
      { property: 'og:title', content: title.value },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical.value },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'ZShop' },
      { name: 'twitter:card', content: 'summary' },
    ],
    script: privatePage.value ? [] : [{ key: 'store-schema', type: 'application/ld+json', innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'ZShop', url: origin + '/' }).replace(/</g, '\\u003c') }],
  }))
})
