<template>
  <div class="pdp-page">
    <header class="pdp-nav">
      <button type="button" class="nav-button" :aria-label="$t('common.back')" @click="$router.back()">
        <PhArrowLeft :size="21" />
      </button>
      <NuxtLink to="/" class="nav-brand">
        <img src="/logo.png" alt="" width="30" height="30">
        <span>ZShop</span>
      </NuxtLink>
      <span class="nav-title">{{ $t('pdp.navTitle') }}</span>
      <button
        type="button"
        class="nav-button"
        :class="{ active: faved }"
        :aria-label="$t('user.favorites')"
        :aria-pressed="faved"
        @click="onToggleFav"
      >
        <PhHeart :size="21" :weight="faved ? 'fill' : 'regular'" />
      </button>
    </header>

    <main class="pdp-shell">
      <div v-if="status === 'pending'" class="pdp-loading" aria-busy="true">
        <div class="loading-media" />
        <div class="loading-copy"><span /><span /><span /></div>
      </div>

      <div v-else-if="!goods.name" class="state-panel" role="alert">
        <PhCloudSlash :size="38" />
        <p>{{ $t('common.loadFailed') }}</p>
        <button type="button" @click="refresh()">{{ $t('common.retry') }}</button>
      </div>

      <template v-else>
        <section class="product-primary">
          <div class="product-gallery">
            <van-swipe v-if="heroImages.length" :autoplay="heroImages.length > 1 ? 5000 : 0" lazy-render @change="onSwipe">
              <van-swipe-item v-for="(image, index) in heroImages" :key="index">
                <van-image class="hero-image" :src="image" fit="contain" :alt="goods.name">
                  <template #loading><div class="gallery-placeholder"><van-loading type="spinner" /></div></template>
                  <template #error><div class="gallery-placeholder">{{ $t('pdp.noImage') }}</div></template>
                </van-image>
              </van-swipe-item>
              <template #indicator><span /></template>
            </van-swipe>
            <div v-else class="gallery-placeholder">{{ $t('pdp.noImage') }}</div>
            <span v-if="heroImages.length > 1" class="hero-pager">{{ heroIdx + 1 }} / {{ heroImages.length }}</span>
          </div>

          <div class="purchase-panel">
            <div v-if="goods.isHot || goods.isNew || goods.shipFree" class="product-tags">
              <span v-if="goods.isHot">{{ $t('home.tagHot') }}</span>
              <span v-if="goods.isNew">{{ $t('home.tagNew') }}</span>
              <span v-if="goods.shipFree">{{ $t('home.tagFreeShip') }}</span>
            </div>

            <h1>{{ goods.name }}</h1>

            <div class="price-row">
              <span v-if="hasSpecs && !selectedSku" class="price-from">{{ $t('pdp.priceFrom') }}</span>
              <span class="price"><small>¥</small>{{ priceParts(displayPrice).int }}<sup>.{{ priceParts(displayPrice).dec }}</sup></span>
              <del v-if="!hasSpecs && goods.marketPrice > goods.shopPrice">¥{{ goods.marketPrice }}</del>
            </div>

            <ul class="trust-list">
              <li><PhShieldCheck :size="20" /><span>{{ $t('login.perkGenuine') }}</span></li>
              <li><PhArrowUUpLeft :size="20" /><span>{{ $t('login.perkRefund') }}</span></li>
              <li><PhTruck :size="20" /><span>{{ $t('pdp.shipTip') }}</span></li>
            </ul>

            <section v-if="hasSpecs" class="specs" :aria-label="$t('pdp.selectSpec')">
              <div v-for="spec in specs" :key="spec.id" class="spec-group">
                <h2>{{ spec.name }}</h2>
                <div class="spec-options">
                  <button
                    v-for="value in spec.values"
                    :key="value.id"
                    type="button"
                    :class="{ active: selectedValues[spec.id] === value.id }"
                    :aria-pressed="selectedValues[spec.id] === value.id"
                    @click="selectValue(spec.id, value.id)"
                  >{{ value.value }}</button>
                </div>
              </div>
              <p v-if="allSelected && !selectedSku" class="spec-error" role="alert">{{ $t('pdp.skuUnavailable') }}</p>
            </section>

            <dl class="fulfilment-list">
              <div><dt>{{ $t('pdp.delivery') }}</dt><dd>{{ goods.shipFree ? $t('home.tagFreeShip') : $t('pdp.express') }} · {{ $t('pdp.shipTip') }}</dd></div>
              <div><dt>{{ $t('pdp.service') }}</dt><dd>{{ $t('pdp.serviceDesc') }}</dd></div>
            </dl>

            <div class="desktop-purchase-actions">
              <button type="button" class="button-secondary" @click="onAddCart">{{ $t('common.addToCart') }}</button>
              <button type="button" class="button-primary" @click="onBuyNow">{{ $t('pdp.buyNow') }}</button>
            </div>
          </div>
        </section>

        <section class="details-layout">
          <article class="detail-section">
            <span class="section-eyebrow">PRODUCT INFORMATION</span>
            <h2>{{ $t('pdp.navTitle') }}</h2>
            <p v-if="goods.goodsDesc || goods.goodsBrief" class="product-description">{{ goods.goodsDesc || goods.goodsBrief }}</p>
            <p v-else class="empty-copy">{{ $t('pdp.noImage') }}</p>
          </article>

          <article class="detail-section reviews-section">
            <div class="review-heading">
              <div>
                <span class="section-eyebrow">REVIEWS</span>
                <h2>{{ $t('review.sectionTitle') }}</h2>
              </div>
              <span v-if="reviews.total" class="review-score">★ {{ reviews.avgRating.toFixed(1) }} · {{ $t('review.countLabel', { n: reviews.total }) }}</span>
            </div>

            <div v-if="reviews.data.length" class="review-list">
              <article v-for="(review, index) in reviews.data" :key="index" class="review-item">
                <div class="review-meta">
                  <strong>{{ review.nickname }}</strong>
                  <span :aria-label="`${review.rating}/5`">{{ '★'.repeat(review.rating) }}<i>{{ '★'.repeat(5 - review.rating) }}</i></span>
                </div>
                <p v-if="review.content">{{ review.content }}</p>
                <div v-if="review.images?.length" class="review-images">
                  <button
                    v-for="url in review.images"
                    :key="url"
                    type="button"
                    :aria-label="$t('review.addPhotos')"
                    @click="showReviewImages(review.images, url)"
                  ><van-image :src="url" fit="cover" :alt="$t('review.addPhotos')" /></button>
                </div>
                <div v-if="review.merchantReply" class="merchant-reply">
                  <strong>{{ $t('review.merchantReply') }}</strong>
                  <span>{{ review.merchantReply }}</span>
                </div>
                <time>{{ (review.createdAt || '').slice(0, 10) }}</time>
              </article>
            </div>
            <p v-else class="empty-copy">{{ $t('review.empty') }}</p>
          </article>
        </section>

        <section v-if="recos.length" class="recommendations">
          <div class="recommendation-heading">
            <span class="section-eyebrow">YOU MAY ALSO LIKE</span>
            <h2>{{ $t('home.recommendSub') }}</h2>
          </div>
          <div class="recommendation-grid">
            <NuxtLink v-for="item in recos" :key="item.id" :to="`/goods/${item.id}`" class="recommendation-card">
              <van-image class="recommendation-image" :src="item.goodsFrontImage" fit="cover" :alt="item.name">
                <template #error><div class="gallery-placeholder small">{{ $t('pdp.noImage') }}</div></template>
              </van-image>
              <h3>{{ item.name }}</h3>
              <span class="recommendation-price">¥{{ priceParts(item.shopPrice).int }}</span>
            </NuxtLink>
          </div>
        </section>
      </template>
    </main>

    <div v-if="goods.name" class="mobile-purchase-bar">
      <NuxtLink to="/cart" class="cart-link" :aria-label="$t('nav.cart')"><PhShoppingBag :size="22" /><span>{{ $t('nav.cart') }}</span></NuxtLink>
      <button type="button" class="button-secondary" @click="onAddCart">{{ $t('common.addToCart') }}</button>
      <button type="button" class="button-primary" @click="onBuyNow">{{ $t('pdp.buyNow') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PhArrowLeft,
  PhArrowUUpLeft,
  PhCloudSlash,
  PhHeart,
  PhShieldCheck,
  PhShoppingBag,
  PhTruck,
} from '@phosphor-icons/vue'
import { showImagePreview, showToast } from 'vant'

definePageMeta({ layout: 'blank' })

const { t } = useI18n()
const config = useRuntimeConfig()
const { tenantId } = useTenant()
const route = useRoute()

const heroIdx = ref(0)
function onSwipe(index: number) { heroIdx.value = index }
function priceParts(value: number) {
  const [int = '0', dec = '00'] = Number(value || 0).toFixed(2).split('.')
  return { int, dec }
}

const { data: goods, status, refresh } = await useAsyncData(`goods-${route.params.id}`, async () => {
  const res = await $fetch<{ code: number; data: any }>(
    `${config.public.apiBase}/v1/goods/${route.params.id}`,
    { params: { tenant_id: tenantId } },
  )
  if (res.code === 200 && res.data) return res.data
  throw new Error('Product unavailable')
}, {
  server: false,
  default: () => ({ name: '', shopPrice: 0, marketPrice: 0, images: [], goodsFrontImage: '' }),
})

const heroImages = computed(() => {
  const images = (goods.value?.images || []).filter(Boolean)
  if (images.length) return images
  return goods.value?.goodsFrontImage ? [goods.value.goodsFrontImage] : []
})

const { loadSpecs, loadSkus, matchSku } = useSkus()
const specs = ref<GoodsSpec[]>([])
const skus = ref<GoodsSku[]>([])
const selectedValues = ref<Record<number, number>>({})
const hasSpecs = computed(() => specs.value.length > 0)
const selectedValueIds = computed(() => specs.value.map(spec => selectedValues.value[spec.id]).filter(Boolean) as number[])
const allSelected = computed(() => hasSpecs.value && selectedValueIds.value.length === specs.value.length)
const selectedSku = computed(() => allSelected.value ? matchSku(skus.value, selectedValueIds.value) : null)
const skuSpecLabel = computed(() => specs.value
  .map(spec => spec.values.find(value => value.id === selectedValues.value[spec.id])?.value)
  .filter(Boolean)
  .join(','))
const displayPrice = computed(() => {
  if (selectedSku.value) return selectedSku.value.shop_price
  if (hasSpecs.value && skus.value.length) return Math.min(...skus.value.map(sku => sku.shop_price))
  return goods.value?.shopPrice || 0
})
function selectValue(specId: number, valueId: number) {
  selectedValues.value = { ...selectedValues.value, [specId]: valueId }
}

const recos = ref<any[]>([])
async function fetchRecos() {
  try {
    const res = await $fetch<{ code: number; data: { data: any[] } }>(
      `${config.public.apiBase}/v1/goods`,
      { params: { page: 1, pageSize: 6, isHot: true, tenant_id: tenantId } },
    )
    if (res.code === 200 && res.data?.data) {
      recos.value = res.data.data.filter(item => String(item.id) !== String(route.params.id)).slice(0, 4)
    }
  } catch {
    recos.value = []
  }
}

const { getGoodsReviews } = useReviews()
const reviews = ref<GoodsReviews>({ avgRating: 0, total: 0, data: [] })
async function fetchReviews() {
  try {
    reviews.value = await getGoodsReviews(route.params.id as string, tenantId as number, 1, 20)
  } catch {
    reviews.value = { avgRating: 0, total: 0, data: [] }
  }
}

function showReviewImages(images: string[], current: string) {
  showImagePreview({ images, startPosition: Math.max(0, images.indexOf(current)), closeable: true })
}

useSeoMeta({
  title: () => `${goods.value?.name || t('pdp.navTitle')} - ZShop`,
  ogImage: () => heroImages.value[0] ?? '',
})

const { apiFetch } = useApi()
const { isLoggedIn } = useAuth()
const { refresh: refreshCart } = useCartCount()
const { check: checkFav, add: addFav, remove: removeFav } = useFav()
const faved = ref(false)

function requireLogin(): boolean {
  if (isLoggedIn.value) return true
  showToast(t('common.loginRequired'))
  navigateTo(`/login?redirect=/goods/${route.params.id}`)
  return false
}

async function onToggleFav() {
  if (!requireLogin()) return
  const id = Number(route.params.id)
  try {
    if (faved.value) {
      await removeFav(id)
      faved.value = false
      showToast(t('user.favRemoved'))
    } else {
      await addFav(id)
      faved.value = true
      showToast(t('user.favAdded'))
    }
  } catch (error: any) {
    showToast(error?.data?.msg || error?.message || t('user.favActionFailed'))
  }
}

async function addToCart(): Promise<boolean> {
  if (hasSpecs.value) {
    if (!allSelected.value) { showToast(t('pdp.selectSpec')); return false }
    if (!selectedSku.value) { showToast(t('pdp.skuUnavailable')); return false }
  }
  try {
    const body: Record<string, unknown> = { goodsId: Number(route.params.id), nums: 1, checked: true }
    if (selectedSku.value) {
      body.sku_id = selectedSku.value.id
      body.sku_spec = skuSpecLabel.value
      body.sku_price = selectedSku.value.shop_price
    }
    await apiFetch<{ id: number; msg: string }>('/v1/cart', { method: 'POST', body })
    await refreshCart()
    return true
  } catch (error: any) {
    showToast(error?.data?.msg || error?.message || t('common.addToCartFailed'))
    return false
  }
}

async function onAddCart() {
  if (!requireLogin()) return
  if (await addToCart()) showToast(t('common.addedToCart'))
}
async function onBuyNow() {
  if (!requireLogin()) return
  if (await addToCart()) navigateTo('/cart')
}

onMounted(async () => {
  await Promise.all([
    fetchRecos(),
    fetchReviews(),
    (async () => {
      try {
        const [loadedSpecs, loadedSkus] = await Promise.all([
          loadSpecs(route.params.id as string),
          loadSkus(route.params.id as string),
        ])
        specs.value = loadedSpecs
        skus.value = loadedSkus
      } catch {
        specs.value = []
        skus.value = []
      }
    })(),
  ])
  faved.value = await checkFav(Number(route.params.id))
})
</script>

<style scoped>
.pdp-page { min-height: 100vh; padding-bottom: 76px; background: var(--color-bg-page); }
.pdp-nav {
  position: sticky;
  top: 0;
  z-index: 60;
  height: 60px;
  display: grid;
  grid-template-columns: 44px auto 1fr 44px;
  align-items: center;
  gap: var(--space-xs);
  padding-inline: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in oklch, var(--color-bg-card) 94%, transparent);
  backdrop-filter: blur(16px);
}
.nav-button { width: 44px; height: 44px; display: grid; place-items: center; padding: 0; border: 1px solid var(--color-border); border-radius: 50%; background: var(--color-bg-card); color: var(--color-text-primary); cursor: pointer; }
.nav-button.active { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary-dark); }
.nav-brand { display: none; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 760; }
.nav-brand img { border-radius: 9px; }
.nav-title { min-width: 0; text-align: center; font-family: var(--font-display); font-size: 17px; font-weight: 670; }
.pdp-shell { width: min(100%, var(--page-max)); margin-inline: auto; padding: var(--space-sm) var(--space-sm) var(--space-2xl); }
.product-primary { display: grid; gap: var(--space-sm); }
.product-gallery { position: relative; min-width: 0; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-card); }
.hero-image,
.gallery-placeholder { width: 100%; aspect-ratio: 1; display: grid; place-items: center; }
.hero-image :deep(img) { padding: var(--space-md); }
.gallery-placeholder { background: var(--color-search-bg); color: var(--color-text-secondary); }
.gallery-placeholder.small { height: 100%; aspect-ratio: auto; font-size: 12px; }
.hero-pager { position: absolute; right: var(--space-sm); bottom: var(--space-sm); padding: 5px 9px; border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-bg-card); color: var(--color-text-secondary); font-size: 11px; font-variant-numeric: tabular-nums; }
.purchase-panel { padding: var(--space-lg) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-card); }
.product-tags { display: flex; flex-wrap: wrap; gap: 6px 12px; margin-bottom: var(--space-sm); }
.product-tags span { color: var(--color-primary-dark); font-size: 12px; font-weight: 670; }
.product-tags span + span::before { content: '·'; margin-right: 12px; color: var(--color-border-strong); }
.purchase-panel h1 { margin: 0; font-family: var(--font-display); font-size: clamp(24px, 6vw, 36px); font-weight: 640; line-height: 1.22; letter-spacing: -0.035em; overflow-wrap: anywhere; }
.price-row { display: flex; align-items: baseline; flex-wrap: wrap; gap: 5px 10px; margin-top: var(--space-lg); }
.price { color: var(--color-price); font-family: var(--font-display); font-size: 36px; font-weight: 740; line-height: 1; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; }
.price small,
.price sup { font-size: 15px; font-weight: 650; }
.price-from { color: var(--color-text-secondary); font-size: 12px; }
.price-row del { color: var(--color-text-tertiary); font-size: 13px; }
.trust-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin: var(--space-lg) 0 0; padding: 0; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-border); list-style: none; }
.trust-list li { min-width: 0; min-height: 70px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 8px 5px; background: var(--color-bg-page); color: var(--color-text-secondary); text-align: center; font-size: 11px; }
.trust-list svg { color: var(--color-primary-dark); flex: 0 0 auto; }
.specs { display: flex; flex-direction: column; gap: var(--space-md); margin-top: var(--space-lg); padding-top: var(--space-lg); border-top: 1px solid var(--color-border); }
.spec-group h2 { margin: 0 0 var(--space-xs); color: var(--color-text-secondary); font-size: 13px; font-weight: 650; }
.spec-options { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
.spec-options button { min-height: 44px; padding: 8px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-card); color: var(--color-text-primary); cursor: pointer; font-size: 13px; }
.spec-options button.active { border-color: var(--color-primary-dark); background: var(--color-primary-soft); color: var(--color-primary-dark); font-weight: 650; }
.spec-error { margin: 0; color: var(--color-price); font-size: 13px; }
.fulfilment-list { margin: var(--space-lg) 0 0; border-top: 1px solid var(--color-border); }
.fulfilment-list div { display: grid; grid-template-columns: 64px 1fr; gap: var(--space-sm); padding: var(--space-sm) 0; border-bottom: 1px solid var(--color-border); }
.fulfilment-list dt { color: var(--color-text-secondary); font-size: 13px; }
.fulfilment-list dd { margin: 0; color: var(--color-text-primary); font-size: 13px; line-height: 1.5; }
.desktop-purchase-actions { display: none; grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); margin-top: var(--space-lg); }
.button-primary,
.button-secondary { min-height: 48px; padding-inline: var(--space-md); border-radius: var(--radius-md); cursor: pointer; font-weight: 700; }
.button-primary { border: 1px solid var(--color-accent-ink); background: var(--color-accent-ink); color: var(--color-text-inverse); }
.button-secondary { border: 1px solid var(--color-border-strong); background: var(--color-bg-card); color: var(--color-primary-dark); }
.details-layout { display: grid; gap: var(--space-sm); margin-top: var(--space-sm); }
.detail-section { padding: var(--space-lg) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-card); }
.section-eyebrow { color: var(--color-primary-dark); font-family: var(--font-display); font-size: 10px; font-weight: 720; letter-spacing: .12em; }
.detail-section h2,
.recommendation-heading h2 { margin: 5px 0 0; font-family: var(--font-display); font-size: 24px; letter-spacing: -0.035em; }
.product-description { max-width: 72ch; margin: var(--space-md) 0 0; color: var(--color-text-secondary); font-size: 14px; line-height: 1.75; white-space: pre-wrap; overflow-wrap: anywhere; }
.empty-copy { margin: var(--space-md) 0 0; color: var(--color-text-secondary); font-size: 14px; }
.review-heading { display: flex; align-items: end; justify-content: space-between; gap: var(--space-md); }
.review-score { color: var(--color-primary-dark); font-size: 13px; font-weight: 650; }
.review-list { display: flex; flex-direction: column; gap: var(--space-md); margin-top: var(--space-lg); }
.review-item { padding-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); }
.review-item:last-child { padding-bottom: 0; border-bottom: 0; }
.review-meta { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); }
.review-meta strong { font-size: 13px; }
.review-meta > span { color: var(--color-primary-dark); font-size: 12px; letter-spacing: 1px; }
.review-meta i { color: var(--color-border-strong); font-style: normal; }
.review-item > p { margin: var(--space-xs) 0 0; font-size: 14px; line-height: 1.65; }
.review-item time { display: block; margin-top: var(--space-xs); color: var(--color-text-tertiary); font-size: 11px; }
.review-images { display: grid; grid-template-columns: repeat(4, minmax(0, 72px)); gap: var(--space-xs); margin-top: var(--space-sm); }
.review-images button { aspect-ratio: 1; overflow: hidden; padding: 0; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-search-bg); cursor: pointer; }
.review-images :deep(.van-image) { width: 100%; height: 100%; }
.merchant-reply { display: flex; flex-direction: column; gap: 4px; margin-top: var(--space-sm); padding: var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-primary-soft); color: var(--color-text-secondary); font-size: 13px; line-height: 1.55; }
.merchant-reply strong { color: var(--color-primary-dark); font-size: 11px; }
.recommendations { margin-top: var(--space-xl); }
.recommendation-heading { margin-bottom: var(--space-md); }
.recommendation-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-sm); }
.recommendation-card { min-width: 0; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-card); }
.recommendation-image { width: 100%; aspect-ratio: 1; display: block; background: var(--color-search-bg); }
.recommendation-card h3 { min-height: 42px; margin: var(--space-sm) var(--space-sm) 0; font-size: 14px; font-weight: 560; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.recommendation-price { display: block; margin: var(--space-xs) var(--space-sm) var(--space-sm); color: var(--color-price); font-family: var(--font-display); font-size: 19px; font-weight: 720; }
.mobile-purchase-bar { position: fixed; inset-inline: 0; bottom: 0; z-index: 100; min-height: 68px; display: grid; grid-template-columns: 52px 1fr 1fr; align-items: center; gap: var(--space-xs); padding: 9px var(--space-sm) calc(9px + env(safe-area-inset-bottom)); border-top: 1px solid var(--color-border); background: color-mix(in oklch, var(--color-bg-card) 96%, transparent); backdrop-filter: blur(16px); }
.mobile-purchase-bar .button-primary,
.mobile-purchase-bar .button-secondary { min-width: 0; min-height: 46px; padding-inline: var(--space-xs); font-size: 14px; }
.cart-link { min-width: 44px; min-height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: var(--color-text-secondary); font-size: 10px; }
.pdp-loading { display: grid; gap: var(--space-sm); }
.loading-media { aspect-ratio: 1; border-radius: var(--radius-lg); background: var(--color-search-bg); }
.loading-copy { display: flex; flex-direction: column; gap: var(--space-sm); padding: var(--space-lg); border-radius: var(--radius-lg); background: var(--color-bg-card); }
.loading-copy span { height: 18px; border-radius: 5px; background: var(--color-search-bg); }
.loading-copy span:nth-child(2) { width: 72%; }
.loading-copy span:nth-child(3) { width: 48%; }
.state-panel { min-height: 55vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-sm); color: var(--color-text-secondary); text-align: center; }
.state-panel p { margin: 0; }
.state-panel button { min-height: 44px; padding-inline: 18px; border: 0; border-radius: var(--radius-md); background: var(--color-accent-ink); color: var(--color-text-inverse); cursor: pointer; font-weight: 680; }

