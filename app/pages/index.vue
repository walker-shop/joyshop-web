<template>
  <div class="home-page">
    <!-- 搜索栏：主色渐变底 -->
    <div class="search-wrap">
      <div class="search-box" @click="navigateTo('/search')">
        <svg viewBox="0 0 24 24" class="s-ic"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>
        <span>搜索商品</span>
      </div>
    </div>

    <!-- Banner -->
    <van-swipe v-if="banners.length" :autoplay="3000" lazy-render class="home-swiper" indicator-color="#ffffff">
      <van-swipe-item v-for="item in banners" :key="item.id">
        <van-image class="banner-img" :src="item.image" fit="cover" @click="item.url && navigateTo(item.url)" />
      </van-swipe-item>
    </van-swipe>

    <!-- 分类快捷入口 5 列 -->
    <div class="quicknav">
      <div
        v-for="cat in topCategories"
        :key="cat.id"
        class="qn"
        @click="navigateTo(`/category?id=${cat.id}`)"
      >
        <img class="qn-ic" :src="cat.icon" :alt="cat.name" />
        <span>{{ cat.name }}</span>
      </div>
    </div>

    <!-- 限时秒杀（横滑热卖） -->
    <div v-if="flashItems.length" class="flash">
      <div class="flash-hd">
        <b>限时秒杀</b>
        <span class="timer">距结束 <i>{{ countdown.h }}</i>:<i>{{ countdown.m }}</i>:<i>{{ countdown.s }}</i></span>
        <span class="more" @click="navigateTo('/category')">更多 ›</span>
      </div>
      <div class="flash-row">
        <div
          v-for="item in flashItems"
          :key="item.id"
          class="flash-item"
          @click="navigateTo(`/goods/${item.id}`)"
        >
          <van-image class="flash-img" :src="item.goodsFrontImage" fit="cover">
            <template #error><div class="img-ph sm">图</div></template>
          </van-image>
          <div class="fp">¥{{ priceParts(item.shopPrice).int }}</div>
          <div v-if="item.marketPrice > item.shopPrice" class="fo">¥{{ item.marketPrice }}</div>
        </div>
      </div>
    </div>

    <div class="sec"><b>为你推荐</b><span class="tip">猜你喜欢</span></div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-empty v-if="!loading && products.length === 0" description="暂无商品">
        <template #image><div class="empty-ill">🛒</div></template>
      </van-empty>
      <div v-else class="product-grid">
        <div
          v-for="item in products"
          :key="item.id"
          class="pcard"
          @click="navigateTo(`/goods/${item.id}`)"
        >
          <van-image class="pcard-img" :src="item.goodsFrontImage" fit="cover" lazy-load>
            <template #loading><van-loading type="spinner" size="20" /></template>
            <template #error><div class="img-ph">暂无图片</div></template>
          </van-image>
          <div class="pcard-body">
            <div class="pcard-title">{{ item.name }}</div>
            <div v-if="item.isHot || item.isNew || item.shipFree" class="pcard-tags">
              <span v-if="item.isHot" class="ptag ptag-hot">热销</span>
              <span v-if="item.isNew" class="ptag ptag-new">新品</span>
              <span v-if="item.shipFree" class="ptag ptag-ship">包邮</span>
            </div>
            <div class="pcard-foot">
              <div class="pcard-price">
                <span class="pp-cur">¥</span><span class="pp-int">{{ priceParts(item.shopPrice).int }}</span><span class="pp-dec">.{{ priceParts(item.shopPrice).dec }}</span>
              </div>
              <span v-if="item.marketPrice > item.shopPrice" class="pcard-market">¥{{ item.marketPrice }}</span>
              <div class="pcard-add" @click.stop="navigateTo(`/goods/${item.id}`)">
                <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <van-loading v-if="loading" class="loading-more">加载中...</van-loading>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { tenantId } = useTenant()
