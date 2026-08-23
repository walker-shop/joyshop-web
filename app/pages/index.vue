<template>
  <div class="home-page">
    <header class="mobile-topbar">
      <NuxtLink to="/" class="mobile-brand" aria-label="ZShop">
        <img src="/logo.png" alt="" width="34" height="34">
        <span>ZShop</span>
      </NuxtLink>
      <NuxtLink to="/search" class="mobile-search">
        <PhMagnifyingGlass :size="18" />
        <span>{{ $t('home.searchPlaceholder') }}</span>
      </NuxtLink>
    </header>

    <main class="home-shell">
      <div class="compact-home">
      <section class="hero-section">
        <div class="hero-copy">
          <h1>{{ $t('home.heroTitle1') }}<strong>{{ $t('home.heroTitle2') }}</strong></h1>
          <p>{{ $t('home.heroSubtitle') }}</p>
          <NuxtLink to="/category" class="hero-cta">
            {{ $t('home.viewAll').replace('›', '').trim() }}
            <PhArrowRight :size="18" />
          </NuxtLink>
        </div>

        <div class="hero-media">
          <van-swipe v-if="banners.length" :autoplay="5000" lazy-render class="hero-swipe" indicator-color="#ffffff">
            <van-swipe-item v-for="item in banners" :key="item.id">
              <NuxtLink :to="bannerTarget(item.url)" class="hero-link">
                <van-image
                  class="hero-image"
                  :src="item.image"
                  fit="cover"
                  :alt="`${$t('home.heroTitle1')}${$t('home.heroTitle2')}`"
                >
                  <template #loading><div class="image-skeleton" /></template>
                  <template #error><div class="hero-fallback">ZShop</div></template>
                </van-image>
              </NuxtLink>
            </van-swipe-item>
          </van-swipe>
          <div v-else class="hero-fallback">ZShop</div>
        </div>
      </section>

      <section class="trust-strip" aria-label="Service commitments">
        <span><PhShieldCheck :size="21" />{{ $t('login.perkGenuine') }}</span>
        <span><PhArrowUUpLeft :size="21" />{{ $t('login.perkRefund') }}</span>
        <span><PhTruck :size="21" />{{ $t('pdp.shipTip') }}</span>
      </section>

      <section v-if="topCategories.length" class="category-section">
        <div class="section-heading">
          <div>
            <span class="section-eyebrow">ZSHOP EDIT</span>
            <h2>{{ $t('nav.category') }}</h2>
          </div>
          <NuxtLink to="/category">{{ $t('home.viewAll') }}</NuxtLink>
        </div>

        <nav class="category-list" :aria-label="$t('nav.category')">
          <NuxtLink
            v-for="cat in topCategories"
            :key="cat.id"
            :to="`/category?id=${cat.id}`"
            class="category-item"
          >
            <span class="category-icon"><component :is="cat.comp" :size="25" weight="regular" /></span>
            <span>{{ cat.name }}</span>
          </NuxtLink>
        </nav>
      </section>
      </div>

      <section class="desktop-commerce" aria-label="ZShop desktop storefront">
        <aside class="desktop-category-rail">
          <header>
            <PhSquaresFour :size="22" weight="fill" />
            <div>
              <small>SHOP BY</small>
              <strong>{{ $t('category.title') }}</strong>
            </div>
          </header>
          <nav :aria-label="$t('category.title')">
            <NuxtLink
              v-for="cat in topCategories"
              :key="cat.id"
              :to="`/category?id=${cat.id}`"
            >
              <component :is="cat.comp" :size="21" />
              <span>{{ cat.name }}</span>
              <PhCaretRight :size="15" />
            </NuxtLink>
          </nav>
          <NuxtLink to="/category" class="rail-all">
            {{ $t('home.viewAll').replace('›', '').trim() }}
            <PhArrowRight :size="17" />
          </NuxtLink>
        </aside>

        <div class="desktop-hero">
          <div class="desktop-hero__media">
            <van-swipe v-if="banners.length" :autoplay="5000" lazy-render class="desktop-swipe" indicator-color="#ffffff">
              <van-swipe-item v-for="item in banners" :key="item.id">
                <NuxtLink :to="bannerTarget(item.url)" class="desktop-hero__link">
                  <van-image :src="item.image" fit="cover" :alt="`${$t('home.heroTitle1')}${$t('home.heroTitle2')}`">
                    <template #loading><div class="image-skeleton" /></template>
                    <template #error><div class="hero-fallback">ZShop</div></template>
                  </van-image>
                </NuxtLink>
              </van-swipe-item>
            </van-swipe>
            <div v-else class="hero-fallback">ZShop</div>
          </div>
          <div class="desktop-hero__copy">
            <h1>{{ $t('home.heroTitle1') }}<strong>{{ $t('home.heroTitle2') }}</strong></h1>
            <p>{{ $t('home.heroSubtitle') }}</p>
            <NuxtLink to="/category" class="hero-cta">
              {{ $t('home.viewAll').replace('›', '').trim() }}
              <PhArrowRight :size="18" />
            </NuxtLink>
          </div>
        </div>

        <aside class="desktop-service-panel">
          <header>
            <small>MY ZSHOP</small>
            <h2>{{ $t('nav.mine') }}</h2>
            <p>{{ $t('home.heroSubtitle') }}</p>
          </header>
          <nav class="account-shortcuts">
            <NuxtLink to="/order"><PhReceipt :size="21" /><span>{{ $t('user.myOrders') }}</span></NuxtLink>
            <NuxtLink to="/cart"><PhShoppingBag :size="21" /><span>{{ $t('nav.cart') }}</span></NuxtLink>
            <NuxtLink to="/user/favorites"><PhHeart :size="21" /><span>{{ $t('user.favorites') }}</span></NuxtLink>
          </nav>
          <div class="service-promises">
            <span><PhShieldCheck :size="20" /><b>{{ $t('login.perkGenuine') }}</b></span>
            <span><PhArrowUUpLeft :size="20" /><b>{{ $t('login.perkRefund') }}</b></span>
            <span><PhTruck :size="20" /><b>{{ $t('pdp.shipTip') }}</b></span>
          </div>
        </aside>
      </section>

      <NuxtLink to="/creative-studio" class="creative-entry">
        <span class="creative-entry__eyebrow">ZSHOP CREATIVE STUDIO</span>
        <strong>给商品做一支能投放的短视频广告</strong>
        <small>商品上新、活动促销、门店引流，从方案到竖版成片。</small>
        <i>开始出片 →</i>
      </NuxtLink>

      <section class="recommend-section">
        <div class="section-heading">
          <div>
            <span class="section-eyebrow">CURATED FOR YOU</span>
            <h2>{{ $t('home.recommend') }}</h2>
            <p>{{ $t('home.recommendSub') }}</p>
          </div>
          <NuxtLink to="/category">{{ $t('home.viewAll') }}</NuxtLink>
        </div>

        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <div v-if="loading && !products.length" class="product-grid" aria-busy="true">
            <div v-for="n in 8" :key="n" class="product-skeleton" />
          </div>

          <div v-else-if="loadError && !products.length" class="state-panel" role="alert">
            <PhCloudSlash :size="34" />
            <p>{{ $t('common.loadFailed') }}</p>
            <button type="button" @click="fetchProducts">{{ $t('common.retry') }}</button>
          </div>

          <div v-else-if="!products.length" class="state-panel">
            <PhPackage :size="34" />
            <p>{{ $t('home.emptyGoods') }}</p>
            <NuxtLink to="/category">{{ $t('home.viewAll') }}</NuxtLink>
          </div>

          <div v-else class="product-grid">
            <article v-for="item in featuredProducts" :key="item.id" class="product-card">
              <NuxtLink :to="`/goods/${item.id}`" class="product-link">
                <div class="product-media">
                  <van-image
                    class="fill"
                    :src="item.goodsFrontImage"
                    fit="cover"
                    :alt="item.name"
                    lazy-load
                  >
                    <template #loading><div class="product-placeholder muted">{{ monogram(item.name) }}</div></template>
                    <template #error><div class="product-placeholder">{{ monogram(item.name) }}</div></template>
                  </van-image>
                  <span v-if="discountPercent(item)" class="discount">−{{ discountPercent(item) }}%</span>
                </div>

                <div class="product-copy">
                  <div v-if="item.isHot || item.isNew || item.shipFree" class="product-tags">
                    <span v-if="item.isHot">{{ $t('home.tagHot') }}</span>
                    <span v-if="item.isNew">{{ $t('home.tagNew') }}</span>
                    <span v-if="item.shipFree">{{ $t('home.tagFreeShip') }}</span>
                  </div>
                  <h3>{{ item.name }}</h3>
                </div>
              </NuxtLink>

              <div class="product-footer">
                <div class="price-block">
                  <span class="price"><small>¥</small>{{ priceParts(dispPrice(item)).int }}<sup>.{{ priceParts(dispPrice(item)).dec }}</sup></span>
                  <span v-if="item.hasSku" class="price-from">{{ $t('pdp.priceFrom') }}</span>
                  <del v-if="!item.hasSku && item.marketPrice > item.shopPrice">¥{{ item.marketPrice }}</del>
                </div>
                <button
                  type="button"
                  class="quick-add"
                  :aria-label="item.hasSku ? $t('pdp.selectSpec') : $t('common.addToCart')"
                  @click="quickAdd(item)"
                >
                  <PhArrowRight v-if="item.hasSku" :size="18" />
                  <PhPlus v-else :size="18" weight="bold" />
                </button>
              </div>
            </article>
          </div>
        </van-pull-refresh>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  PhArrowRight,
  PhArrowUUpLeft,
  PhCaretRight,
  PhCloudSlash,
  PhHeart,
  PhMagnifyingGlass,
  PhPackage,
  PhPlus,
  PhReceipt,
  PhShieldCheck,
  PhShoppingBag,
  PhSquaresFour,
  PhTruck,
} from '@phosphor-icons/vue'
import { showToast } from 'vant'

