<template>
  <div class="category-page">
    <header class="category-mobile-header">
      <h1>{{ $t('category.title') }}</h1>
      <NuxtLink to="/search" :aria-label="$t('search.search')"><PhMagnifyingGlass :size="21" /></NuxtLink>
    </header>

    <div class="category-shell">
      <div class="category-intro">
        <span>SHOP BY CATEGORY</span>
        <h1>{{ $t('category.title') }}</h1>
        <p>{{ $t('home.heroSubtitle') }}</p>
      </div>

      <nav class="mobile-parent-list" :aria-label="$t('category.title')">
        <button
          v-for="(cat, index) in parentCategories"
          :key="cat.id"
          type="button"
          :class="{ active: index === activeIndex }"
          @click="selectParent(index)"
        >{{ cat.name }}</button>
      </nav>

      <div class="category-layout">
        <aside class="category-rail">
          <h2>{{ $t('category.title') }}</h2>
          <div v-if="loadingCats" class="rail-loading" aria-busy="true">
            <span v-for="n in 7" :key="n" />
          </div>
          <nav v-else :aria-label="$t('category.title')">
            <button
              v-for="(cat, index) in parentCategories"
              :key="cat.id"
              type="button"
              :class="{ active: index === activeIndex }"
              @click="selectParent(index)"
            >
              <span>{{ cat.name }}</span>
              <PhCaretRight :size="16" />
            </button>
          </nav>
        </aside>

        <main class="category-content">
          <section v-if="currentSubCategories.length" class="subcategory-block">
            <div class="subcategory-heading">
              <div>
                <span>{{ $t('category.subCount', { n: currentSubCategories.length }) }}</span>
                <h2>{{ activeParentName }}</h2>
              </div>
            </div>
            <nav class="subcategory-list" :aria-label="activeParentName">
              <button
                v-for="sub in currentSubCategories"
                :key="sub.id"
                type="button"
                :class="{ active: selectedSubId === sub.id }"
                @click="selectSub(sub)"
              >
                <component :is="getSubIcon(sub).comp" :size="21" weight="regular" />
                <span>{{ sub.name }}</span>
              </button>
            </nav>
          </section>

          <section class="results-block">
            <div class="results-heading">
              <div>
                <span>{{ !loadingProducts ? $t('search.count', { n: categoryProducts.length }) : $t('common.loading') }}</span>
                <h2>{{ selectedSubName || activeParentName || $t('category.goods') }}</h2>
              </div>
              <label class="sort-control">
                <span class="sr-only">{{ $t('category.recommended') }}</span>
                <select v-model="sortMode">
                  <option value="recommended">{{ $t('category.recommended') }}</option>
                  <option value="priceAsc">{{ $t('category.priceLow') }}</option>
                  <option value="priceDesc">{{ $t('category.priceHigh') }}</option>
                </select>
                <PhCaretDown :size="16" aria-hidden="true" />
              </label>
            </div>

            <div v-if="loadingProducts" class="product-grid" aria-busy="true">
              <div v-for="n in 6" :key="n" class="product-skeleton" />
            </div>

            <div v-else-if="loadError" class="state-panel" role="alert">
              <PhCloudSlash :size="34" />
              <p>{{ $t('common.loadFailed') }}</p>
              <button type="button" @click="retryProducts">{{ $t('common.retry') }}</button>
            </div>

            <div v-else-if="!sortedProducts.length" class="state-panel">
              <PhPackage :size="34" />
              <p>{{ $t('category.empty') }}</p>
            </div>

            <div v-else class="product-grid">
              <article v-for="item in sortedProducts" :key="item.id" class="product-card">
                <NuxtLink :to="`/goods/${item.id}`" class="product-link">
                  <div class="product-media">
                    <van-image class="fill" :src="item.goodsFrontImage" fit="cover" :alt="item.name" lazy-load>
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
                    @click="quickAdd(item, $event)"
                  >
                    <PhArrowRight v-if="item.hasSku" :size="18" />
                    <PhPlus v-else :size="18" weight="bold" />
                  </button>
                </div>
              </article>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PhArrowRight,
  PhCaretDown,
  PhCaretRight,
  PhCloudSlash,
  PhMagnifyingGlass,
  PhPackage,
  PhPlus,
} from '@phosphor-icons/vue'
import { showToast } from 'vant'

const { t } = useI18n()
const config = useRuntimeConfig()
const { tenantId } = useTenant()
const route = useRoute()
const { getIconDef } = useCategoryIcon()

