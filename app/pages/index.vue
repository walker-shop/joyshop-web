<template>
  <div class="home">
    <!-- 氛围光晕背景 -->
    <div class="ambient" aria-hidden="true" />

    <!-- 顶部玻璃头 -->
    <header class="topbar">
      <div class="brand">
        <img class="brand-mark" src="/logo.png" alt="ZShop" width="30" height="30">
        <span class="brand-name">ZShop</span>
      </div>
      <div class="search" @click="navigateTo('/search')">
        <svg viewBox="0 0 24 24" class="s-ic"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>
        <span>{{ $t('home.searchPlaceholder') }}</span>
      </div>
    </header>

    <!-- Hero：有 banner 用轮播，否则用品牌渐变位 -->
    <section class="hero">
      <van-swipe v-if="banners.length" :autoplay="3500" lazy-render class="hero-swipe" indicator-color="#fff6df">
        <van-swipe-item v-for="item in banners" :key="item.id">
          <van-image class="hero-img" :src="item.image" fit="cover" @click="item.url && navigateTo(item.url)" />
        </van-swipe-item>
      </van-swipe>
      <div v-else class="hero-blank">
        <div class="hero-eyebrow">{{ $t('home.heroTag') }}</div>
        <div class="hero-title">{{ $t('home.heroTitle1') }}<em>{{ $t('home.heroTitle2') }}</em></div>
        <div class="hero-sub">{{ $t('home.heroSubtitle') }}</div>
      </div>
    </section>

    <!-- 类目金格 -->
    <nav v-if="topCategories.length" class="cats">
      <button
        v-for="cat in topCategories"
        :key="cat.id"
        class="cat"
        @click="navigateTo(`/category?id=${cat.id}`)"
      >
        <span class="cat-ic" :style="{ background: cat.tint }">
          <component :is="cat.comp" :size="24" weight="duotone" :color="cat.glyph" />
        </span>
        <span>{{ cat.name }}</span>
      </button>
    </nav>

    <!-- 限时秒杀 -->
    <section v-if="flashItems.length" class="flash">
      <div class="flash-hd">
        <div class="flash-tt"><span class="spark">✦</span> {{ $t('home.flashSale') }}</div>
        <div class="flash-timer">
          <span class="lbl">{{ $t('home.flashEndIn') }}</span>
          <i>{{ countdown.h }}</i><b>:</b><i>{{ countdown.m }}</i><b>:</b><i>{{ countdown.s }}</i>
        </div>
        <span class="flash-more" @click="navigateTo('/category')">{{ $t('home.viewAll') }}</span>
      </div>
      <div class="flash-row">
        <button
          v-for="item in flashItems"
          :key="item.id"
          class="flash-item"
          @click="navigateTo(`/goods/${item.id}`)"
        >
          <div class="flash-thumb">
            <van-image class="fill" :src="item.goodsFrontImage" fit="cover">
              <template #error><div class="mono">{{ monogram(item.name) }}</div></template>
              <template #loading><div class="mono dim">{{ monogram(item.name) }}</div></template>
            </van-image>
          </div>
          <div class="flash-price">¥{{ priceParts(item.shopPrice).int }}</div>
          <div v-if="item.marketPrice > item.shopPrice" class="flash-old">¥{{ item.marketPrice }}</div>
        </button>
      </div>
    </section>

    <!-- 为你推荐 -->
    <section class="feed">
      <div class="feed-hd">
        <h2>{{ $t('home.recommend') }}</h2>
        <span>{{ $t('home.recommendSub') }}</span>
      </div>

      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div v-if="loading && !products.length" class="grid">
          <div v-for="n in 4" :key="n" class="skel" />
        </div>
        <van-empty v-else-if="!products.length" :description="$t('home.emptyGoods')">
          <template #image><div class="empty-mark">Z</div></template>
        </van-empty>
        <div v-else class="grid">
          <button
            v-for="(item, i) in products"
            :key="item.id"
            class="card"
            :style="{ animationDelay: `${Math.min(i, 8) * 45}ms` }"
            @click="navigateTo(`/goods/${item.id}`)"
          >
            <div class="card-thumb">
              <van-image class="fill" :src="item.goodsFrontImage" fit="cover">
                <template #loading><div class="mono dim">{{ monogram(item.name) }}</div></template>
                <template #error><div class="mono">{{ monogram(item.name) }}</div></template>
              </van-image>
              <div v-if="item.marketPrice > item.shopPrice" class="card-off">
                {{ Math.round((1 - item.shopPrice / item.marketPrice) * 100) }}% off
              </div>
            </div>
            <div class="card-body">
              <div class="card-title">{{ item.name }}</div>
              <div v-if="item.isHot || item.isNew || item.shipFree" class="card-tags">
                <span v-if="item.isHot" class="tag hot">{{ $t('home.tagHot') }}</span>
                <span v-if="item.isNew" class="tag">{{ $t('home.tagNew') }}</span>
                <span v-if="item.shipFree" class="tag">{{ $t('home.tagFreeShip') }}</span>
              </div>
              <div class="card-foot">
                <div class="price">
                  <span class="cur">¥</span><span class="int">{{ priceParts(item.shopPrice).int }}</span><span class="dec">.{{ priceParts(item.shopPrice).dec }}</span>
                </div>
                <span v-if="item.marketPrice > item.shopPrice" class="market">¥{{ item.marketPrice }}</span>
                <span class="add" @click.stop="quickAdd($event, item)">
                  <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>
                </span>
              </div>
            </div>
          </button>
        </div>
        <div v-if="loading && products.length" class="loading-more">{{ $t('common.loading') }}</div>
      </van-pull-refresh>
    </section>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'

