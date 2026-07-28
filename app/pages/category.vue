<template>
  <div class="cat-page">
    <!-- 氛围金色光晕 -->
    <div class="ambient" aria-hidden="true" />

    <!-- 顶部玻璃头 -->
    <header class="topbar">
      <span class="tt">{{ $t('category.title') }}</span>
      <div class="search" @click="navigateTo('/search')">
        <svg viewBox="0 0 24 24" class="s-ic"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>
        <span>{{ $t('home.searchPlaceholder') }}</span>
      </div>
    </header>

    <div class="body">
      <!-- 左侧金色分类栏 -->
      <nav class="rail">
        <div v-if="!parentCategories.length && loadingCats" class="rail-skel">
          <div v-for="n in 8" :key="n" class="rail-skel-item" />
        </div>
        <button
          v-for="(cat, i) in parentCategories"
          :key="cat.id"
          class="rail-item"
          :class="{ on: i === activeIndex }"
          @click="selectParent(i)"
        >
          <span class="rail-bar" />
          <span class="rail-tx">{{ cat.name }}</span>
        </button>
      </nav>

      <!-- 右侧内容 -->
      <div ref="contentEl" class="content">
        <!-- 子分类金格 -->
        <section v-if="currentSubCategories.length" class="subs">
          <div class="sec-hd">
            <h3>{{ activeParentName }}</h3>
            <span class="count">{{ $t('category.subCount', { n: currentSubCategories.length }) }}</span>
          </div>
          <div class="sub-grid">
            <button
              v-for="sub in currentSubCategories"
              :key="sub.id"
              class="sub"
              :class="{ on: selectedSubId === sub.id }"
              @click="selectSub(sub)"
            >
              <span class="sub-ic">
                <component :is="getSubIcon(sub).comp" :size="22" weight="duotone" />
              </span>
              <span>{{ sub.name }}</span>
            </button>
          </div>
        </section>

        <!-- 商品列表 -->
        <section class="feed">
          <div class="sec-hd">
            <h3>{{ selectedSubName || activeParentName || $t('category.goods') }}</h3>
            <span v-if="!loadingProducts && categoryProducts.length" class="count">{{ $t('search.count', { n: categoryProducts.length }) }}</span>
          </div>

          <!-- 骨架 -->
          <div v-if="loadingProducts" class="list">
            <div v-for="n in 5" :key="n" class="skel" />
          </div>

          <!-- 空态 -->
          <div v-else-if="!categoryProducts.length" class="empty">
            <div class="empty-mark">Z</div>
            <p>{{ $t('category.empty') }}</p>
          </div>

          <!-- 商品卡 -->
          <div v-else class="list">
            <button
              v-for="(item, i) in categoryProducts"
              :key="item.id"
              class="pcard"
              :style="{ animationDelay: `${Math.min(i, 10) * 40}ms` }"
              @click="navigateTo(`/goods/${item.id}`)"
            >
              <div class="p-thumb">
                <van-image class="fill" :src="item.goodsFrontImage" fit="cover">
                  <template #loading><div class="mono dim">{{ monogram(item.name) }}</div></template>
                  <template #error><div class="mono">{{ monogram(item.name) }}</div></template>
                </van-image>
                <div v-if="!item.hasSku && item.marketPrice > item.shopPrice" class="p-off">
                  {{ Math.round((1 - item.shopPrice / item.marketPrice) * 100) }}% off
                </div>
              </div>
              <div class="p-body">
                <div class="p-title">{{ item.name }}</div>
                <div v-if="item.isHot || item.isNew || item.shipFree" class="p-tags">
                  <span v-if="item.isHot" class="tag hot">{{ $t('home.tagHot') }}</span>
                  <span v-if="item.isNew" class="tag">{{ $t('home.tagNew') }}</span>
                  <span v-if="item.shipFree" class="tag">{{ $t('home.tagFreeShip') }}</span>
                </div>
                <div class="p-foot">
                  <div class="price">
                    <span class="cur">¥</span><span class="int">{{ priceParts(dispPrice(item)).int }}</span><span class="dec">.{{ priceParts(dispPrice(item)).dec }}</span><span v-if="item.hasSku" class="from">起</span>
                  </div>
                  <span v-if="!item.hasSku && item.marketPrice > item.shopPrice" class="market">¥{{ item.marketPrice }}</span>
                  <span class="add" @click.stop="quickAdd($event, item)">
                    <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>
                  </span>
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'