interface Category { id: number; name: string; parentId: number; level: number }
type SortMode = 'recommended' | 'priceAsc' | 'priceDesc'

const activeIndex = ref(0)
const allCategories = ref<Category[]>([])
const categoryProducts = ref<any[]>([])
const loadingCats = ref(true)
const loadingProducts = ref(true)
const loadError = ref(false)
const selectedSubId = ref<number | null>(null)
const sortMode = ref<SortMode>('recommended')

const parentCategories = computed(() => allCategories.value.filter(cat => !cat.parentId || cat.parentId === 0))
const activeParentName = computed(() => parentCategories.value[activeIndex.value]?.name || '')
const currentSubCategories = computed(() => {
  const parent = parentCategories.value[activeIndex.value]
  return parent ? allCategories.value.filter(cat => cat.parentId === parent.id) : []
})
const selectedSubName = computed(() => currentSubCategories.value.find(sub => sub.id === selectedSubId.value)?.name || '')
const sortedProducts = computed(() => {
  const list = [...categoryProducts.value]
  if (sortMode.value === 'priceAsc') return list.sort((a, b) => dispPrice(a) - dispPrice(b))
  if (sortMode.value === 'priceDesc') return list.sort((a, b) => dispPrice(b) - dispPrice(a))
  return list
})

function getSubIcon(sub: Category) {
  return { comp: getIconDef(sub.name, activeParentName.value).comp }
}
function monogram(name: string) { return (name || '').trim()[0] || 'Z' }
function dispPrice(item: any): number { return item?.hasSku && item?.minSkuPrice ? item.minSkuPrice : (item?.shopPrice || 0) }
function priceParts(value: number) {
  const [int = '0', dec = '00'] = Number(value || 0).toFixed(2).split('.')
  return { int, dec }
}
function discountPercent(item: any): number {
  if (item?.hasSku || !item?.marketPrice || item.marketPrice <= item.shopPrice) return 0
  return Math.round((1 - item.shopPrice / item.marketPrice) * 100)
}

async function fetchCategories() {
  loadingCats.value = true
  try {
    const res = await $fetch<{ code: number; data: any }>(`${config.public.apiBase}/v1/categories`)
    if (res.code === 200) {
      allCategories.value = Array.isArray(res.data) ? res.data : (res.data?.data || [])
    }
  } finally {
    loadingCats.value = false
  }
}

async function fetchProducts(categoryId: number) {
  loadingProducts.value = true
  loadError.value = false
  try {
    const res = await $fetch<{ code: number; data: { data: any[]; total: number } }>(
      `${config.public.apiBase}/v1/goods`,
      { params: { page: 1, pageSize: 24, categoryId, tenant_id: tenantId } },
    )
    if (res.code === 200 && res.data?.data) categoryProducts.value = res.data.data
    else loadError.value = true
  } catch {
    loadError.value = true
  } finally {
    loadingProducts.value = false
  }
}

function selectSub(sub: Category) {
  selectedSubId.value = sub.id
  sortMode.value = 'recommended'
  void fetchProducts(sub.id)
}

function selectParent(index: number) {
  activeIndex.value = index
  selectedSubId.value = null
  sortMode.value = 'recommended'
  const firstSub = currentSubCategories.value[0]
  if (firstSub) selectSub(firstSub)
  else {
    const parent = parentCategories.value[index]
    if (parent) void fetchProducts(parent.id)
  }
}

function retryProducts() {
  const id = selectedSubId.value || parentCategories.value[activeIndex.value]?.id
  if (id) void fetchProducts(id)
}

const { apiFetch } = useApi()
const { isLoggedIn } = useAuth()
const { refresh: refreshCart, flyToCart } = useCartCount()
async function quickAdd(item: any, e?: MouseEvent) {
  if (item.hasSku) {
    navigateTo(`/goods/${item.id}`)
    return
  }
  if (!isLoggedIn.value) {
    showToast(t('common.loginRequired'))
    navigateTo('/login?redirect=/category')
    return
  }
  const btn = (e?.currentTarget as HTMLElement)?.getBoundingClientRect()
  try {
    await apiFetch('/v1/cart', { method: 'POST', body: { goodsId: Number(item.id), nums: 1, checked: true } })
    await refreshCart()
    if (btn) flyToCart(btn.left + btn.width / 2, btn.top + btn.height / 2, item.goodsFrontImage)
    showToast(t('common.addedToCart'))
  } catch (error: any) {
    showToast(error?.data?.msg || error?.message || t('common.addToCartFailed'))
  }
}