const { t } = useI18n()
const config = useRuntimeConfig()
const { tenantId } = useTenant()
const refreshing = ref(false)
const loading = ref(true)
const loadError = ref(false)

interface Banner { id: number; image: string; url: string; index: number }
interface Category { id: number; name: string; parentId: number; level: number; icon?: string }

const banners = ref<Banner[]>([])
const allCategories = ref<Category[]>([])
const products = ref<any[]>([])
const featuredProducts = computed(() => products.value.slice(0, 12))
const { getIconDef } = useCategoryIcon()

const topCategories = computed(() =>
  allCategories.value
    .filter(cat => !cat.parentId || cat.parentId === 0)
    .slice(0, 8)
    .map(cat => ({ ...cat, comp: getIconDef(cat.name).comp })),
)

function monogram(name: string) {
  return (name || '').trim()[0] || 'Z'
}

function priceParts(value: number) {
  const [int = '0', dec = '00'] = Number(value || 0).toFixed(2).split('.')
  return { int, dec }
}

function dispPrice(item: any): number {
  return item?.hasSku && item?.minSkuPrice ? item.minSkuPrice : (item?.shopPrice || 0)
}

function discountPercent(item: any): number {
  if (item?.hasSku || !item?.marketPrice || item.marketPrice <= item.shopPrice) return 0
  return Math.round((1 - item.shopPrice / item.marketPrice) * 100)
}