const { t } = useI18n()
const config = useRuntimeConfig()
const { tenantId } = useTenant()
const route = useRoute()
const { getIconDef } = useCategoryIcon()

interface Category { id: number; name: string; parentId: number; level: number }

const activeIndex = ref(0)
const allCategories = ref<Category[]>([])
const categoryProducts = ref<any[]>([])
const loadingCats = ref(true)
const loadingProducts = ref(true)
const selectedSubId = ref<number | null>(null)
const contentEl = ref<HTMLElement | null>(null)

// 图片兜底：商品名首字作金字底纹
function monogram(name: string) {
  const s = (name || '').trim()
  return s ? s[0] : 'Z'
}
function dispPrice(item: any): number {
  return item?.hasSku && item?.minSkuPrice ? item.minSkuPrice : (item?.shopPrice || 0)
}
function priceParts(n: number) {
  const [int = '0', dec = '00'] = Number(n || 0).toFixed(2).split('.')
  return { int, dec }
}

// 一级类目
const parentCategories = computed(() =>
  allCategories.value.filter(c => !c.parentId || c.parentId === 0),
)
const activeParentName = computed(() => parentCategories.value[activeIndex.value]?.name || '')

// 当前一级下的子类目
const currentSubCategories = computed(() => {
  const parent = parentCategories.value[activeIndex.value]
  if (!parent) return []
  return allCategories.value.filter(c => c.parentId === parent.id)
})
const selectedSubName = computed(() =>
  currentSubCategories.value.find(s => s.id === selectedSubId.value)?.name || '',
)

/**
 * 子分类只取图标，不取颜色。
 * 同一父分类下的子项会共用父级色板 —— 5 个一模一样的色块，颜色不承载任何信息，
 * 只是噪音。这里唯一需要表达的是「选中与否」，交给 CSS 用中性/主色两态处理。
 */
function getSubIcon(sub: Category) {
  return { comp: getIconDef(sub.name, activeParentName.value).comp }
}

async function fetchCategories() {
  loadingCats.value = true
  try {
    const res = await $fetch<{ code: number; data: any }>(`${config.public.apiBase}/v1/categories`)
    if (res.code === 200) {
      const payload = res.data
      allCategories.value = Array.isArray(payload) ? payload : (payload?.data || [])
    }
  } catch (e) { console.warn('categories:', e) } finally { loadingCats.value = false }
}

async function fetchProducts(categoryId: number) {
  loadingProducts.value = true
  categoryProducts.value = []
  try {
    const res = await $fetch<{ code: number; data: { data: any[]; total: number } }>(
      `${config.public.apiBase}/v1/goods`,
      { params: { page: 1, pageSize: 20, categoryId, tenant_id: tenantId } },
    )
    if (res.code === 200 && res.data?.data) categoryProducts.value = res.data.data
  } catch (e) { console.warn('products:', e) } finally { loadingProducts.value = false }
}

function selectSub(sub: Category) {
  selectedSubId.value = sub.id
  fetchProducts(sub.id)
}
// 选一级：优先展开首个子类（后端商品挂在叶子类目，父类目直查为空），无子类才直查父类目
function selectParent(index: number) {
  activeIndex.value = index
  selectedSubId.value = null
  contentEl.value?.scrollTo({ top: 0 })
  const subs = currentSubCategories.value
  if (subs.length) { selectSub(subs[0]); return }
  const parent = parentCategories.value[index]
  if (parent) fetchProducts(parent.id)
  else loadingProducts.value = false
}

