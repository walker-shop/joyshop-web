<template>
  <div class="checkout-page lux">
    <header class="ck-head">
      <button class="ck-back" :aria-label="$t('common.back')" @click="navigateTo('/cart')">
        <svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
      </button>
      <span class="ck-head-title">{{ $t('checkout.title') }}</span>
    </header>

    <div class="ck-scroll">
      <!-- 收货地址 -->
      <button class="ck-addr" @click="pickAddr">
        <div class="ck-addr-pin">
          <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
        </div>
        <div class="ck-addr-body">
          <template v-if="addr">
            <div class="ck-addr-name">{{ addr.signerName }}<span class="ck-addr-tel">{{ addr.signerMobile }}</span></div>
            <div class="ck-addr-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.address }}</div>
          </template>
          <template v-else>
            <div class="ck-addr-name">{{ $t('checkout.addAddr') }}</div>
            <div class="ck-addr-detail muted">{{ $t('checkout.addAddrHint') }}</div>
          </template>
        </div>
        <svg class="ck-addr-arr" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>
        <span class="ck-addr-edge" />
      </button>

      <!-- 商品清单 -->
      <section class="ck-card">
        <div v-for="it in checkedItems" :key="it.id" class="ck-item">
          <div class="ck-thumb">
            <img v-if="it.goods_image" :src="it.goods_image" :alt="it.goods_name" @error="onImgErr">
            <span v-else class="ck-thumb-ph">{{ $t('checkout.noImage') }}</span>
          </div>
          <div class="ck-item-main">
            <div class="ck-item-name">{{ it.goods_name }}</div>
            <div class="ck-item-row">
              <span class="ck-price"><i>¥</i>{{ it.goods_price?.toFixed(2) }}</span>
              <span class="ck-qty">×{{ it.nums }}</span>
            </div>
          </div>
        </div>

        <div class="ck-note">
          <span class="ck-note-label">{{ $t('checkout.note') }}</span>
          <input v-model="post" class="ck-note-input" :placeholder="$t('checkout.notePlaceholder')">
        </div>
      </section>

      <!-- 金额明细 -->
      <section class="ck-card ck-summary">
        <div class="ck-sum-row"><span>{{ $t('checkout.goodsAmount') }}</span><span class="mono">¥{{ (totalCents / 100).toFixed(2) }}</span></div>
        <div class="ck-sum-row"><span>{{ $t('checkout.shipping') }}</span><span class="ck-free">{{ $t('checkout.freeShipping') }}</span></div>
        <div class="ck-sum-row ck-sum-total">
          <span>{{ $t('checkout.actualPaid') }}</span>
          <span class="ck-sum-amount"><i>¥</i>{{ (totalCents / 100).toFixed(2) }}</span>
        </div>
      </section>
    </div>

    <!-- 结算条 -->
    <div class="ck-bar">
      <div class="ck-bar-info">
        <span class="ck-bar-label">{{ $t('checkout.total') }}</span>
        <span class="ck-bar-price"><i>¥</i>{{ (totalCents / 100).toFixed(2) }}</span>
        <span class="ck-bar-count">{{ $t('checkout.itemCount', { n: totalNums }) }}</span>
      </div>
      <button class="ck-submit" :disabled="submitting" @click="submit">
        <span v-if="!submitting">{{ $t('checkout.submit') }}</span>
        <span v-else class="ck-spin" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
import { showToast } from 'vant'
const { t } = useI18n()
interface CartItem { id:number; goods_name:string; goods_image:string; goods_price:number; nums:number; checked:boolean }
interface Addr { id:number; province:string; city:string; district:string; address:string; signerName:string; signerMobile:string }

const { apiFetch } = useApi()
const { refresh: refreshBadge } = useCartCount()
const { listMine, calcDiscountCents } = useCoupons()
const route = useRoute()

const checkedItems = ref<CartItem[]>([])
const addr = ref<Addr | null>(null)
const post = ref('')
const submitting = ref(false)
const myCoupons = ref<MyCoupon[]>([])
const selectedCouponId = ref(0)

const totalCents = computed(() => Math.round(checkedItems.value.reduce((s,i)=>s + i.goods_price * i.nums, 0) * 100))
const totalNums = computed(() => checkedItems.value.reduce((s,i)=>s + i.nums, 0))
// 满足本单门槛且未使用的券
const usableCoupons = computed(() => myCoupons.value.filter(c => c.status === 1 && totalCents.value >= c.thresholdCents))
const discountCents = computed(() => {
  const c = usableCoupons.value.find(c => c.id === selectedCouponId.value)
  return c ? calcDiscountCents(c, totalCents.value) : 0
})
const payCents = computed(() => Math.max(0, totalCents.value - discountCents.value))
function onImgErr(e: Event) { (e.target as HTMLImageElement).style.visibility = 'hidden' }

