<template>
  <div class="pdp">
    <!-- 顶栏 -->
    <div class="pdp-nav">
      <div class="nav-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
      </div>
      <div class="nav-title">{{ $t('pdp.navTitle') }}</div>
      <div class="nav-btn" :class="{ 'is-faved': faved }" :aria-label="$t('user.favorites')" @click="onToggleFav">
        <svg v-if="faved" viewBox="0 0 24 24"><path d="M12 21s-7.5-4.8-10-9.3C.6 8.9 2 5.5 5.2 5.5c1.8 0 3.1 1 3.8 2.1.7-1.1 2-2.1 3.8-2.1 3.2 0 4.6 3.4 3.2 6.2C19.5 16.2 12 21 12 21z"/></svg>
        <svg v-else viewBox="0 0 24 24"><path d="M12 20.3l-.1.1-.11-.1C7.14 15.99 4 13.14 4 10.25 4 8.25 5.5 6.75 7.5 6.75c1.54 0 3.04.99 3.57 2.36h1.87C13.46 7.74 14.96 6.75 16.5 6.75c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>
      </div>
    </div>

    <!-- Hero 图 -->
    <div class="pdp-hero">
      <van-swipe :autoplay="4000" lazy-render @change="onSwipe">
        <van-swipe-item v-for="(img, idx) in heroImages" :key="idx">
          <van-image class="hero-img" :src="img" fit="cover">
            <template #loading><van-loading type="spinner" /></template>
            <template #error><div class="hero-ph">{{ $t('pdp.noImage') }}</div></template>
          </van-image>
        </van-swipe-item>
        <template #indicator><span /></template>
      </van-swipe>
      <div v-if="heroImages.length" class="hero-pager">{{ heroIdx + 1 }}/{{ heroImages.length }}</div>
    </div>

    <!-- 价格条 -->
    <div class="pdp-pricebar">
      <div class="pb-price">
        <span v-if="hasSpecs && !selectedSku" class="pb-from">{{ $t('pdp.priceFrom') }}</span>
        <span class="pb-cur">¥</span><b>{{ priceParts(displayPrice).int }}</b><span class="pb-dec">.{{ priceParts(displayPrice).dec }}</span>
        <span v-if="!hasSpecs && goods.marketPrice > goods.shopPrice" class="pb-old">¥{{ goods.marketPrice }}</span>
      </div>
      <div class="pb-row">
        <span v-if="goods.shipFree" class="pb-chip">{{ $t('home.tagFreeShip') }}</span>
        <span v-if="goods.isHot" class="pb-chip">{{ $t('home.tagHot') }}</span>
        <span v-if="goods.isNew" class="pb-chip">{{ $t('home.tagNew') }}</span>
      </div>
    </div>

    <!-- 标题 + 信任徽章 -->
    <div class="pdp-blk">
      <div class="pdp-title">{{ goods.name || $t('common.loading') }}</div>
      <div class="pdp-trust">
        <span>✓ {{ $t('login.perkGenuine') }}</span><span>✓ {{ $t('pdp.noReason7') }}</span><span>✓ {{ $t('login.perkRefund') }}</span>
      </div>
    </div>

    <!-- SKU 规格选择器（有规格才显示） -->
    <div v-if="hasSpecs" class="pdp-blk pdp-specs">
      <div v-for="spec in specs" :key="spec.id" class="spec-dim">
        <div class="spec-name">{{ spec.name }}</div>
        <div class="spec-opts">
          <button
            v-for="val in spec.values" :key="val.id"
            class="spec-opt" :class="{ active: selectedValues[spec.id] === val.id }"
            @click="selectValue(spec.id, val.id)"
          >{{ val.value }}</button>
        </div>
      </div>
      <div v-if="allSelected && !selectedSku" class="spec-unavail">{{ $t('pdp.skuUnavailable') }}</div>
    </div>

    <!-- 规格行 -->
    <div class="pdp-blk">
      <div class="cell">
        <span class="k">{{ $t('pdp.delivery') }}</span><span class="v">{{ goods.shipFree ? $t('home.tagFreeShip') : $t('pdp.express') }} · {{ $t('pdp.shipTip') }}</span>
      </div>
      <div class="cell">
        <span class="k">{{ $t('pdp.service') }}</span><span class="v">{{ $t('pdp.serviceDesc') }}</span>
      </div>
    </div>

    <!-- 商品详情 -->
    <div v-if="goods.goodsDesc || goods.goodsBrief" class="pdp-blk">
      <div class="blk-title">{{ $t('pdp.navTitle') }}</div>
      <div class="pdp-desc">{{ goods.goodsDesc || goods.goodsBrief }}</div>
    </div>

    <!-- 评价 -->
    <div class="pdp-blk">
      <div class="blk-title pdp-rv-hd">
        <span>{{ $t('review.sectionTitle') }}</span>
        <span v-if="reviews.total" class="pdp-rv-agg">★ {{ reviews.avgRating.toFixed(1) }} · {{ $t('review.countLabel', { n: reviews.total }) }}</span>
      </div>
      <div v-if="reviews.data.length" class="pdp-rv-list">
        <div v-for="(r, i) in reviews.data" :key="i" class="pdp-rv-item">
          <div class="pdp-rv-top">
            <span class="pdp-rv-user">{{ r.nickname }}</span>
            <span class="pdp-rv-stars">{{ '★'.repeat(r.rating) }}<span class="pdp-rv-off">{{ '★'.repeat(5 - r.rating) }}</span></span>
          </div>
          <div v-if="r.content" class="pdp-rv-content">{{ r.content }}</div>
          <div class="pdp-rv-time">{{ r.createdAt.slice(0, 10) }}</div>
        </div>
      </div>
      <div v-else class="pdp-rv-empty">{{ $t('review.empty') }}</div>
    </div>

    <!-- 猜你喜欢 -->
    <div v-if="recos.length" class="pdp-reco">
      <div class="reco-title">— {{ $t('home.recommendSub') }} —</div>
      <div class="reco-grid">
        <div v-for="r in recos" :key="r.id" class="rcard" @click="goDetail(r.id)">
          <van-image class="rcard-img" :src="r.goodsFrontImage" fit="cover">
            <template #error><div class="hero-ph sm">{{ $t('pdp.noImage') }}</div></template>
          </van-image>
          <div class="rcard-body">
            <div class="rcard-title">{{ r.name }}</div>
            <div class="rcard-price"><span class="pp-cur">¥</span><span class="pp-int">{{ priceParts(r.shopPrice).int }}</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部双 CTA -->
    <div class="pdp-bar">
      <div ref="cartIconRef" class="bar-ic" :class="{ bump: cartBump }" @click="navigateTo('/cart')">
        <svg viewBox="0 0 24 24"><path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7.2 14.6l.9-1.6h7.5c.7 0 1.4-.4 1.7-1L21 4H6.2L5.3 2H2v2h2z"/></svg><span>{{ $t('nav.cart') }}</span>
      </div>
      <button ref="addBtnRef" class="btn-cart" @click="onAddCart">{{ $t('common.addToCart') }}</button>
      <button class="btn-buy" @click="onBuyNow">{{ $t('pdp.buyNow') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'

definePageMeta({ layout: 'blank' })

const { t } = useI18n()
const config = useRuntimeConfig()
const { tenantId } = useTenant()
const route = useRoute()

const heroIdx = ref(0)
function onSwipe(i: number) { heroIdx.value = i }

function priceParts(n: number) {
  const v = Number(n || 0).toFixed(2)
  const [int = '0', dec = '00'] = v.split('.')
  return { int, dec }
}

// 真实商品数据
const { data: goods } = await useAsyncData(`goods-${route.params.id}`, async () => {
  try {
    const res = await $fetch<{ code: number; data: any }>(
      `${config.public.apiBase}/v1/goods/${route.params.id}`,
      { params: { tenant_id: tenantId } },
    )
    if (res.code === 200 && res.data) return res.data
  } catch (e) { console.warn('goods detail:', e) }
  return {}
}, {
  server: false, // 客户端拉取（走 Vite dev 代理到本地网关；SSR 相对路径拿不到）
  default: () => ({ name: '', shopPrice: 0, marketPrice: 0, images: [], goodsFrontImage: '' }),
})

const heroImages = computed(() => {
  const imgs = (goods.value?.images || []).filter(Boolean)
  if (imgs.length) return imgs
  return goods.value?.goodsFrontImage ? [goods.value.goodsFrontImage] : []
})

// ── SKU/规格 ──
const { loadSpecs, loadSkus, matchSku } = useSkus()
const specs = ref<GoodsSpec[]>([])
const skus = ref<GoodsSku[]>([])
const selectedValues = ref<Record<number, number>>({}) // spec_id -> value_id
const hasSpecs = computed(() => specs.value.length > 0)
const selectedValueIds = computed(() => specs.value.map(s => selectedValues.value[s.id]).filter(Boolean) as number[])
const allSelected = computed(() => hasSpecs.value && selectedValueIds.value.length === specs.value.length)
const selectedSku = computed(() => allSelected.value ? matchSku(skus.value, selectedValueIds.value) : null)
const skuSpecLabel = computed(() => specs.value
  .map(s => s.values.find(x => x.id === selectedValues.value[s.id])?.value)
  .filter(Boolean).join(','))
// 展示价：选中 SKU→SKU价；未选的 SKU 商品→最低价起；扁平→goods.shopPrice
const displayPrice = computed(() => {
  if (selectedSku.value) return selectedSku.value.shop_price
  if (hasSpecs.value && skus.value.length) return Math.min(...skus.value.map(s => s.shop_price))
  return goods.value?.shopPrice || 0
})
function selectValue(specId: number, valueId: number) {
  selectedValues.value = { ...selectedValues.value, [specId]: valueId }
}
onMounted(async () => {
  try {
    const [sp, sk] = await Promise.all([loadSpecs(route.params.id as string), loadSkus(route.params.id as string)])
    specs.value = sp; skus.value = sk
  } catch (e) { console.warn('skus:', e) }
})

// 猜你喜欢：真实热卖商品
const recos = ref<any[]>([])
async function fetchRecos() {
  try {
    const res = await $fetch<{ code: number; data: { data: any[] } }>(
      `${config.public.apiBase}/v1/goods`,
      { params: { page: 1, pageSize: 6, isHot: true, tenant_id: tenantId } },
    )
    if (res.code === 200 && res.data?.data) {
      recos.value = res.data.data.filter((g: any) => String(g.id) !== String(route.params.id)).slice(0, 4)
    }
  } catch (e) { console.warn('recos:', e) }
}
onMounted(fetchRecos)

// 评价列表 + 聚合
const { getGoodsReviews } = useReviews()
const reviews = ref<GoodsReviews>({ avgRating: 0, total: 0, data: [] })
async function fetchReviews() {
  try {
    reviews.value = await getGoodsReviews(route.params.id as string, tenantId as number, 1, 20)
  } catch (e) { console.warn('reviews:', e) }
}
onMounted(fetchReviews)

function goDetail(id: number) { navigateTo(`/goods/${id}`) }

useSeoMeta({
  title: () => `${goods.value?.name || '商品'} - ZShop`,
  ogImage: () => heroImages.value[0] ?? '',
})

// 加购/购买：真实对接 order-web /v1/cart
const { apiFetch } = useApi()
const { isLoggedIn } = useAuth()
const { refresh: refreshCart } = useCartCount()

// 收藏
const { check: checkFav, add: addFav, remove: removeFav } = useFav()
const faved = ref(false)
onMounted(async () => { faved.value = await checkFav(Number(route.params.id)) })
async function onToggleFav() {
  if (!requireLogin()) return
  const id = Number(route.params.id)
  try {
    if (faved.value) { await removeFav(id); faved.value = false; showToast(t('user.favRemoved')) }
    else { await addFav(id); faved.value = true; showToast(t('user.favAdded')) }
  } catch (e: any) { showToast(e?.data?.msg || e?.message || t('user.favActionFailed')) }
}

function requireLogin(): boolean {
  if (!isLoggedIn.value) {
    showToast(t('common.loginRequired'))
    navigateTo(`/login?redirect=/goods/${route.params.id}`)
    return false
  }
  return true
}
async function addToCart(): Promise<boolean> {
  // SKU 商品必须选全规格且命中可用 SKU
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
  } catch (e: any) {
    showToast(e?.data?.msg || e?.message || t('common.addToCartFailed'))
    return false
  }
}
// 飞入购物车动画
const cartIconRef = ref<HTMLElement | null>(null)
const addBtnRef = ref<HTMLElement | null>(null)
const cartBump = ref(false)
function flyToCart() {
  if (!import.meta.client) return
  const cart = cartIconRef.value?.getBoundingClientRect()
  const btn = addBtnRef.value?.getBoundingClientRect()
  if (!cart || !btn) return
  const sx = btn.left + btn.width / 2
  const sy = btn.top + btn.height / 2
  const dx = (cart.left + cart.width / 2) - sx
  const dy = (cart.top + cart.height / 2) - sy
  const ball = document.createElement('div')
  ball.style.cssText = `position:fixed;left:${sx}px;top:${sy}px;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:linear-gradient(135deg,#e6cd8f,#a9822f);box-shadow:0 5px 14px rgba(169,130,47,.6);z-index:9999;pointer-events:none;`
  document.body.appendChild(ball)
  const anim = ball.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0 },
    { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 90}px) scale(.95)`, opacity: 1, offset: 0.5 },
    { transform: `translate(${dx}px,${dy}px) scale(.25)`, opacity: .35, offset: 1 },
  ], { duration: 680, easing: 'cubic-bezier(.45,-0.25,.7,1)' })
  anim.onfinish = () => {
    ball.remove()
    cartBump.value = true
    setTimeout(() => { cartBump.value = false }, 420)
  }
}
async function onAddCart() {
  if (!requireLogin()) return
  if (await addToCart()) { flyToCart(); showToast(t('common.addedToCart')) }
}
async function onBuyNow() {
  if (!requireLogin()) return
  if (await addToCart()) navigateTo('/cart')
}
</script>

<style scoped>
.pdp {
  background-color: var(--color-bg-page);
  min-height: 100vh;
  padding-bottom: 66px;
  transition: var(--theme-transition);
}

/* 顶栏 */
.pdp-nav {
  position: sticky; top: 0; z-index: 20;
  height: 48px; display: flex; align-items: center; padding: 0 12px; gap: 8px;
  background: var(--color-bg-card); border-bottom: 1px solid var(--color-border);
}
.nav-btn { width: 34px; height: 34px; border-radius: 50%; background: var(--color-bg-page); display: flex; align-items: center; justify-content: center; }
.nav-btn svg { width: 18px; height: 18px; fill: var(--color-text-primary); }
.nav-btn.is-faved { background: var(--color-primary-soft); }
.nav-btn.is-faved svg { fill: var(--color-primary); }
.nav-btn:active { transform: scale(.9); }
.nav-title { flex: 1; text-align: center; font-weight: 700; font-size: 15px; color: var(--color-text-primary); }

/* Hero */
.pdp-hero { position: relative; background: var(--color-bg-card); }
.hero-img { width: 100%; height: 390px; display: block; }
.hero-ph { width: 100%; height: 390px; display: flex; align-items: center; justify-content: center; color: var(--color-text-tertiary); background: var(--color-bg-page); }
.hero-ph.sm { height: 100%; }
.hero-pager { position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,.45); color: #fff; font-size: 11px; padding: 3px 10px; border-radius: 20px; }

/* 价格条 */
.pdp-pricebar { background: linear-gradient(120deg, var(--color-primary), var(--color-primary-light)); color: #fff; padding: 14px 16px; }
.pb-price { display: flex; align-items: baseline; }
.pb-cur { font-size: 15px; font-weight: 700; }
.pb-price b { font-size: 30px; font-weight: 800; }
.pb-dec { font-size: 14px; font-weight: 700; }
.pb-old { text-decoration: line-through; opacity: .85; font-size: 13px; margin-left: 8px; }
.pb-row { display: flex; gap: 6px; margin-top: 8px; }
.pb-chip { background: #fff; color: var(--color-primary); border-radius: 4px; padding: 1px 7px; font-size: 11px; font-weight: 700; }

/* 区块 */
.pdp-blk { background: var(--color-bg-card); margin-top: 8px; padding: 14px 16px; }
.pb-from { font-size: 12px; color: var(--color-text-secondary, #999); margin-right: 3px; align-self: flex-end; margin-bottom: 4px; }
.pdp-specs { display: flex; flex-direction: column; gap: 14px; }
.spec-dim { display: flex; flex-direction: column; gap: 8px; }
.spec-name { font-size: 13px; color: var(--color-text-secondary, #888); font-weight: 600; }
.spec-opts { display: flex; flex-wrap: wrap; gap: 8px; }
.spec-opt {
  border: 1px solid var(--color-border, #ddd); background: var(--color-bg-card, #fff);
  color: var(--color-text, #222); border-radius: 8px; padding: 7px 14px; font-size: 13px; cursor: pointer;
  transition: all .15s;
}
.spec-opt.active { border-color: var(--color-primary); color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 8%, transparent); font-weight: 600; }
.spec-unavail { font-size: 12px; color: #e33; }
.pdp-title { font-size: 16px; font-weight: 700; line-height: 1.5; color: var(--color-text-primary); }
.pdp-trust { display: flex; gap: 8px; margin-top: 10px; }
.pdp-trust span { font-size: 11px; color: var(--color-primary); background: var(--color-primary-soft); padding: 3px 8px; border-radius: 4px; }
.blk-title { font-size: 15px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 8px; }
.pdp-desc { font-size: 14px; line-height: 1.7; color: var(--color-text-secondary); white-space: pre-wrap; word-break: break-word; }

/* ---- 评价区块 ---- */
.pdp-rv-hd { display: flex; align-items: baseline; justify-content: space-between; }
.pdp-rv-agg { font-size: 13px; font-weight: 600; color: #d9a441; }
.pdp-rv-list { display: flex; flex-direction: column; gap: 14px; }
.pdp-rv-item { border-bottom: 1px solid var(--color-border, rgba(0,0,0,.06)); padding-bottom: 12px; }
.pdp-rv-item:last-child { border-bottom: 0; padding-bottom: 0; }
.pdp-rv-top { display: flex; align-items: center; justify-content: space-between; }
.pdp-rv-user { font-size: 13px; color: var(--color-text-secondary); }
.pdp-rv-stars { font-size: 13px; color: #e3ba7d; letter-spacing: 1px; }
.pdp-rv-off { color: var(--color-border, rgba(0,0,0,.15)); }
.pdp-rv-content { font-size: 14px; line-height: 1.6; color: var(--color-text-primary); margin-top: 7px; word-break: break-word; }
.pdp-rv-time { font-size: 11px; color: var(--color-text-secondary); margin-top: 6px; opacity: .7; }
.pdp-rv-empty { font-size: 13px; color: var(--color-text-secondary); text-align: center; padding: 12px 0; }

.cell { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--color-border); font-size: 14px; }
.cell:last-child { border-bottom: 0; }
.cell .k { color: var(--color-text-tertiary); width: 56px; flex: 0 0 56px; }
.cell .v { flex: 1; color: var(--color-text-primary); }
.cell .arr { color: var(--color-text-tertiary); }

/* 猜你喜欢 */
.pdp-reco { padding: 14px 12px; }
.reco-title { text-align: center; font-size: 14px; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 12px; }
.reco-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.rcard { background: var(--color-bg-card); border-radius: 12px; overflow: hidden; box-shadow: 0 1px 6px rgba(0,0,0,.04); }
.rcard-img { width: 100%; aspect-ratio: 1/1; display: block; background: var(--color-bg-page); }
.rcard-body { padding: 8px 10px 10px; }
.rcard-title { font-size: 13px; line-height: 1.4; color: var(--color-text-primary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 36px; }
.rcard-price { color: var(--color-price); font-weight: 800; margin-top: 4px; }
.pp-cur { font-size: 12px; } .pp-int { font-size: 18px; }

/* 底部双 CTA */
.pdp-bar {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px; height: 58px;
  display: flex; align-items: center; padding: 0 12px; gap: 10px;
  background: var(--color-bg-card); border-top: 1px solid var(--color-border); z-index: 100;
}
.bar-ic { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 10px; color: var(--color-text-secondary); width: 44px; }
.bar-ic svg { width: 20px; height: 20px; fill: var(--color-text-secondary); }
.btn-cart, .btn-buy { flex: 1; height: 42px; border: 0; font-weight: 800; font-size: 15px; }
.btn-cart { border-radius: 21px 0 0 21px; color: var(--color-primary-dark);
  background: color-mix(in srgb, var(--color-primary) 18%, var(--color-bg-page));
  border: 1px solid color-mix(in srgb, var(--color-primary) 40%, transparent); }
.btn-buy { border-radius: 0 21px 21px 0; color: #2a1f0a;
  background: linear-gradient(135deg, #e6cd8f, #c9a24c 52%, #a9822f);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 40%, transparent); }
.btn-cart:active, .btn-buy:active { transform: scale(.98); opacity: .92; }

/* 购物车图标弹跳 */
.bar-ic.bump { animation: cartBump .42s cubic-bezier(.34,1.56,.64,1); }
.bar-ic.bump svg { fill: var(--color-primary); }
@keyframes cartBump {
  0%, 100% { transform: scale(1); }
  35% { transform: scale(1.38) translateY(-2px); }
}
</style>