// 快速加购 + 飞入 tabbar 购物车（与首页一致）
const { apiFetch } = useApi()
const { isLoggedIn } = useAuth()
const { refresh: refreshCart } = useCartCount()
async function quickAdd(e: MouseEvent, item: any) {
  if (!isLoggedIn.value) {
    showToast(t('common.loginRequired'))
    navigateTo('/login?redirect=/category')
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

// 客户端拉数据（走 Vite dev 代理到本地网关；避免 SSR 相对路径拿不到）
onMounted(async () => {
  await fetchCategories()
  const queryId = Number(route.query.id)
  let startIdx = 0
  if (queryId && parentCategories.value.length) {
    const idx = parentCategories.value.findIndex(c => c.id === queryId)
    if (idx >= 0) startIdx = idx
  }
  if (parentCategories.value.length) selectParent(startIdx)
  else loadingProducts.value = false
})
</script>

<style scoped>
.cat-page {
  position: relative;
  min-height: 100vh;
  background: var(--color-bg-page);
}

/* 氛围金色光晕 */
.ambient {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(80% 30% at 50% -4%, color-mix(in srgb, var(--color-primary) 22%, transparent), transparent 60%),
    radial-gradient(60% 24% at 100% 8%, color-mix(in srgb, var(--color-primary-light) 16%, transparent), transparent 66%);
}
.cat-page > :not(.ambient) { position: relative; z-index: 1; }

/* ---------- 顶部玻璃头 ---------- */
.topbar {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px 11px;
  background: color-mix(in srgb, var(--color-bg-page) 72%, transparent);
  backdrop-filter: saturate(150%) blur(16px);
  -webkit-backdrop-filter: saturate(150%) blur(16px);
}
.topbar .tt {
  flex-shrink: 0; font-size: 17px; font-weight: 800; letter-spacing: .5px;
  background: linear-gradient(120deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.search {
  flex: 1; height: 36px; display: flex; align-items: center; gap: 8px;
  padding: 0 14px; border-radius: 20px;
  color: var(--color-text-tertiary); font-size: 13px;
  background: var(--color-bg-card); border: 1px solid var(--color-border);
  box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 40%, transparent);
}
.s-ic { width: 16px; height: 16px; fill: var(--color-primary); flex-shrink: 0; }

/* ---------- 两栏 ---------- */
.body {
  display: flex;
  height: calc(100vh - 111px);
  height: calc(100dvh - 111px);
}

/* 左侧金色分类栏 */
.rail {
  flex-shrink: 0; width: 96px; overflow-y: auto;
  padding: 8px 0 60px; background: var(--color-bg-sidebar);
  border-right: 1px solid var(--color-border);
}
.rail::-webkit-scrollbar { display: none; }
.rail-item {
  position: relative; width: 100%; border: 0; background: none; cursor: pointer;
  padding: 14px 8px; display: flex; align-items: center; justify-content: center;
  transition: background .16s ease;
}
.rail-bar {
  position: absolute; left: 0; top: 50%; transform: translateY(-50%) scaleY(0);
  width: 3px; height: 22px; border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, var(--color-primary-light), var(--color-primary));
  transition: transform .2s cubic-bezier(.34,1.56,.64,1);
}
.rail-tx {
  font-size: 13px; color: var(--color-text-secondary); line-height: 1.3;
  transition: color .16s ease, font-weight .16s ease;
}
.rail-item.on {
  background: linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 12%, transparent), var(--color-bg-card));
}
.rail-item.on .rail-bar { transform: translateY(-50%) scaleY(1); }
.rail-item.on .rail-tx {
  font-weight: 800;
  background: linear-gradient(120deg, var(--color-primary-light), var(--color-primary));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.rail-item:active { background: var(--color-bg-card); }

/* 右侧内容 */
.content {
  flex: 1; overflow-y: auto; padding: 4px 12px 70px;
}
.content::-webkit-scrollbar { display: none; }

/* 区块头 */
.sec-hd { display: flex; align-items: center; gap: 8px; padding: 12px 2px 10px; }
.sec-hd h3 {
  margin: 0; font-size: 15px; font-weight: 900; color: var(--color-text-primary);
  position: relative; padding-left: 11px;
}
.sec-hd h3::before {
  content: ''; position: absolute; left: 0; top: 2px; bottom: 2px; width: 4px; border-radius: 2px;
  background: linear-gradient(180deg, var(--color-primary-light), var(--color-primary));
}
.sec-hd .count { margin-left: auto; font-size: 11.5px; color: var(--color-text-tertiary); }

/* 子分类金格 */
.sub-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 4px; }
.sub {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: none; border: 0; padding: 6px 0; cursor: pointer;
}
/* 子分类图标：中性底块，图标继承 color（Phosphor 未传 :color 时用 currentColor）。
   选中态直接把底块和图标一起换成主色，不再用悬空的 outline 圆环 ——
   圆环是「在方块外面再套一层」，和方块本身是两套语言，拼在一起会显得生硬。 */