function bannerTarget(url: string): string {
  return /^\/(category|goods)(\/|\?|$)/.test(url || '') ? url : '/category'
}

async function fetchBanners() {
  try {
    const res = await $fetch<{ code: number; data: { data: Banner[] } }>(
      `${config.public.apiBase}/v1/banners`,
      { params: { tenant_id: tenantId } },
    )
    if (res.code === 200 && res.data?.data) banners.value = res.data.data
  } catch {
    banners.value = []
  }
}

async function fetchCategories() {
  try {
    const res = await $fetch<{ code: number; data: { data: Category[] } | Category[] }>(
      `${config.public.apiBase}/v1/categories`,
    )
    if (res.code === 200) {
      allCategories.value = Array.isArray(res.data) ? res.data : (res.data?.data || [])
    }
  } catch {
    allCategories.value = []
  }
}

async function fetchProducts() {
  loading.value = true
  loadError.value = false
  try {
    const res = await $fetch<{ code: number; data: { data: any[]; total: number } }>(
      `${config.public.apiBase}/v1/goods`,
      { params: { page: 1, pageSize: 12, isHot: true, tenant_id: tenantId } },
    )
    if (res.code === 200 && res.data?.data) products.value = res.data.data
    else loadError.value = true
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

async function onRefresh() {
  await Promise.all([fetchBanners(), fetchCategories(), fetchProducts()])
  refreshing.value = false
}

const { apiFetch } = useApi()
const { isLoggedIn } = useAuth()
const { refresh: refreshCart } = useCartCount()

async function quickAdd(item: any) {
  if (item.hasSku) {
    navigateTo(`/goods/${item.id}`)
    return
  }
  if (!isLoggedIn.value) {
    showToast(t('common.loginRequired'))
    navigateTo('/login?redirect=/')
    return
  }
  try {
    await apiFetch('/v1/cart', { method: 'POST', body: { goodsId: Number(item.id), nums: 1, checked: true } })
    await refreshCart()
    showToast(t('common.addedToCart'))
  } catch (error: any) {
    showToast(error?.data?.msg || error?.message || t('common.addToCartFailed'))
  }
}

onMounted(() => {
  void Promise.all([fetchBanners(), fetchCategories(), fetchProducts()])
})
</script>

<style scoped>
.home-page { min-height: 100vh; background: var(--color-bg-page); }

.mobile-topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px var(--space-md);
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in oklch, var(--color-bg-card) 94%, transparent);
  backdrop-filter: blur(16px);
}

