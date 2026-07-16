<template>
  <div class="cart-page lux">
    <header class="lux-head">
      <button class="lux-back" aria-label="返回" @click="navigateTo('/')">
        <svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
      </button>
      <span class="lux-head-title">购物车</span>
    </header>

    <!-- 未登录 -->
    <div v-if="!isLoggedIn" class="lux-empty">
      <div class="lux-empty-ico">🔒</div>
      <div class="lux-empty-txt">登录后查看购物车</div>
      <button class="lux-btn ct-empty-btn" @click="navigateTo('/login?redirect=/cart')">去登录</button>
    </div>

    <template v-else>
      <!-- 空车 -->
      <div v-if="!loading && items.length === 0" class="lux-empty">
        <div class="lux-empty-ico">🛒</div>
        <div class="lux-empty-txt">购物车还是空的，快去挑好物吧～</div>
        <button class="lux-btn ct-empty-btn" @click="navigateTo('/')">去逛逛</button>
      </div>

      <!-- 商品列表 -->
      <div v-else class="lux-scroll ct-scroll">
        <section v-for="it in items" :key="it.id" class="ct-item">
          <button
            class="ct-check"
            :class="{ 'ct-check--on': it.checked }"
            role="checkbox"
            :aria-checked="it.checked"
            aria-label="选择商品"
            @click="toggle(it, !it.checked)"
          >
            <svg v-if="it.checked" viewBox="0 0 24 24"><path d="m9.5 16.2-3.7-3.7L4.4 14l5.1 5.1L20 8.6l-1.4-1.4z" /></svg>
          </button>

          <div class="ct-thumb">
            <img v-if="it.goods_image" :src="it.goods_image" :alt="it.goods_name">
            <span v-else class="ct-thumb-ph">无图</span>
          </div>

          <div class="ct-main">
            <div class="ct-name">{{ it.goods_name }}</div>
            <div class="ct-row">
              <span class="lux-price ct-price"><i>¥</i>{{ it.goods_price?.toFixed(2) }}</span>
              <div class="ct-step">
                <button
                  class="ct-step-btn"
                  aria-label="减少"
                  :disabled="it.nums <= 1"
                  @click="changeNums(it, Math.max(1, it.nums - 1))"
                >−</button>
                <span class="ct-step-val">{{ it.nums }}</span>
                <button class="ct-step-btn" aria-label="增加" @click="changeNums(it, it.nums + 1)">＋</button>
              </div>
            </div>
          </div>

          <button class="ct-del" aria-label="删除" @click="remove(it)">
            <svg viewBox="0 0 24 24"><path d="M9 3h6l1 2h4v2H4V5h4zM6 9h12l-1 12H7z" /></svg>
          </button>
          <span class="lux-edge" />
        </section>
      </div>

      <!-- 结算条 -->
      <div v-if="items.length" class="lux-bar ct-bar">
        <button
          class="ct-all"
          :class="{ 'ct-all--on': allChecked }"
          role="checkbox"
          :aria-checked="allChecked"
          @click="toggleAll(!allChecked)"
        >
          <span class="ct-check ct-check--sm" :class="{ 'ct-check--on': allChecked }">
            <svg v-if="allChecked" viewBox="0 0 24 24"><path d="m9.5 16.2-3.7-3.7L4.4 14l5.1 5.1L20 8.6l-1.4-1.4z" /></svg>
          </span>
          <span class="ct-all-txt">全选</span>
        </button>
        <div class="ct-bar-total">
          <span class="ct-bar-label">合计</span>
          <span class="lux-price ct-bar-price"><i>¥</i>{{ (checkedTotalCents / 100).toFixed(2) }}</span>
        </div>
        <button class="lux-btn ct-submit" @click="goCheckout">去结算</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'

interface CartItem { id:number; goods_id:number; goods_name:string; goods_image:string; goods_price:number; nums:number; checked:boolean }

const { apiFetch } = useApi()
const { isLoggedIn } = useAuth()
const { refresh: refreshBadge } = useCartCount()

const items = ref<CartItem[]>([])
const loading = ref(false)

async function load() {
  if (!isLoggedIn.value) return
  loading.value = true
  try {
    const res = await apiFetch<{ total:number; data:CartItem[]|null }>('/v1/cart')
    items.value = (res.data || []).map(it => ({ ...it, checked: !!it.checked, nums: it.nums || 1 }))
  } catch (e:any) { showToast(e?.message || '加载购物车失败') }
  finally { loading.value = false }
}
onMounted(load)

const checkedTotalCents = computed(() =>
  Math.round(items.value.filter(i=>i.checked).reduce((s,i)=>s + i.goods_price * i.nums, 0) * 100))
const allChecked = computed(() => items.value.length>0 && items.value.every(i=>i.checked))