async function loadCart() {
  const res = await apiFetch<{ total:number; data:CartItem[]|null }>('/v1/cart')
  checkedItems.value = (res.data || []).filter(i => !!i.checked).map(i => ({ ...i, nums: i.nums || 1 }))
  if (checkedItems.value.length === 0) { showToast(t('checkout.noChecked')); navigateTo('/cart') }
}
async function loadAddr() {
  const res = await apiFetch<{ total:number; data:Addr[]|null }>('/v1/userop/address')
  const list = res.data || []
  const wantId = route.query.addr ? Number(route.query.addr)
    : (import.meta.client ? Number(localStorage.getItem('js_last_addr')) : 0)
  addr.value = list.find(a => a.id === wantId) || list[0] || null
}
onMounted(async () => { await Promise.all([loadCart(), loadAddr()]) })

function pickAddr() { navigateTo('/user/address?from=checkout') }

async function submit() {
  if (!addr.value) { showToast(t('checkout.needAddr')); return }
  submitting.value = true
  try {
    const full = `${addr.value.province}${addr.value.city}${addr.value.district}${addr.value.address}`
    const res = await apiFetch<{ id:number; order_sn:string; total:number; msg:string }>('/v1/orders', {
      method: 'POST',
      body: { address: full, name: addr.value.signerName, mobile: addr.value.signerMobile, post: post.value },
    })
    await refreshBadge()
    showToast(t('checkout.orderSuccess'))
    navigateTo(`/order/${res.id}?pay=1`)
  } catch (e:any) {
    showToast(e?.data?.msg || e?.message || t('checkout.orderFailed'))
  } finally { submitting.value = false }
}
</script>

<style scoped>
/* 颜色/背景/布局全部继承全局 .lux（深浅双主题）; 本页只写局部结构样式 */

/* ---- Header ---- */
.ck-head {
  position: sticky; top: 0; z-index: 20;
  height: 54px; display: flex; align-items: center; justify-content: center; padding: 0 12px;
  background: color-mix(in srgb, var(--lux-bg) 82%, transparent);
  backdrop-filter: saturate(150%) blur(14px);
  border-bottom: 1px solid var(--lux-hair-soft);
}
.ck-head-title { font-size: 17px; font-weight: 600; letter-spacing: 2px; color: var(--lux-text); }
.ck-back {
  position: absolute; left: 12px; width: 36px; height: 36px; border: 1px solid var(--lux-hair); padding: 0;
  display: grid; place-items: center; border-radius: 50%; background: var(--lux-surface);
}
.ck-back svg { width: 20px; height: 20px; fill: var(--lux-text); }

.ck-scroll { flex: 1; padding: 16px 14px 100px; overflow-y: auto; }

/* ---- Address ---- */
.ck-addr {
  position: relative; width: 100%; text-align: left;
  display: flex; align-items: center; gap: 14px;
  padding: 18px 16px; margin-bottom: 14px;
  background: linear-gradient(160deg, var(--lux-surface-2), var(--lux-surface));
  border: 1px solid var(--lux-hair); border-radius: 18px; overflow: hidden;
}
.ck-addr-pin {
  flex: 0 0 42px; width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center;
  background: linear-gradient(140deg, var(--lux-accent-2), var(--lux-accent));
  box-shadow: 0 6px 16px rgba(224,190,120,.45);
}
.ck-addr-pin svg { width: 23px; height: 23px; fill: #fff; }
.ck-addr-body { flex: 1; min-width: 0; }
.ck-addr-name { font-size: 16px; font-weight: 600; color: var(--lux-text); display: flex; align-items: baseline; gap: 10px; }
.ck-addr-tel { font-size: 13px; font-weight: 400; color: var(--lux-text-2); letter-spacing: 1px; font-variant-numeric: tabular-nums; }
.ck-addr-detail { font-size: 13px; color: var(--lux-text-2); margin-top: 5px; line-height: 1.5; }
.ck-addr-detail.muted { color: var(--lux-text-3); }
.ck-addr-arr { width: 20px; height: 20px; fill: none; stroke: var(--lux-text-3); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.ck-addr-edge {
  position: absolute; left: 16px; right: 16px; bottom: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--lux-gold) 30%, var(--lux-accent) 70%, transparent);
  opacity: .8;
}