.sub-ic {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--color-text-primary) 8%, transparent);
  color: var(--color-text-secondary);
  transition: transform .16s ease, background .2s ease, color .2s ease;
}
.sub:active .sub-ic { transform: scale(.9); }
.sub.on .sub-ic {
  background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  color: var(--color-primary);
}
.sub span {
  font-size: 11.5px; color: var(--color-text-secondary); max-width: 64px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.sub.on span { color: var(--color-primary); font-weight: 700; }

/* 商品卡（横向） */
.list { display: flex; flex-direction: column; gap: 10px; }
.pcard {
  display: flex; gap: 10px; text-align: left; cursor: pointer; padding: 8px;
  background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
  animation: rise .42s cubic-bezier(.22,.61,.36,1) both;
  transition: transform .16s ease, box-shadow .16s ease;
}
.pcard:active { transform: translateY(1px) scale(.99); box-shadow: 0 1px 6px rgba(0,0,0,.05); }
@keyframes rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

.p-thumb {
  position: relative; flex-shrink: 0; width: 92px; height: 92px; border-radius: 12px; overflow: hidden;
  background: var(--color-search-bg);
}
.p-off {
  position: absolute; top: 6px; left: 6px; z-index: 2;
  font-size: 9.5px; font-weight: 800; color: #2a1f0a;
  background: linear-gradient(135deg, #e6cd8f, #c9a24c); border-radius: 6px; padding: 2px 5px;
}
.fill { width: 100%; height: 100%; display: block; }
.mono {
  width: 100%; height: 100%; display: grid; place-items: center;
  font-size: 34px; font-weight: 900; font-style: italic;
  color: color-mix(in srgb, var(--color-primary) 55%, transparent);
  background:
    radial-gradient(120% 120% at 30% 20%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 60%),
    var(--color-search-bg);
}
.mono.dim { opacity: .5; }

.p-body { flex: 1; min-width: 0; display: flex; flex-direction: column; padding: 2px 2px 0; }
.p-title {
  font-size: 13px; line-height: 1.4; color: var(--color-text-primary);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.p-tags { display: flex; gap: 5px; margin: 6px 0 0; }
.tag {
  font-size: 10px; line-height: 1; padding: 3px 6px; border-radius: 5px; font-weight: 700;
  color: var(--color-primary-dark); background: var(--color-primary-soft);
  border: 1px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
}
.tag.hot { color: #2a1f0a; border: 0; background: linear-gradient(135deg, #e6cd8f, #c9a24c); }
.p-foot { display: flex; align-items: baseline; gap: 6px; margin-top: auto; padding-top: 6px; }
.price { color: var(--color-price); font-weight: 900; font-variant-numeric: tabular-nums; }
.from { font-size: 11px; font-weight: 600; margin-left: 1px; }
.cur { font-size: 12px; }
.int { font-size: 20px; }
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

/* 骨架 */
.skel {
  height: 108px; border-radius: 16px;
  background: linear-gradient(100deg, var(--color-bg-card) 30%, var(--color-search-bg) 50%, var(--color-bg-card) 70%);
  background-size: 200% 100%; animation: shine 1.3s ease-in-out infinite;
}
@keyframes shine { from { background-position: 200% 0; } to { background-position: -200% 0; } }
.rail-skel { padding: 8px 12px; display: flex; flex-direction: column; gap: 16px; }
.rail-skel-item {
  height: 16px; border-radius: 6px;
  background: linear-gradient(100deg, var(--color-bg-card) 30%, var(--color-search-bg) 50%, var(--color-bg-card) 70%);
  background-size: 200% 100%; animation: shine 1.3s ease-in-out infinite;
}

/* 空态 */
.empty { padding: 60px 24px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.empty p { margin: 0; color: var(--color-text-tertiary); font-size: 13px; }
.empty-mark {
  width: 72px; height: 72px; border-radius: 22px; display: grid; place-items: center;
  font-size: 38px; font-weight: 900; font-style: italic; color: #2a1f0a;
  background: linear-gradient(135deg, #e6cd8f, #c9a24c 52%, #a9822f);
  box-shadow: 0 8px 22px color-mix(in srgb, var(--color-primary) 34%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .pcard, .skel, .rail-skel-item { animation: none; }
  .rail-bar, .sub-ic, .add { transition: none; }
}
</style>