const refreshing = ref(false)
const loading = ref(false)

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
onMounted(() => { tick(); timer = setInterval(tick, 1000) })
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
const { getIconSvg } = useCategoryIcon()
const allCategories = ref<Category[]>([])
const topCategories = computed(() =>
  allCategories.value
    .filter(c => !c.parentId || c.parentId === 0)
    .slice(0, 10)
    .map(c => ({ ...c, icon: getIconSvg(c.name) })),
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
// 限时秒杀：取前 6 个热卖商品（真实数据；未来接专门的秒杀活动 API）
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

await fetchBanners()
await fetchCategories()
await fetchProducts()

async function onRefresh() {
  await Promise.all([fetchBanners(), fetchProducts()])
  refreshing.value = false
}
</script>

<style scoped>
.home-page {
  background-color: var(--color-bg-page);
  transition: var(--theme-transition);
  padding-bottom: 8px;
}

/* 搜索栏 */
.search-wrap {
  position: sticky;
  top: 0;
  z-index: 20;
  background: linear-gradient(180deg, var(--color-primary), var(--color-primary-light));
  padding: 10px 14px;
}
.search-box {
  height: 36px;
  background: #fff;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  color: var(--color-text-tertiary);
  font-size: 13px;
}
.s-ic { width: 16px; height: 16px; fill: var(--color-text-tertiary); }

.home-swiper { margin: 12px; border-radius: 16px; overflow: hidden; }
.banner-img { width: 100%; aspect-ratio: 2.6 / 1; display: block; }

/* 分类快捷 5 列 */
.quicknav {
  background: var(--color-bg-card);
  margin: 0 12px;
  border-radius: 16px;
  padding: 14px 4px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px 0;
  transition: var(--theme-transition);
}
.qn { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.qn-ic {
  width: 44px; height: 44px; border-radius: 14px;
  object-fit: contain; display: block;
}
.qn span { font-size: 11px; color: var(--color-text-secondary); }

/* 限时秒杀 */
.flash {
  margin: 12px;
  background: linear-gradient(120deg, #fff5f0, #ffe8dd);
  border-radius: 16px;
  padding: 12px;
}
html.dark .flash { background: linear-gradient(120deg, #2a1a10, #3a2317); }
.flash-hd { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.flash-hd b { color: var(--color-primary); font-size: 16px; font-weight: 900; }
.flash-hd .timer { display: flex; gap: 2px; align-items: center; font-size: 11px; color: var(--color-text-secondary); }
.flash-hd .timer i { background: #1a1a1a; color: #fff; border-radius: 4px; padding: 2px 4px; font-style: normal; font-weight: 700; }
.flash-hd .more { margin-left: auto; font-size: 11px; color: var(--color-text-tertiary); }
.flash-row { display: flex; gap: 10px; overflow-x: auto; }
.flash-row::-webkit-scrollbar { display: none; }
.flash-item { flex: 0 0 76px; }
.flash-img { width: 76px; height: 76px; border-radius: 10px; overflow: hidden; display: block; }
.fp { color: var(--color-price); font-weight: 800; font-size: 13px; margin-top: 4px; }
.fo { color: var(--color-text-tertiary); font-size: 10px; text-decoration: line-through; }

/* 区块标题 */
.sec { padding: 8px 14px; display: flex; align-items: baseline; }
.sec b { font-size: 17px; font-weight: 800; color: var(--color-text-primary); }
.sec .tip { font-size: 11px; color: var(--color-text-tertiary); margin-left: 8px; }

/* 双列瀑布流 */
.product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 0 12px 12px; }
.pcard {
  background: var(--color-bg-card);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease;
}
.pcard:active { transform: scale(0.98); }
.pcard-img { width: 100%; aspect-ratio: 1 / 1; display: block; background: var(--color-bg-page); }
.img-ph {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: var(--color-text-tertiary); background: var(--color-bg-page);
}
.img-ph.sm { font-size: 11px; }
.pcard-body { padding: 8px 10px 10px; }
.pcard-title {
  font-size: 13px; line-height: 1.4; color: var(--color-text-primary);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; min-height: 36px;
}
.pcard-tags { display: flex; gap: 4px; margin: 6px 0 4px; }
.ptag { font-size: 10px; line-height: 1; padding: 3px 5px; border-radius: 4px; font-weight: 600; }
.ptag-hot { color: #fff; background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary)); }
.ptag-new { color: var(--color-primary); background: var(--color-primary-soft); }
.ptag-ship { color: var(--color-primary); background: var(--color-primary-soft); }
.pcard-foot { display: flex; align-items: baseline; gap: 6px; margin-top: 4px; }
.pcard-price { color: var(--color-price); font-weight: 800; }
.pp-cur { font-size: 12px; }
.pp-int { font-size: 20px; }
.pp-dec { font-size: 12px; }
.pcard-market { font-size: 11px; color: var(--color-text-tertiary); text-decoration: line-through; }
.pcard-add {
  margin-left: auto; width: 26px; height: 26px; border-radius: 50%;
  background: var(--color-primary); display: flex; align-items: center; justify-content: center;
  align-self: flex-end;
}
.pcard-add svg { width: 15px; height: 15px; fill: #fff; }

.empty-ill { font-size: 56px; }
.loading-more { text-align: center; padding: 16px; }
</style>