async function put(it: CartItem) {
  await apiFetch<{ msg:string }>(`/v1/cart/${it.id}`, { method:'PUT', body:{ nums: it.nums, checked: it.checked } })
}
async function toggle(it: CartItem, v: boolean) {
  it.checked = v; try { await put(it) } catch { it.checked = !v; showToast('操作失败') }
}
async function toggleAll(v: boolean) {
  for (const it of items.value) { it.checked = v; try { await put(it) } catch { showToast('操作失败') } }
}
async function changeNums(it: CartItem, v: number) {
  const old = it.nums; it.nums = v
  try { await put(it) } catch { it.nums = old; showToast('修改数量失败') }
}
async function remove(it: CartItem) {
  try {
    await apiFetch<{ msg:string }>(`/v1/cart/${it.id}`, { method:'DELETE' })
    items.value = items.value.filter(x=>x.id!==it.id)
    await refreshBadge()
  } catch { showToast('删除失败') }
}
function goCheckout() {
  if (!items.value.some(i=>i.checked)) { showToast('请勾选要结算的商品'); return }
  navigateTo('/checkout')
}
</script>

<style scoped>
/* 空状态按钮 */
.ct-empty-btn { width: 168px; height: 46px; font-size: 15px; margin-top: 4px; }

/* 列表滚动区（底部留出结算条空间） */
.ct-scroll { padding: 16px 14px 96px; }

/* ---- 商品行 ---- */
.ct-item {
  position: relative;
  display: flex; align-items: center; gap: 12px;
  padding: 14px 4px; margin-bottom: 4px;
}

/* 自定义勾选圈 */
.ct-check {
  flex: 0 0 24px; width: 24px; height: 24px; padding: 0;
  border: 1.5px solid var(--lux-hair); border-radius: 50%;
  background: var(--lux-surface); cursor: pointer;
  display: grid; place-items: center;
  transition: border-color .15s ease, background .15s ease;
}
.ct-check svg { width: 15px; height: 15px; fill: #1a0d05; }
.ct-check--on {
  border-color: transparent;
  background: linear-gradient(140deg, var(--lux-gold), var(--lux-accent));
  box-shadow: 0 3px 10px rgba(224, 190, 120, .4);
}
.ct-check--sm { flex: 0 0 20px; width: 20px; height: 20px; }
.ct-check--sm svg { width: 13px; height: 13px; }

/* 缩略图 */
.ct-thumb {
  flex: 0 0 78px; width: 78px; height: 78px; border-radius: 14px; overflow: hidden;
  background: var(--lux-thumb-bg); border: 1px solid var(--lux-hair-soft); display: grid; place-items: center;
}
.ct-thumb img { width: 100%; height: 100%; object-fit: cover; }
.ct-thumb-ph { font-size: 11px; color: var(--lux-text-3); }

/* 主体 */
.ct-main { flex: 1; min-width: 0; }
.ct-name {
  font-size: 14px; font-weight: 500; color: var(--lux-text); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.ct-row { margin-top: 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ct-price { font-size: 17px; }
.ct-price i { font-size: 12px; }

/* 数量步进器 */
.ct-step {
  display: flex; align-items: center;
  border: 1px solid var(--lux-hair); border-radius: 999px; background: var(--lux-surface);
  overflow: hidden;
}
.ct-step-btn {
  width: 30px; height: 28px; border: 0; background: transparent; cursor: pointer;
  color: var(--lux-text); font-size: 17px; line-height: 1; display: grid; place-items: center;
  transition: background .12s ease, color .12s ease;
}
.ct-step-btn:active { background: var(--lux-surface-2); }
.ct-step-btn:disabled { color: var(--lux-text-3); cursor: default; }
.ct-step-val {
  min-width: 30px; text-align: center; font-size: 14px; color: var(--lux-text);
  font-variant-numeric: tabular-nums;
}

/* 删除 */
.ct-del {
  flex: 0 0 auto; width: 32px; height: 32px; padding: 0; border: 0; background: transparent;
  cursor: pointer; display: grid; place-items: center;
  transition: opacity .12s ease;
}
.ct-del svg { width: 19px; height: 19px; fill: var(--lux-text-3); transition: fill .12s ease; }
.ct-del:active svg { fill: var(--lux-accent); }

/* ---- 结算条 ---- */
.ct-bar { justify-content: space-between; }
.ct-all {
  flex: 0 0 auto; display: flex; align-items: center; gap: 7px;
  border: 0; background: transparent; padding: 0; cursor: pointer;
}
.ct-all-txt { font-size: 13px; color: var(--lux-text-2); }
.ct-all--on .ct-all-txt { color: var(--lux-text); }

.ct-bar-total { flex: 1; display: flex; align-items: baseline; justify-content: flex-end; gap: 6px; margin-right: 4px; }
.ct-bar-label { font-size: 13px; color: var(--lux-text-2); }
.ct-bar-price { font-size: 24px; line-height: 1; }
.ct-bar-price i { font-size: 13px; }

.ct-submit { flex: 0 0 auto; min-width: 130px; height: 46px; font-size: 15px; }

:focus-visible { outline: 2px solid var(--lux-accent); outline-offset: 2px; }
</style>