onMounted(async () => {
  try {
    await fetchCategories()
    const queryId = Number(route.query.id)
    let startIndex = 0
    let initialSub: Category | undefined
    if (queryId) {
      const directParentIndex = parentCategories.value.findIndex(cat => cat.id === queryId)
      if (directParentIndex >= 0) startIndex = directParentIndex
      else {
        initialSub = allCategories.value.find(cat => cat.id === queryId && !!cat.parentId)
        if (initialSub) {
          const parentIndex = parentCategories.value.findIndex(cat => cat.id === initialSub?.parentId)
          if (parentIndex >= 0) startIndex = parentIndex
        }
      }
    }
    activeIndex.value = startIndex
    if (initialSub) selectSub(initialSub)
    else if (parentCategories.value.length) selectParent(startIndex)
    else loadingProducts.value = false
  } catch {
    loadingProducts.value = false
    loadError.value = true
  }
})
</script>

<style scoped>
.category-page { min-height: 100vh; background: var(--color-bg-page); }
.category-mobile-header {
  position: sticky;
  top: 0;
  z-index: 30;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in oklch, var(--color-bg-card) 94%, transparent);
  backdrop-filter: blur(16px);
}
.category-mobile-header h1 { margin: 0; font-family: var(--font-display); font-size: 20px; letter-spacing: -0.025em; }
.category-mobile-header a { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; }
.category-shell { width: min(100%, var(--page-max)); margin-inline: auto; padding: var(--space-md) var(--space-sm) var(--space-2xl); }
.category-intro { display: none; }

.mobile-parent-list {
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  margin-inline: calc(var(--space-sm) * -1);
  padding: 0 var(--space-sm) var(--space-sm);
  scrollbar-width: none;
}
.mobile-parent-list::-webkit-scrollbar { display: none; }
.mobile-parent-list button {
  min-height: 44px;
  flex: 0 0 auto;
  padding-inline: 15px;
  border: 1px solid var(--color-border);
  border-radius: 22px;
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}
.mobile-parent-list button.active { border-color: var(--color-accent-ink); background: var(--color-accent-ink); color: var(--color-text-inverse); }
.category-rail { display: none; }
.category-content { min-width: 0; }
.subcategory-block { margin-bottom: var(--space-xl); }
.subcategory-heading span,
.results-heading > div > span { color: var(--color-text-secondary); font-size: 12px; }
.subcategory-heading h2,
.results-heading h2 { margin: 3px 0 0; font-family: var(--font-display); font-size: 24px; line-height: 1.15; letter-spacing: -0.035em; }
.subcategory-list {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 108px;
  gap: var(--space-xs);
  overflow-x: auto;
  margin-top: var(--space-md);
  padding-bottom: var(--space-xs);
  scrollbar-width: none;
}
.subcategory-list::-webkit-scrollbar { display: none; }
.subcategory-list button {
  min-height: 76px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 13px;
}
.subcategory-list button.active { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary-dark); }
.subcategory-list button span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.results-heading { display: flex; align-items: end; justify-content: space-between; gap: var(--space-md); margin-bottom: var(--space-md); }
.sort-control {
  position: relative;
  min-width: 0;
  display: flex;
  align-items: center;
}
.sort-control select {
  min-width: 0;
  height: 44px;
  max-width: 160px;
  appearance: none;
  padding: 0 36px 0 13px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: 13px;
  cursor: pointer;
}
.sort-control svg { position: absolute; right: 12px; pointer-events: none; color: var(--color-text-secondary); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }

.product-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-sm); }
.product-card { min-width: 0; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-card); transition: transform 180ms cubic-bezier(.2, .8, .2, 1), border-color 180ms ease, box-shadow 180ms ease; }
.product-link { min-width: 0; display: block; }
.product-media { position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; background: var(--color-search-bg); }
.fill { width: 100%; height: 100%; display: block; }
.fill :deep(img) { transition: transform 260ms cubic-bezier(.2, .8, .2, 1); }
.product-placeholder { width: 100%; height: 100%; display: grid; place-items: center; background: var(--color-search-bg); color: var(--color-primary-dark); font-family: var(--font-display); font-size: 34px; font-weight: 700; }
.product-placeholder.muted { opacity: .45; }
.discount { position: absolute; top: 9px; left: 9px; padding: 4px 7px; border-radius: 6px; background: var(--color-bg-card); color: var(--color-price); font-size: 11px; font-weight: 760; }
.product-copy { padding: var(--space-sm) var(--space-sm) 0; }
.product-copy h3 { min-height: 42px; margin: 7px 0 0; color: var(--color-text-primary); font-size: 14px; font-weight: 560; line-height: 1.48; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
.product-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.product-tags span { color: var(--color-primary-dark); font-size: 11px; font-weight: 660; }
.product-tags span + span::before { content: '·'; margin-right: 5px; color: var(--color-border-strong); }
.product-footer { margin-top: auto; display: flex; align-items: end; justify-content: space-between; gap: var(--space-xs); padding: var(--space-sm); }
.price-block { min-width: 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: 3px 6px; }
.price { color: var(--color-price); font-family: var(--font-display); font-size: 20px; font-weight: 740; font-variant-numeric: tabular-nums; letter-spacing: -0.03em; }
.price small,
.price sup { font-size: 11px; font-weight: 650; }
.price-from,
.price-block del { color: var(--color-text-tertiary); font-size: 11px; }
.quick-add { width: 44px; height: 44px; flex: 0 0 44px; display: grid; place-items: center; padding: 0; border: 1px solid var(--color-border-strong); border-radius: 50%; background: var(--color-bg-card); color: var(--color-primary-dark); cursor: pointer; transition: background 160ms ease, color 160ms ease, transform 160ms ease; }
.quick-add:hover { background: var(--color-accent-ink); color: var(--color-text-inverse); }
.quick-add:active { transform: scale(.96); }
.product-skeleton { aspect-ratio: .72; border-radius: var(--radius-md); background: var(--color-search-bg); }
.state-panel { min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-sm); padding: var(--space-xl); border: 1px solid var(--color-border); border-radius: var(--radius-lg); color: var(--color-text-secondary); text-align: center; }
.state-panel p { margin: 0; }
.state-panel button { min-height: 44px; padding-inline: 18px; border: 0; border-radius: var(--radius-md); background: var(--color-accent-ink); color: var(--color-text-inverse); cursor: pointer; font-weight: 680; }

@media (hover: hover) {
  .product-card:hover { transform: translateY(-3px); border-color: var(--color-border-strong); box-shadow: var(--shadow-soft); }
  .product-card:hover .fill :deep(img) { transform: scale(1.025); }
}

@media (min-width: 600px) {
  .category-shell { padding-inline: var(--space-lg); }
  .product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-md); }
}

@media (min-width: 768px) {
  .category-mobile-header,
  .mobile-parent-list { display: none; }
  .category-shell { padding-top: var(--space-xl); padding-bottom: var(--space-3xl); }
  .category-intro { display: block; margin-bottom: var(--space-xl); }
  .category-intro > span { color: var(--color-primary-dark); font-family: var(--font-display); font-size: 11px; font-weight: 720; letter-spacing: .12em; }
  .category-intro h1 { margin: 7px 0 0; font-family: var(--font-display); font-size: 42px; line-height: 1; letter-spacing: -0.045em; }
  .category-intro p { margin: 10px 0 0; color: var(--color-text-secondary); }
  .category-layout { display: grid; grid-template-columns: 210px minmax(0, 1fr); gap: var(--space-xl); align-items: start; }
  .category-rail { position: sticky; top: 96px; display: block; padding: var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-card); }
  .category-rail h2 { margin: 0 0 var(--space-sm); padding: 0 var(--space-sm); font-family: var(--font-display); font-size: 17px; }
  .category-rail nav { display: flex; flex-direction: column; gap: 2px; }
  .category-rail button { min-height: 44px; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: var(--space-xs); padding-inline: var(--space-sm); border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-text-secondary); cursor: pointer; text-align: left; font-size: 14px; }
  .category-rail button:hover { background: var(--color-search-bg); color: var(--color-text-primary); }
  .category-rail button.active { background: var(--color-primary-soft); color: var(--color-primary-dark); font-weight: 680; }
  .rail-loading { display: flex; flex-direction: column; gap: var(--space-sm); }
  .rail-loading span { height: 18px; border-radius: 5px; background: var(--color-search-bg); }
  .subcategory-list { grid-auto-columns: 124px; }
  .subcategory-list button { min-height: 82px; }
  .subcategory-heading h2,
  .results-heading h2 { font-size: 28px; }
}

@media (min-width: 1120px) {
  .category-layout { grid-template-columns: 230px minmax(0, 1fr); gap: var(--space-2xl); }
  .product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-lg) var(--space-md); }
  .product-card { border-radius: var(--radius-lg); }
}
</style>