.mobile-brand { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.mobile-brand img { border-radius: 9px; }
.mobile-brand span { font-family: var(--font-display); font-size: 18px; font-weight: 780; letter-spacing: -0.02em; }
.mobile-search {
  min-width: 0;
  height: 44px;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-inline: 13px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-search-bg);
  color: var(--color-text-secondary);
}
.mobile-search span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }

.home-shell {
  width: min(100%, var(--page-max));
  margin-inline: auto;
  padding: var(--space-md) var(--space-sm) var(--space-2xl);
}

.desktop-commerce { display: none; }

.hero-section {
  display: grid;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.hero-copy {
  padding: var(--space-lg) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-card);
}

.hero-kicker,
.section-eyebrow {
  color: var(--color-primary-dark);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 720;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-copy h1 {
  max-width: 12ch;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(30px, 8vw, 52px);
  font-weight: 690;
  line-height: 1.03;
  letter-spacing: -0.045em;
}
.hero-copy h1 strong { display: block; color: var(--color-primary-dark); font-weight: inherit; }
.hero-copy p { margin: 12px 0 0; color: var(--color-text-secondary); font-size: 15px; }
.hero-cta {
  min-height: 44px;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-top: var(--space-lg);
  padding-inline: 17px;
  border-radius: var(--radius-md);
  background: var(--color-accent-ink);
  color: var(--color-text-inverse);
  font-weight: 680;
}

.hero-media { min-width: 0; overflow: hidden; border-radius: var(--radius-lg); background: var(--color-search-bg); }
.hero-swipe,
.hero-link,
.hero-image,
.hero-fallback { display: block; width: 100%; aspect-ratio: 16 / 9; }
.hero-image :deep(img) { width: 100%; height: 100%; }
.hero-fallback { display: grid; place-items: center; color: var(--color-primary-dark); font-family: var(--font-display); font-size: 42px; font-weight: 760; }
.image-skeleton { width: 100%; height: 100%; background: var(--color-search-bg); }

.trust-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  margin-bottom: var(--space-xl);
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-border);
}
.trust-strip span {
  min-width: 0;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: var(--space-xs);
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  text-align: center;
  font-size: 12px;
}
.trust-strip svg { color: var(--color-primary-dark); flex: 0 0 auto; }

