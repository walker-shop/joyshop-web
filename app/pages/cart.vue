<template>
  <div class="cart-page">
    <header class="cart-heading">
      <button type="button" class="back-button" :aria-label="$t('common.back')" @click="navigateTo('/')">
        <PhArrowLeft :size="21" />
      </button>
      <div>
        <span>YOUR SELECTION</span>
        <h1>{{ $t('cart.title') }}</h1>
      </div>
    </header>

    <div v-if="!isLoggedIn" class="cart-state">
      <span class="state-icon"><PhLockKey :size="34" /></span>
      <h2>{{ $t('cart.guestEmpty') }}</h2>
      <NuxtLink to="/login?redirect=/cart">{{ $t('cart.toLogin') }}</NuxtLink>
    </div>

    <div v-else-if="loading" class="cart-loading" aria-busy="true">
      <div v-for="n in 3" :key="n" class="cart-skeleton" />
    </div>

    <div v-else-if="loadError" class="cart-state" role="alert">
      <span class="state-icon"><PhCloudSlash :size="34" /></span>
      <h2>{{ $t('cart.loadFailed') }}</h2>
      <button type="button" @click="load">{{ $t('common.retry') }}</button>
    </div>

    <div v-else-if="items.length === 0" class="cart-state">
      <span class="state-icon"><PhShoppingBagOpen :size="34" /></span>
      <h2>{{ $t('cart.empty') }}</h2>
      <NuxtLink to="/category">{{ $t('cart.goShopping') }}</NuxtLink>
    </div>

    <div v-else class="cart-layout">
      <section class="cart-items" :aria-label="$t('cart.title')">
        <div class="items-heading">
          <span>{{ $t('search.count', { n: items.length }) }}</span>
          <button type="button" class="select-all" :aria-pressed="allChecked" :disabled="bulkBusy" @click="toggleAll(!allChecked)">
            <span class="check-control" :class="{ checked: allChecked }">
              <PhCheck v-if="allChecked" :size="16" weight="bold" />
            </span>
            {{ $t('cart.selectAll') }}
          </button>
        </div>

        <article v-for="item in items" :key="item.id" class="cart-item" :aria-busy="isBusy(item.id)">
          <button
            type="button"
            class="item-check"
            :aria-label="$t('cart.selectItem')"
            :aria-pressed="item.checked"
            :disabled="isBusy(item.id) || bulkBusy"
            @click="toggle(item, !item.checked)"
          >
            <span class="check-control" :class="{ checked: item.checked }">
              <PhCheck v-if="item.checked" :size="16" weight="bold" />
            </span>
          </button>

          <NuxtLink :to="`/goods/${item.goods_id}`" class="item-image">
            <img v-if="item.goods_image" :src="item.goods_image" :alt="item.goods_name" loading="lazy">
            <span v-else>{{ $t('cart.noImage') }}</span>
          </NuxtLink>

          <div class="item-content">
            <NuxtLink :to="`/goods/${item.goods_id}`" class="item-name">{{ item.goods_name }}</NuxtLink>
            <span class="item-price"><small>¥</small>{{ item.goods_price?.toFixed(2) }}</span>
            <div class="item-controls">
              <div class="quantity" :aria-label="$t('pdp.specValue')">
                <button
                  type="button"
                  :aria-label="$t('cart.decrease')"
                  :disabled="item.nums <= 1 || isBusy(item.id)"
                  @click="changeNums(item, Math.max(1, item.nums - 1))"
                ><PhMinus :size="16" /></button>
                <span>{{ item.nums }}</span>
                <button
                  type="button"
                  :aria-label="$t('cart.increase')"
                  :disabled="isBusy(item.id)"
                  @click="changeNums(item, item.nums + 1)"
                ><PhPlus :size="16" /></button>
              </div>
              <button
                type="button"
                class="delete-button"
                :aria-label="$t('cart.delete')"
                :disabled="isBusy(item.id)"
                @click="remove(item)"
              ><PhTrash :size="19" /></button>
            </div>
          </div>
        </article>
      </section>

      <aside class="cart-summary">
        <span class="summary-eyebrow">ORDER SUMMARY</span>
        <h2>{{ $t('cart.total') }}</h2>
        <div class="summary-row">
          <span>{{ $t('cart.selectAll') }}</span>
          <strong>{{ checkedCount }} / {{ items.length }}</strong>
        </div>
        <div class="summary-total">
          <span>{{ $t('cart.total') }}</span>
          <strong><small>¥</small>{{ (checkedTotalCents / 100).toFixed(2) }}</strong>
        </div>
        <button type="button" class="checkout-button" :disabled="checkedCount === 0 || bulkBusy" @click="goCheckout">
          {{ $t('cart.checkout') }}
          <PhArrowRight :size="19" />
        </button>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PhArrowLeft,
  PhArrowRight,
  PhCheck,
  PhCloudSlash,
  PhLockKey,
  PhMinus,
  PhPlus,
  PhShoppingBagOpen,
  PhTrash,
} from '@phosphor-icons/vue'
import { showToast } from 'vant'