@media (min-width: 600px) {
  .pdp-shell { padding-inline: var(--space-lg); }
  .recommendation-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-md); }
}

@media (min-width: 900px) {
  .pdp-page { padding-bottom: 0; }
  .pdp-nav { height: 72px; grid-template-columns: 44px auto 1fr 44px; padding-inline: max(var(--space-lg), calc((100vw - var(--page-max)) / 2)); }
  .nav-brand { display: flex; }
  .nav-title { text-align: right; padding-right: var(--space-sm); }
  .pdp-shell { padding-top: var(--space-xl); padding-bottom: var(--space-3xl); }
  .product-primary { grid-template-columns: minmax(0, 1.12fr) minmax(360px, .88fr); gap: var(--space-xl); align-items: start; }
  .product-gallery { position: sticky; top: 104px; }
  .purchase-panel { padding: clamp(28px, 3vw, 44px); }
  .purchase-panel h1 { font-size: clamp(30px, 3vw, 42px); }
  .trust-list li { min-height: 76px; font-size: 12px; }
  .desktop-purchase-actions { display: grid; }
  .details-layout { grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: var(--space-xl); margin-top: var(--space-xl); }
  .detail-section { padding: var(--space-xl); }
  .mobile-purchase-bar { display: none; }
  .pdp-loading { grid-template-columns: 1fr .85fr; gap: var(--space-xl); }
}
</style>