.category-section,
.recommend-section { margin-top: var(--space-xl); }
.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  padding-inline: 2px;
}
.section-heading h2 {
  margin: 4px 0 0;
  font-family: var(--font-display);
  font-size: 26px;
  line-height: 1.1;
  letter-spacing: -0.035em;
}
.section-heading p { margin: 5px 0 0; color: var(--color-text-secondary); font-size: 14px; }
.section-heading > a { min-height: 44px; display: inline-flex; align-items: center; color: var(--color-primary-dark); font-size: 14px; font-weight: 680; }

.category-list {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 88px;
  gap: var(--space-xs);
  overflow-x: auto;
  padding-bottom: var(--space-xs);
  scrollbar-width: none;
}
.category-list::-webkit-scrollbar { display: none; }
.category-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  padding: var(--space-sm) var(--space-xs);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-align: center;
  font-size: 13px;
  transition: border-color 160ms ease, background 160ms ease, color 160ms ease;
}
.category-item:hover { border-color: var(--color-border); background: var(--color-bg-card); color: var(--color-text-primary); }
.category-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary-dark);
}
.category-item > span:last-child { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.product-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-sm); }
.product-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  transition: transform 180ms cubic-bezier(.2, .8, .2, 1), border-color 180ms ease, box-shadow 180ms ease;
}
.product-link { min-width: 0; display: block; }
.product-media { position: relative; width: 100%; aspect-ratio: 1 / 1; overflow: hidden; background: var(--color-search-bg); }
.fill { width: 100%; height: 100%; display: block; }
.fill :deep(img) { transition: transform 260ms cubic-bezier(.2, .8, .2, 1); }
.product-placeholder { width: 100%; height: 100%; display: grid; place-items: center; background: var(--color-search-bg); color: var(--color-primary-dark); font-family: var(--font-display); font-size: 34px; font-weight: 700; }
.product-placeholder.muted { opacity: 0.45; }
.discount { position: absolute; top: 9px; left: 9px; padding: 4px 7px; border-radius: 6px; background: var(--color-bg-card); color: var(--color-price); font-size: 11px; font-weight: 760; }
.product-copy { padding: var(--space-sm) var(--space-sm) 0; }
.product-copy h3 { min-height: 42px; margin: 7px 0 0; color: var(--color-text-primary); font-size: 14px; font-weight: 560; line-height: 1.48; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
.product-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.product-tags span { color: var(--color-primary-dark); font-size: 11px; font-weight: 660; }
.product-tags span + span::before { content: '·'; margin-right: 5px; color: var(--color-border-strong); }
.product-footer { margin-top: auto; display: flex; align-items: end; justify-content: space-between; gap: var(--space-xs); padding: var(--space-sm); }
.price-block { min-width: 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: 3px 6px; }
.price { color: var(--color-price); font-family: var(--font-display); font-size: 21px; font-weight: 740; font-variant-numeric: tabular-nums; letter-spacing: -0.03em; }
.price small,
.price sup { font-size: 11px; font-weight: 650; }
.price-from { color: var(--color-text-secondary); font-size: 11px; }
.price-block del { color: var(--color-text-tertiary); font-size: 11px; }
.quick-add {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid var(--color-border-strong);
  border-radius: 50%;
  background: var(--color-bg-card);
  color: var(--color-primary-dark);
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, transform 160ms ease;
}
.quick-add:hover { background: var(--color-accent-ink); color: var(--color-text-inverse); }
.quick-add:active { transform: scale(.96); }

.product-skeleton { aspect-ratio: .72; border-radius: var(--radius-md); background: color-mix(in oklch, var(--color-search-bg) 82%, var(--color-bg-card)); }
.state-panel { min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-sm); padding: var(--space-xl); border: 1px solid var(--color-border); border-radius: var(--radius-lg); color: var(--color-text-secondary); text-align: center; }
.state-panel p { margin: 0; }
.state-panel button,
.state-panel a { min-height: 44px; display: inline-flex; align-items: center; padding-inline: 18px; border: 0; border-radius: var(--radius-md); background: var(--color-accent-ink); color: var(--color-text-inverse); cursor: pointer; font-weight: 680; }

