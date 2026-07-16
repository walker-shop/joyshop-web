<template>
  <div class="pdp">
    <!-- 顶栏 -->
    <div class="pdp-nav">
      <div class="nav-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
      </div>
      <div class="nav-title">商品详情</div>
      <div class="nav-btn" @click="showToast('功能开发中')">
        <svg viewBox="0 0 24 24"><path d="M6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
      </div>
    </div>

    <!-- Hero 图 -->
    <div class="pdp-hero">
      <van-swipe :autoplay="4000" lazy-render @change="onSwipe">
        <van-swipe-item v-for="(img, idx) in heroImages" :key="idx">
          <van-image class="hero-img" :src="img" fit="cover">
            <template #loading><van-loading type="spinner" /></template>
            <template #error><div class="hero-ph">暂无图片</div></template>
          </van-image>
        </van-swipe-item>
        <template #indicator><span /></template>
      </van-swipe>
      <div v-if="heroImages.length" class="hero-pager">{{ heroIdx + 1 }}/{{ heroImages.length }}</div>
    </div>

    <!-- 价格条 -->
    <div class="pdp-pricebar">
      <div class="pb-price">
        <span class="pb-cur">¥</span><b>{{ priceParts(goods.shopPrice).int }}</b><span class="pb-dec">.{{ priceParts(goods.shopPrice).dec }}</span>
        <span v-if="goods.marketPrice > goods.shopPrice" class="pb-old">¥{{ goods.marketPrice }}</span>
      </div>
      <div class="pb-row">
        <span v-if="goods.shipFree" class="pb-chip">包邮</span>
        <span v-if="goods.isHot" class="pb-chip">热销</span>
        <span v-if="goods.isNew" class="pb-chip">新品</span>
      </div>
    </div>

    <!-- 标题 + 信任徽章 -->
    <div class="pdp-blk">
      <div class="pdp-title">{{ goods.name || '加载中…' }}</div>
      <div class="pdp-trust">
        <span>✓ 正品保障</span><span>✓ 7天无理由</span><span>✓ 极速退款</span>
      </div>
    </div>

    <!-- 规格行 -->
    <div class="pdp-blk">
      <div class="cell" @click="showToast('规格选择开发中')">
        <span class="k">选择</span><span class="v">规格 / 数量</span><span class="arr">›</span>
      </div>
      <div class="cell">
        <span class="k">配送</span><span class="v">{{ goods.shipFree ? '包邮' : '快递' }} · 付款后48小时内发货</span>
      </div>
      <div class="cell">
        <span class="k">服务</span><span class="v">正品保障 · 极速退款 · 运费险</span>
      </div>
    </div>

    <!-- 商品详情 -->
    <div v-if="goods.goodsDesc || goods.goodsBrief" class="pdp-blk">
      <div class="blk-title">商品详情</div>
      <div class="pdp-desc">{{ goods.goodsDesc || goods.goodsBrief }}</div>
    </div>

    <!-- 猜你喜欢 -->
    <div v-if="recos.length" class="pdp-reco">
      <div class="reco-title">— 猜你喜欢 —</div>
      <div class="reco-grid">
        <div v-for="r in recos" :key="r.id" class="rcard" @click="goDetail(r.id)">
          <van-image class="rcard-img" :src="r.goodsFrontImage" fit="cover">
            <template #error><div class="hero-ph sm">暂无图片</div></template>
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
      <div class="bar-ic" @click="showToast('客服功能开发中')">
        <svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg><span>客服</span>
      </div>
      <div ref="cartIconRef" class="bar-ic" :class="{ bump: cartBump }" @click="navigateTo('/cart')">
        <svg viewBox="0 0 24 24"><path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7.2 14.6l.9-1.6h7.5c.7 0 1.4-.4 1.7-1L21 4H6.2L5.3 2H2v2h2z"/></svg><span>购物车</span>
      </div>
      <button ref="addBtnRef" class="btn-cart" @click="onAddCart">加入购物车</button>
      <button class="btn-buy" @click="onBuyNow">立即购买</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'

definePageMeta({ layout: 'blank' })

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

function goDetail(id: number) { navigateTo(`/goods/${id}`) }

useSeoMeta({
  title: () => `${goods.value?.name || '商品'} - ZShop`,
  ogImage: () => heroImages.value[0] ?? '',
})

// 加购/购买：真实对接 order-web /v1/cart
const { apiFetch } = useApi()
const { isLoggedIn } = useAuth()
const { refresh: refreshCart } = useCartCount()

function requireLogin(): boolean {
  if (!isLoggedIn.value) {
    showToast('请先登录')
    navigateTo(`/login?redirect=/goods/${route.params.id}`)
    return false
  }
  return true
}
async function addToCart(): Promise<boolean> {
  try {
    await apiFetch<{ id: number; msg: string }>('/v1/cart', {
      method: 'POST',
      body: { goodsId: Number(route.params.id), nums: 1, checked: true },
    })
    await refreshCart()
    return true
  } catch (e: any) {
    showToast(e?.data?.msg || e?.message || '加入购物车失败')
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
  if (await addToCart()) { flyToCart(); showToast('已加入购物车') }
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
.pdp-title { font-size: 16px; font-weight: 700; line-height: 1.5; color: var(--color-text-primary); }
.pdp-trust { display: flex; gap: 8px; margin-top: 10px; }
.pdp-trust span { font-size: 11px; color: var(--color-primary); background: var(--color-primary-soft); padding: 3px 8px; border-radius: 4px; }
.blk-title { font-size: 15px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 8px; }
.pdp-desc { font-size: 14px; line-height: 1.7; color: var(--color-text-secondary); white-space: pre-wrap; word-break: break-word; }

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