const { t } = useI18n()
const config = useRuntimeConfig()
const { tenantId } = useTenant()
const refreshing = ref(false)
const loading = ref(true)

// 图片兜底：取商品名首个有效字符作金字底纹
function monogram(name: string) {
  const s = (name || '').trim()
  return s ? s[0] : 'Z'
}

// === 倒计时到当天 24:00 ===
const countdown = ref({ h: '00', m: '00', s: '00' })
let timer: ReturnType<typeof setInterval> | null = null
function tick() {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
  let s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
  const h = Math.floor(s / 3600); s -= h * 3600
  const m = Math.floor(s / 60); s -= m * 60
  const p = (n: number) => String(n).padStart(2, '0')
  countdown.value = { h: p(h), m: p(m), s: p(s) }
}
onMounted(() => {
  tick(); timer = setInterval(tick, 1000)
  // 客户端拉数据（走 Vite dev 代理到本地网关；避免 SSR 相对路径拿不到）
  fetchBanners(); fetchCategories(); fetchProducts()
})
onUnmounted(() => { if (timer) clearInterval(timer) })

// === Banners ===
interface Banner { id: number; image: string; url: string; index: number }
const banners = ref<Banner[]>([])
async function fetchBanners() {
  try {
    const res = await $fetch<{ code: number; data: { data: Banner[] } }>(
      `${config.public.apiBase}/v1/banners`, { params: { tenant_id: tenantId } },
    )
    if (res.code === 200 && res.data?.data) banners.value = res.data.data
  } catch (e) { console.warn('banners:', e) }
}

// === Categories ===
interface Category { id: number; name: string; parentId: number; level: number; icon?: string }
const { getIconDef } = useCategoryIcon()
const allCategories = ref<Category[]>([])
const topCategories = computed(() =>
  allCategories.value
    .filter(c => !c.parentId || c.parentId === 0)
    .slice(0, 10)
    .map((c) => {
      const def = getIconDef(c.name)
      // tint 用低透明度铺底，亮/暗模式都成立；glyph 取较亮一档保证暗色下的对比度
      return { ...c, comp: def.comp, tint: `${def.colors[0]}2e`, glyph: def.colors[1] }
    }),
)
async function fetchCategories() {
  try {
    const res = await $fetch<{ code: number; data: { data: Category[] } }>(
      `${config.public.apiBase}/v1/categories`,
    )
    if (res.code === 200) {
      const payload = res.data
      allCategories.value = Array.isArray(payload) ? payload : (payload?.data || [])
    }
  } catch (e) { console.warn('categories:', e) }
}

// === Products ===
const products = ref<any[]>([])
const flashItems = computed(() => products.value.slice(0, 6))