const { t } = useI18n()
interface CartItem {
  id: number
  goods_id: number
  goods_name: string
  goods_image: string
  goods_price: number
  nums: number
  checked: boolean
}

const { apiFetch } = useApi()
const { isLoggedIn } = useAuth()
const { refresh: refreshBadge } = useCartCount()
const items = ref<CartItem[]>([])
const loading = ref(false)
const loadError = ref(false)
const busyIds = ref(new Set<number>())
const bulkBusy = ref(false)

const checkedTotalCents = computed(() =>
  Math.round(items.value.filter(item => item.checked).reduce((sum, item) => sum + item.goods_price * item.nums, 0) * 100),
)
const checkedCount = computed(() => items.value.filter(item => item.checked).length)
const allChecked = computed(() => items.value.length > 0 && items.value.every(item => item.checked))

function isBusy(id: number) { return busyIds.value.has(id) }
function setBusy(id: number, busy: boolean) {
  const next = new Set(busyIds.value)
  if (busy) next.add(id)
  else next.delete(id)
  busyIds.value = next
}

async function load() {
  if (!isLoggedIn.value) return
  loading.value = true
  loadError.value = false
  try {
    const res = await apiFetch<{ total: number; data: CartItem[] | null }>('/v1/cart')
    items.value = (res.data || []).map(item => ({ ...item, checked: !!item.checked, nums: item.nums || 1 }))
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

async function put(item: CartItem) {
  await apiFetch<{ msg: string }>(`/v1/cart/${item.id}`, {
    method: 'PUT',
    body: { nums: item.nums, checked: item.checked },
  })
}

async function toggle(item: CartItem, checked: boolean) {
  const previous = item.checked
  item.checked = checked
  setBusy(item.id, true)
  try {
    await put(item)
  } catch {
    item.checked = previous
    showToast(t('cart.opFailed'))
  } finally {
    setBusy(item.id, false)
  }
}

async function toggleAll(checked: boolean) {
  const previous = items.value.map(item => item.checked)
  bulkBusy.value = true
  items.value.forEach(item => { item.checked = checked })
  try {
    await Promise.all(items.value.map(put))
  } catch {
    items.value.forEach((item, index) => { item.checked = previous[index] ?? false })
    showToast(t('cart.opFailed'))
  } finally {
    bulkBusy.value = false
  }
}

async function changeNums(item: CartItem, nums: number) {
  const previous = item.nums
  item.nums = nums
  setBusy(item.id, true)
  try {
    await put(item)
  } catch {
    item.nums = previous
    showToast(t('cart.numFailed'))
  } finally {
    setBusy(item.id, false)
  }
}

async function remove(item: CartItem) {
  setBusy(item.id, true)
  try {
    await apiFetch<{ msg: string }>(`/v1/cart/${item.id}`, { method: 'DELETE' })
    items.value = items.value.filter(current => current.id !== item.id)
    await refreshBadge()
  } catch {
    showToast(t('cart.deleteFailed'))
    setBusy(item.id, false)
  }
}

function goCheckout() {
  if (!checkedCount.value) {
    showToast(t('cart.needSelect'))
    return
  }
  navigateTo('/checkout')
}

onMounted(load)
</script>

<style scoped>
.cart-page {
  width: min(100%, var(--page-max));
  min-height: calc(100vh - 72px);
  margin-inline: auto;
  padding: var(--space-md) var(--space-sm) calc(148px + env(safe-area-inset-bottom));
}
.cart-heading { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-lg); }
.back-button { width: 44px; height: 44px; display: grid; place-items: center; padding: 0; border: 1px solid var(--color-border); border-radius: 50%; background: var(--color-bg-card); cursor: pointer; }
.cart-heading > div > span,
.summary-eyebrow { color: var(--color-primary-dark); font-family: var(--font-display); font-size: 10px; font-weight: 720; letter-spacing: .12em; }
.cart-heading h1 { margin: 3px 0 0; font-family: var(--font-display); font-size: 28px; line-height: 1; letter-spacing: -0.04em; }
.cart-layout { display: grid; gap: var(--space-md); }
.cart-items { min-width: 0; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-card); }
.items-heading { min-height: 58px; display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); padding: 0 var(--space-md); border-bottom: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 13px; }
.select-all { min-height: 44px; display: inline-flex; align-items: center; gap: 8px; padding: 0; border: 0; background: transparent; color: var(--color-text-secondary); cursor: pointer; }
.check-control { width: 22px; height: 22px; display: grid; place-items: center; border: 1px solid var(--color-border-strong); border-radius: 6px; background: var(--color-bg-card); }
.check-control.checked { border-color: var(--color-accent-ink); background: var(--color-accent-ink); color: var(--color-text-inverse); }
.cart-item { display: grid; grid-template-columns: 44px 92px minmax(0, 1fr); align-items: center; gap: var(--space-sm); padding: var(--space-md) var(--space-sm); border-bottom: 1px solid var(--color-border); }
.cart-item:last-child { border-bottom: 0; }
.cart-item[aria-busy="true"] { opacity: .65; }
.item-check { width: 44px; height: 44px; display: grid; place-items: center; padding: 0; border: 0; background: transparent; cursor: pointer; }
.item-image { width: 92px; height: 92px; display: grid; place-items: center; overflow: hidden; border-radius: var(--radius-md); background: var(--color-search-bg); color: var(--color-text-secondary); font-size: 11px; }
.item-image img { width: 100%; height: 100%; object-fit: cover; }
.item-content { min-width: 0; }
.item-name { color: var(--color-text-primary); font-size: 14px; font-weight: 560; line-height: 1.48; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
.item-price { display: block; margin-top: 8px; color: var(--color-price); font-family: var(--font-display); font-size: 19px; font-weight: 730; font-variant-numeric: tabular-nums; }
.item-price small { font-size: 11px; }
.item-controls { display: flex; align-items: center; justify-content: space-between; gap: var(--space-xs); margin-top: var(--space-sm); }
.quantity { display: grid; grid-template-columns: 44px 32px 44px; align-items: center; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.quantity button { width: 44px; height: 44px; display: grid; place-items: center; padding: 0; border: 0; background: transparent; color: var(--color-text-primary); cursor: pointer; }
.quantity button:hover { background: var(--color-search-bg); }
.quantity button:disabled,
.delete-button:disabled,
.select-all:disabled { opacity: .45; cursor: not-allowed; }
.quantity span { text-align: center; font-size: 13px; font-variant-numeric: tabular-nums; }
.delete-button { width: 44px; height: 44px; display: grid; place-items: center; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--color-text-secondary); cursor: pointer; }
.delete-button:hover { background: color-mix(in oklch, var(--color-price) 10%, transparent); color: var(--color-price); }
.cart-summary { position: fixed; inset-inline: 0; bottom: calc(64px + env(safe-area-inset-bottom)); z-index: 40; min-height: 76px; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: var(--space-sm); padding: 10px var(--space-sm); border-top: 1px solid var(--color-border); background: color-mix(in oklch, var(--color-bg-card) 96%, transparent); backdrop-filter: blur(16px); }
.cart-summary > .summary-eyebrow,
.cart-summary > h2,
.cart-summary > .summary-row { display: none; }
.summary-total { min-width: 0; display: flex; flex-direction: column; }
.summary-total > span { color: var(--color-text-secondary); font-size: 11px; }
.summary-total strong { color: var(--color-price); font-family: var(--font-display); font-size: 24px; font-weight: 740; font-variant-numeric: tabular-nums; }
.summary-total small { font-size: 12px; }
.checkout-button { min-height: 48px; min-width: 130px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding-inline: var(--space-md); border: 1px solid var(--color-accent-ink); border-radius: var(--radius-md); background: var(--color-accent-ink); color: var(--color-text-inverse); cursor: pointer; font-weight: 700; }
.checkout-button:disabled { opacity: .48; cursor: not-allowed; }
.cart-state { min-height: 54vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-md); padding: var(--space-xl); border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-card); text-align: center; }
.state-icon { width: 72px; height: 72px; display: grid; place-items: center; border-radius: 50%; background: var(--color-primary-soft); color: var(--color-primary-dark); }
.cart-state h2 { max-width: 32ch; margin: 0; font-size: 16px; font-weight: 580; line-height: 1.5; }
.cart-state a,
.cart-state button { min-height: 46px; display: inline-flex; align-items: center; padding: 0 20px; border: 1px solid var(--color-accent-ink); border-radius: var(--radius-md); background: var(--color-accent-ink); color: var(--color-text-inverse); cursor: pointer; font-weight: 680; }
.cart-loading { display: flex; flex-direction: column; gap: var(--space-sm); }
.cart-skeleton { height: 126px; border-radius: var(--radius-lg); background: var(--color-search-bg); }