@media (hover: hover) {
  .product-card:hover { transform: translateY(-3px); border-color: var(--color-border-strong); box-shadow: var(--shadow-soft); }
  .product-card:hover .fill :deep(img) { transform: scale(1.025); }
}

@media (min-width: 600px) {
  .home-shell { padding-inline: var(--space-lg); }
  .product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-md); }
}

@media (min-width: 768px) {
  .mobile-topbar { display: none; }
  .home-shell { padding-top: var(--space-xl); padding-bottom: var(--space-3xl); }
  .hero-section { grid-template-columns: minmax(260px, .72fr) minmax(0, 1.6fr); gap: var(--space-md); }
  .hero-copy { order: 0; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: clamp(28px, 4vw, 52px); }
  .hero-copy h1 { font-size: clamp(38px, 4vw, 58px); }
  .hero-swipe,
  .hero-link,
  .hero-image,
  .hero-fallback { height: 100%; min-height: 360px; aspect-ratio: auto; }
  .trust-strip span { min-height: 64px; flex-direction: row; font-size: 14px; }
  .category-list { grid-auto-flow: initial; grid-auto-columns: initial; grid-template-columns: repeat(8, minmax(0, 1fr)); overflow: visible; }
  .category-item { padding-block: var(--space-md); }
  .section-heading h2 { font-size: 32px; }
}