/* ---- Cards ---- */
.ck-card {
  background: var(--lux-surface); border: 1px solid var(--lux-hair-soft); border-radius: 18px;
  padding: 4px 16px; margin-bottom: 14px;
}
.ck-item { display: flex; gap: 13px; padding: 15px 0; border-bottom: 1px solid var(--lux-hair-soft); }
.ck-thumb {
  flex: 0 0 74px; width: 74px; height: 74px; border-radius: 14px; overflow: hidden;
  background: var(--lux-thumb-bg); border: 1px solid var(--lux-hair-soft); display: grid; place-items: center;
}
.ck-thumb img { width: 100%; height: 100%; object-fit: cover; }
.ck-thumb-ph { font-size: 11px; color: var(--lux-text-3); }
.ck-item-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ck-item-name {
  font-size: 14px; font-weight: 500; color: var(--lux-text); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.ck-item-row { margin-top: auto; padding-top: 8px; display: flex; align-items: baseline; justify-content: space-between; }
.ck-price { color: var(--lux-price); font-weight: 700; font-size: 17px; font-variant-numeric: tabular-nums; letter-spacing: .3px; }
.ck-price i { font-size: 12px; font-weight: 600; font-style: normal; margin-right: 1px; opacity: .85; }
.ck-qty {
  font-size: 12px; color: var(--lux-text-2); font-variant-numeric: tabular-nums;
  background: var(--lux-chip-bg); border: 1px solid var(--lux-hair-soft); padding: 3px 10px; border-radius: 999px;
}

/* ---- Note ---- */
.ck-note { display: flex; align-items: center; gap: 12px; padding: 16px 0; }
.ck-note-label { font-size: 14px; color: var(--lux-text); font-weight: 500; flex: 0 0 auto; }
.ck-note-input { flex: 1; border: 0; background: transparent; outline: none; text-align: right; font-size: 14px; color: var(--lux-text); }
.ck-note-input::placeholder { color: var(--lux-text-3); }

/* ---- Summary ---- */
.ck-summary { padding: 15px 16px; }
.ck-sum-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--lux-text-2); padding: 7px 0; }
.ck-sum-row .mono { font-variant-numeric: tabular-nums; color: var(--lux-text); }
.ck-free { color: var(--lux-gold); font-weight: 600; letter-spacing: .5px; }
.ck-sum-total { margin-top: 6px; padding-top: 14px; border-top: 1px dashed var(--lux-hair); font-size: 15px; color: var(--lux-text); font-weight: 600; }
.ck-sum-amount { color: var(--lux-price); font-weight: 700; font-size: 21px; font-variant-numeric: tabular-nums; }
.ck-sum-amount i { font-size: 13px; font-style: normal; margin-right: 1px; opacity: .85; }

/* ---- Sticky bar ---- */
.ck-bar {
  position: fixed; left: 50%; transform: translateX(-50%); bottom: 0;
  width: 100%; max-width: 480px; z-index: 30;
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px calc(12px + env(safe-area-inset-bottom));
  background: color-mix(in srgb, var(--lux-bg) 90%, transparent);
  backdrop-filter: saturate(160%) blur(16px);
  border-top: 1px solid var(--lux-hair);
}
.ck-bar-info { flex: 1; display: flex; align-items: baseline; gap: 8px; }
.ck-bar-label { font-size: 13px; color: var(--lux-text-2); }
.ck-bar-price { font-size: 25px; font-weight: 700; color: var(--lux-price); font-variant-numeric: tabular-nums; line-height: 1; }
.ck-bar-price i { font-size: 14px; font-style: normal; opacity: .85; }
.ck-bar-count { font-size: 12px; color: var(--lux-text-3); }
.ck-submit {
  flex: 0 0 auto; min-width: 148px; height: 50px; border: 0; border-radius: 999px;
  color: #1a0d05; font-size: 16px; font-weight: 700; letter-spacing: 2px;
  background: linear-gradient(135deg, var(--lux-gold), var(--lux-accent-2) 45%, var(--lux-accent));
  box-shadow: 0 8px 24px rgba(224,190,120,.5), inset 0 1px 0 rgba(255,255,255,.35);
  display: grid; place-items: center;
  transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
}
.ck-submit:active { transform: translateY(1px) scale(.99); filter: brightness(.96); box-shadow: 0 4px 14px rgba(224,190,120,.42); }
.ck-submit:disabled { opacity: .85; }
.ck-spin { width: 20px; height: 20px; border: 2.5px solid rgba(26,13,5,.35); border-top-color: #1a0d05; border-radius: 50%; animation: ck-rot .7s linear infinite; }
@keyframes ck-rot { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) { .ck-submit, .ck-spin { transition: none; animation: none; } }
</style>