@media (min-width: 600px) {
  .cart-page { padding-inline: var(--space-lg); }
  .cart-item { grid-template-columns: 44px 120px minmax(0, 1fr); padding: var(--space-lg); }
  .item-image { width: 120px; height: 120px; }
  .item-content { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: var(--space-sm) var(--space-lg); align-items: start; }
  .item-price { margin-top: 0; font-size: 21px; text-align: right; }
  .item-controls { grid-column: 1 / -1; }
}

@media (min-width: 768px) {
  .cart-page { padding-top: var(--space-xl); padding-bottom: var(--space-3xl); }
  .cart-heading { margin-bottom: var(--space-xl); }
  .back-button { display: none; }
  .cart-heading h1 { font-size: 42px; }
  .cart-layout { grid-template-columns: minmax(0, 1fr) 320px; gap: var(--space-xl); align-items: start; }
  .cart-summary { position: sticky; top: 104px; z-index: 1; min-height: 0; display: flex; flex-direction: column; align-items: stretch; gap: 0; padding: var(--space-lg); border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-card); backdrop-filter: none; }
  .cart-summary > .summary-eyebrow,
  .cart-summary > h2,
  .cart-summary > .summary-row { display: flex; }
  .cart-summary > h2 { margin: 5px 0 var(--space-lg); font-family: var(--font-display); font-size: 24px; letter-spacing: -0.035em; }
  .summary-row { align-items: center; justify-content: space-between; gap: var(--space-md); padding-bottom: var(--space-md); border-bottom: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 13px; }
  .summary-row strong { color: var(--color-text-primary); font-variant-numeric: tabular-nums; }
  .summary-total { flex-direction: row; align-items: baseline; justify-content: space-between; gap: var(--space-md); padding: var(--space-lg) 0; }
  .summary-total > span { font-size: 14px; }
  .summary-total strong { font-size: 28px; }
  .checkout-button { width: 100%; }
}
</style>