@media (min-width: 1024px) {
  .compact-home { display: none; }

  .desktop-commerce {
    height: clamp(470px, 38vw, 560px);
    display: grid;
    grid-template-columns: minmax(180px, 220px) minmax(0, 1fr) minmax(220px, 270px);
    gap: var(--space-sm);
    margin-bottom: var(--space-2xl);
  }

  .desktop-category-rail,
  .desktop-service-panel,
  .desktop-hero {
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-bg-card);
  }

  .desktop-category-rail { display: flex; flex-direction: column; }
  .desktop-category-rail > header {
    min-height: 72px;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: var(--space-md);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-accent-ink);
    color: var(--color-text-inverse);
  }
  .desktop-category-rail > header div { min-width: 0; display: grid; gap: 3px; }
  .desktop-category-rail > header small,
  .desktop-service-panel > header small { font-family: var(--font-display); font-size: 9px; font-weight: 720; letter-spacing: .14em; }
  .desktop-category-rail > header strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; }
  .desktop-category-rail nav { min-height: 0; flex: 1; overflow-y: auto; padding: 7px; scrollbar-width: thin; }
  .desktop-category-rail nav a {
    min-height: 45px;
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) 16px;
    align-items: center;
    gap: 8px;
    padding-inline: 10px;
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
    font-size: 13px;
    transition: background 160ms ease, color 160ms ease;
  }
  .desktop-category-rail nav a span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .desktop-category-rail nav a svg:last-child { color: var(--color-text-tertiary); }
  .desktop-category-rail nav a:hover { background: var(--color-primary-soft); color: var(--color-primary-dark); }
  .rail-all {
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: var(--space-md);
    border-top: 1px solid var(--color-border);
    color: var(--color-primary-dark);
    font-size: 13px;
    font-weight: 700;
  }

  .desktop-hero { position: relative; background: var(--color-search-bg); }
  .desktop-hero__media,
  .desktop-swipe,
  .desktop-hero__link,
  .desktop-hero__link :deep(.van-image),
  .desktop-hero__link :deep(img) { width: 100%; height: 100%; display: block; }
  .desktop-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(90deg, color-mix(in oklch, var(--color-bg-card) 97%, transparent) 0%, color-mix(in oklch, var(--color-bg-card) 88%, transparent) 30%, transparent 68%);
  }
  .desktop-hero__copy {
    position: absolute;
    z-index: 2;
    left: clamp(24px, 4vw, 62px);
    top: 50%;
    width: min(43%, 390px);
    padding: clamp(22px, 2.2vw, 34px);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-bg-card);
    box-shadow: var(--shadow-soft);
    transform: translateY(-50%);
  }
  .desktop-hero__copy h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(34px, 3.4vw, 58px);
    line-height: .98;
    letter-spacing: -.05em;
  }
  .desktop-hero__copy h1 strong { display: block; color: var(--color-primary-dark); font-weight: inherit; }
  .desktop-hero__copy p { margin: 15px 0 0; color: var(--color-text-secondary); }

  .desktop-service-panel { display: flex; flex-direction: column; }
  .desktop-service-panel > header { padding: var(--space-lg) var(--space-md) var(--space-md); }
  .desktop-service-panel > header small { color: var(--color-primary-dark); }
  .desktop-service-panel > header h2 { margin: 6px 0 0; font-family: var(--font-display); font-size: 25px; }
  .desktop-service-panel > header p { margin: 6px 0 0; color: var(--color-text-secondary); font-size: 12px; }
  .account-shortcuts { display: grid; grid-template-columns: repeat(3, 1fr); margin-inline: var(--space-sm); border-block: 1px solid var(--color-border); }
  .account-shortcuts a { min-width: 0; min-height: 82px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--color-text-secondary); text-align: center; font-size: 11px; }
  .account-shortcuts a + a { border-left: 1px solid var(--color-border); }
  .account-shortcuts a:hover { color: var(--color-primary-dark); background: var(--color-primary-soft); }
  .account-shortcuts span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-inline: 4px; }
  .service-promises { flex: 1; display: grid; align-content: center; padding: var(--space-md); }
  .service-promises span { min-height: 50px; display: grid; grid-template-columns: 26px minmax(0, 1fr); align-items: center; gap: 9px; border-bottom: 1px solid var(--color-border); color: var(--color-primary-dark); }
  .service-promises span:last-child { border-bottom: 0; }
  .service-promises b { color: var(--color-text-secondary); font-size: 12px; font-weight: 570; line-height: 1.4; }

  .recommend-section { margin-top: 0; }
  .product-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--space-lg) var(--space-md); }
  .product-card { border-radius: var(--radius-lg); }
  .product-copy { padding: var(--space-md) var(--space-md) 0; }
  .product-footer { padding: var(--space-md); }
  .product-copy h3 { font-size: 15px; }
}

@media (min-width: 1440px) {
  .desktop-commerce { grid-template-columns: 230px minmax(0, 1fr) 280px; gap: var(--space-md); }
  .product-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}
.creative-entry { position: relative; display: grid; gap: 9px; overflow: hidden; margin-top: var(--space-xl); padding: 26px 24px; border-radius: var(--radius-lg); background: linear-gradient(125deg, #21150d, #5b3516); color: #fff; box-shadow: 0 14px 30px rgb(70 39 11 / .16); }
.creative-entry::after { content: ''; position: absolute; top: -100px; right: -32px; width: 230px; height: 230px; border: 1px solid rgb(255 255 255 / .2); border-radius: 50%; box-shadow: 0 0 0 28px rgb(255 255 255 / .05), 0 0 0 56px rgb(255 255 255 / .04); }
.creative-entry__eyebrow, .creative-entry strong, .creative-entry small, .creative-entry i { position: relative; z-index: 1; }.creative-entry__eyebrow { color: #f7d795; font-family: var(--font-display); font-size: 11px; font-weight: 800; letter-spacing: .12em; }.creative-entry strong { max-width: 18ch; font-family: var(--font-display); font-size: clamp(23px, 5vw, 34px); line-height: 1.14; }.creative-entry small { color: rgb(255 255 255 / .72); font-size: 14px; }.creative-entry i { width: fit-content; margin-top: 7px; color: #f7d795; font-style: normal; font-size: 14px; font-weight: 800; }
</style>