function priceParts(n: number) {
  const v = Number(n || 0).toFixed(2)
  const [int = '0', dec = '00'] = v.split('.')
  return { int, dec }
}

async function fetchProducts() {
  loading.value = true
  try {
    const res = await $fetch<{ code: number; data: { data: any[]; total: number } }>(
      `${config.public.apiBase}/v1/goods`,
      { params: { page: 1, pageSize: 20, isHot: true, tenant_id: tenantId } },
    )
    if (res.code === 200 && res.data?.data) products.value = res.data.data
  } catch (e) { console.warn('products:', e) } finally { loading.value = false }
}

async function onRefresh() {
  await Promise.all([fetchBanners(), fetchCategories(), fetchProducts()])
  refreshing.value = false
}

// 快速加购 + 飞入 tabbar 购物车
const { apiFetch } = useApi()
const { isLoggedIn } = useAuth()
const { refresh: refreshCart } = useCartCount()
async function quickAdd(e: MouseEvent, item: any) {
  if (!isLoggedIn.value) {
    showToast(t('common.loginRequired'))
    navigateTo(`/login?redirect=/`)
    return
  }
  const btn = (e.currentTarget as HTMLElement)?.getBoundingClientRect()
  try {
    await apiFetch('/v1/cart', { method: 'POST', body: { goodsId: Number(item.id), nums: 1, checked: true } })
    await refreshCart()
    if (btn) flyToCart(btn.left + btn.width / 2, btn.top + btn.height / 2, item.goodsFrontImage)
    showToast(t('common.addedToCart'))
  } catch (err: any) {
    showToast(err?.data?.msg || err?.message || t('common.addToCartFailed'))
  }
}
function flyToCart(sx: number, sy: number, img?: string) {
  if (!import.meta.client) return
  const cartTab = document.querySelectorAll('.van-tabbar .van-tabbar-item')[2] as HTMLElement
  const cart = cartTab?.getBoundingClientRect()
  if (!cart) return
  const dx = (cart.left + cart.width / 2) - sx
  const dy = (cart.top + cart.height / 2 - 8) - sy
  const ball = document.createElement('div')
  ball.style.cssText = `position:fixed;left:${sx}px;top:${sy}px;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;z-index:9999;pointer-events:none;overflow:hidden;box-shadow:0 5px 16px rgba(169,130,47,.6);${img ? `background:#000 center/cover url('${img}')` : 'background:linear-gradient(135deg,#e6cd8f,#a9822f)'};border:2px solid #f0dca6;`
  document.body.appendChild(ball)
  const anim = ball.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0 },
    { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 100}px) scale(.9)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${dx}px,${dy}px) scale(.2)`, opacity: .3, offset: 1 },
  ], { duration: 720, easing: 'cubic-bezier(.45,-0.2,.7,1)' })
  anim.onfinish = () => {
    ball.remove()
    cartTab?.classList.add('cart-bumped')
    setTimeout(() => cartTab?.classList.remove('cart-bumped'), 450)
  }
}
</script>

<style scoped>
.home {
  position: relative;
  min-height: 100vh;
  padding-bottom: 12px;
  background: var(--color-bg-page);
}

/* 氛围金色光晕 */
.ambient {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(80% 32% at 50% -4%, color-mix(in srgb, var(--color-primary) 24%, transparent), transparent 60%),
    radial-gradient(60% 26% at 100% 8%, color-mix(in srgb, var(--color-primary-light) 18%, transparent), transparent 66%);
}
.home > :not(.ambient) { position: relative; z-index: 1; }

/* ---------- 顶部玻璃头 ---------- */
.topbar {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px 12px;
  background: color-mix(in srgb, var(--color-bg-page) 72%, transparent);
  backdrop-filter: saturate(150%) blur(16px);
  -webkit-backdrop-filter: saturate(150%) blur(16px);
}
.brand { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
.brand-mark {
  width: 30px; height: 30px; border-radius: 9px; display: block;
  object-fit: cover;
  box-shadow: 0 3px 10px color-mix(in srgb, var(--color-primary) 40%, transparent);
}
.brand-name {
  font-weight: 800; font-size: 17px; letter-spacing: .3px;
  background: linear-gradient(120deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.search {
  flex: 1; height: 38px; display: flex; align-items: center; gap: 8px;
  padding: 0 14px; border-radius: 20px;
  color: var(--color-text-tertiary); font-size: 13px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 40%, transparent);
}
.s-ic { width: 16px; height: 16px; fill: var(--color-primary); flex-shrink: 0; }

/* ---------- Hero ---------- */
.hero { margin: 4px 14px 0; }
.hero-swipe { border-radius: 18px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,.14); }
.hero-img { width: 100%; aspect-ratio: 2.4 / 1; display: block; }
.hero-blank {
  border-radius: 18px; padding: 22px 20px 24px;
  color: #2a1f0a;
  background:
    radial-gradient(120% 120% at 0% 0%, #f0dca6, transparent 60%),
    linear-gradient(135deg, #e6cd8f, #c9a24c 55%, #a9822f);
  box-shadow: 0 10px 26px color-mix(in srgb, var(--color-primary) 34%, transparent);
}
.hero-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 2px; opacity: .7; }
.hero-title { font-size: 25px; font-weight: 900; line-height: 1.2; margin-top: 6px; }
.hero-title em { font-style: normal; text-decoration: underline; text-decoration-thickness: 3px; text-underline-offset: 4px; }
.hero-sub { font-size: 12.5px; margin-top: 8px; opacity: .8; }

/* ---------- 类目金格 ---------- */
.cats {
  display: grid; grid-auto-flow: column; grid-auto-columns: 19%;
  gap: 4px 0; overflow-x: auto; scroll-snap-type: x proximity;
  padding: 16px 10px 4px;
}
.cats::-webkit-scrollbar { display: none; }
.cat {
  scroll-snap-align: start;
  display: flex; flex-direction: column; align-items: center; gap: 7px;
  background: none; border: 0; padding: 4px 0; cursor: pointer;
}
/* 淡色底块 + Phosphor 图标。不打 drop-shadow：底块本身已提供分层，
   再加发光只会让 46px 的小图标发糊 */
.cat-ic {
  width: 46px; height: 46px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 15px;
  transition: transform .18s ease;
}
.cat:active .cat-ic { transform: scale(.9); }
.cat span {
  font-size: 11.5px; color: var(--color-text-secondary); max-width: 62px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ---------- 限时秒杀 ---------- */
.flash {
  margin: 14px; padding: 14px 12px 12px; border-radius: 18px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 12%, var(--color-bg-card)), var(--color-bg-card));
  border: 1px solid color-mix(in srgb, var(--color-primary) 26%, transparent);
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
}
.flash-hd { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.flash-tt { font-size: 16px; font-weight: 900; color: var(--color-text-primary); display: flex; align-items: center; gap: 5px; }
.flash-tt .spark { color: var(--color-primary); }
.flash-timer { display: flex; align-items: center; gap: 3px; }
.flash-timer .lbl { font-size: 11px; color: var(--color-text-tertiary); margin-right: 3px; }
.flash-timer i {
  font-style: normal; font-weight: 800; font-size: 12px; font-variant-numeric: tabular-nums;
  color: #fffaf0; background: linear-gradient(135deg, #c9a24c, #a9822f);
  border-radius: 5px; padding: 2px 5px; min-width: 20px; text-align: center;
}
.flash-timer b { color: var(--color-primary); font-weight: 800; }
.flash-more { margin-left: auto; font-size: 12px; color: var(--color-primary); font-weight: 600; }
.flash-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 2px; }
.flash-row::-webkit-scrollbar { display: none; }
.flash-item { flex: 0 0 82px; background: none; border: 0; padding: 0; cursor: pointer; text-align: left; }
.flash-thumb { width: 82px; height: 82px; border-radius: 12px; overflow: hidden; }
.flash-price { color: var(--color-price); font-weight: 900; font-size: 14px; margin-top: 6px; }
.flash-old { color: var(--color-text-tertiary); font-size: 10px; text-decoration: line-through; }

/* ---------- 为你推荐 ---------- */
.feed { padding: 6px 0 0; }
.feed-hd { display: flex; align-items: baseline; gap: 9px; padding: 8px 16px 12px; }
.feed-hd h2 { font-size: 19px; font-weight: 900; color: var(--color-text-primary); margin: 0;
  position: relative; padding-left: 12px; }
.feed-hd h2::before {
  content: ''; position: absolute; left: 0; top: 3px; bottom: 3px; width: 4px; border-radius: 2px;
  background: linear-gradient(180deg, var(--color-primary-light), var(--color-primary));
}
.feed-hd span { font-size: 12px; color: var(--color-text-tertiary); }

.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 0 12px 12px; }

/* 卡片 */
.card {
  background: var(--color-bg-card); border: 1px solid var(--color-border);
  border-radius: 16px; overflow: hidden; padding: 0; cursor: pointer; text-align: left;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
  animation: rise .42s cubic-bezier(.22,.61,.36,1) both;
  transition: transform .16s ease, box-shadow .16s ease;
}
.card:active { transform: translateY(1px) scale(.985); box-shadow: 0 1px 6px rgba(0,0,0,.05); }
@keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

.card-thumb { position: relative; width: 100%; aspect-ratio: 1 / 1; background: var(--color-search-bg); }
.card-off {
  position: absolute; top: 8px; left: 8px; z-index: 2;
  font-size: 10px; font-weight: 800; color: #2a1f0a;
  background: linear-gradient(135deg, #e6cd8f, #c9a24c); border-radius: 7px; padding: 3px 6px;
}
.fill { width: 100%; height: 100%; display: block; }
.mono {
  width: 100%; height: 100%; display: grid; place-items: center;
  font-size: 40px; font-weight: 900; font-style: italic;
  color: color-mix(in srgb, var(--color-primary) 55%, transparent);
  background:
    radial-gradient(120% 120% at 30% 20%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 60%),
    var(--color-search-bg);
}
.mono.dim { opacity: .5; }

.card-body { padding: 9px 11px 11px; }
.card-title {
  font-size: 13px; line-height: 1.42; color: var(--color-text-primary);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 37px;
}
.card-tags { display: flex; gap: 5px; margin: 7px 0 5px; }
.tag {
  font-size: 10px; line-height: 1; padding: 3px 6px; border-radius: 5px; font-weight: 700;
  color: var(--color-primary-dark); background: var(--color-primary-soft);
  border: 1px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
}
.tag.hot {
  color: #2a1f0a; border: 0;
  background: linear-gradient(135deg, #e6cd8f, #c9a24c);
}
.card-foot { display: flex; align-items: baseline; gap: 6px; margin-top: 5px; }
.price { color: var(--color-price); font-weight: 900; font-variant-numeric: tabular-nums; }
.cur { font-size: 12px; }
.int { font-size: 21px; }
.dec { font-size: 12px; }
.market { font-size: 11px; color: var(--color-text-tertiary); text-decoration: line-through; }
.add {
  margin-left: auto; align-self: flex-end;
  width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
  background: linear-gradient(135deg, #e6cd8f, #c9a24c 52%, #a9822f);
  box-shadow: 0 3px 9px color-mix(in srgb, var(--color-primary) 42%, transparent);
  transition: transform .14s ease;
}
.add:active { transform: scale(.86); }
.add svg { width: 15px; height: 15px; fill: #2a1f0a; }

/* 骨架屏 */
.skel {
  height: 232px; border-radius: 16px;
  background: linear-gradient(100deg, var(--color-bg-card) 30%, var(--color-search-bg) 50%, var(--color-bg-card) 70%);
  background-size: 200% 100%; animation: shine 1.3s ease-in-out infinite;
}
@keyframes shine { from { background-position: 200% 0; } to { background-position: -200% 0; } }

.empty-mark {
  width: 76px; height: 76px; margin: 0 auto; border-radius: 22px; display: grid; place-items: center;
  font-size: 40px; font-weight: 900; font-style: italic; color: #2a1f0a;
  background: linear-gradient(135deg, #e6cd8f, #c9a24c 52%, #a9822f);
  box-shadow: 0 8px 22px color-mix(in srgb, var(--color-primary) 34%, transparent);
}
.loading-more { text-align: center; padding: 16px; color: var(--color-text-tertiary); font-size: 13px; }

@media (prefers-reduced-motion: reduce) {
  .card { animation: none; }
  .skel { animation: none; }
}
</style>
