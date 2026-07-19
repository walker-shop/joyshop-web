<template>
  <div class="lux">
    <header class="lux-head">
      <button class="lux-back" :aria-label="$t('common.back')" @click="navigateTo('/order')">
        <svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
      </button>
      <span class="lux-head-title">{{ $t('order.detailTitle') }}</span>
    </header>

    <template v-if="detail">
      <div class="lux-scroll">
        <!-- 状态 hero -->
        <section
          class="od-hero"
          :class="{
            'is-amber': orderStatusTone(detail.order_info.status) === 'amber',
            'is-muted': orderStatusTone(detail.order_info.status) === 'muted',
            'is-dim': orderStatusTone(detail.order_info.status) === 'dim',
          }"
        >
          <span class="od-hero-dot" />
          <div class="od-hero-status">{{ orderStatusKey(detail.order_info.status) ? $t(orderStatusKey(detail.order_info.status)) : detail.order_info.status }}</div>
          <div class="od-hero-sn">{{ $t('order.orderNo') }} {{ detail.order_info.order_sn }}</div>
        </section>

        <!-- 收货信息 -->
        <section class="lux-card od-addr">
          <div class="od-addr-pin">
            <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
          </div>
          <div class="od-addr-body">
            <div class="od-name">{{ detail.order_info.name }}<span class="od-tel">{{ detail.order_info.mobile }}</span></div>
            <div class="od-detail">{{ detail.order_info.address }}</div>
          </div>
          <span class="lux-edge" />
        </section>

        <!-- 商品 -->
        <section class="lux-card od-goods">
          <div v-for="(g, i) in detail.goods" :key="i" class="od-item">
            <div class="od-thumb">
              <img v-if="g.goods_image" :src="g.goods_image" :alt="g.goods_name">
              <span v-else class="od-thumb-ph">{{ $t('order.noImage') }}</span>
            </div>
            <div class="od-item-main">
              <div class="od-item-name">{{ g.goods_name }}</div>
              <div class="od-item-row">
                <span class="lux-price od-price"><i>¥</i>{{ g.goods_price?.toFixed(2) }}</span>
                <span class="od-qty">×{{ g.nums }}</span>
              </div>
            </div>
          </div>

          <div class="od-sum">
            <span class="od-sum-label">{{ $t('order.actualPaid') }}</span>
            <span class="lux-price od-total"><i>¥</i>{{ detail.order_info.total?.toFixed(2) }}</span>
          </div>
        </section>
      </div>

      <!-- 动作条 -->
      <div v-if="barActions.length" class="lux-bar od-bar">
        <div v-if="isUnpaid" class="od-bar-info">
          <span class="od-bar-label">{{ $t('order.due') }}</span>
          <span class="lux-price od-bar-price"><i>¥</i>{{ detail.order_info.total?.toFixed(2) }}</span>
        </div>
        <div class="od-bar-btns">
          <button v-if="barActions.includes('cancel')" class="lux-btn-ghost od-act-btn" :disabled="acting" @click="onCancel">{{ $t('order.cancelOrder') }}</button>
          <button v-if="barActions.includes('delete')" class="lux-btn-ghost od-act-btn" :disabled="acting" @click="onDelete">{{ $t('order.deleteOrder') }}</button>
          <button v-if="barActions.includes('confirmReceipt')" class="lux-btn od-act-btn" :disabled="acting" @click="onConfirm">{{ $t('order.confirmReceipt') }}</button>
          <button v-if="barActions.includes('pay')" class="lux-btn od-pay-btn" :disabled="paying" @click="doPay">
            <span v-if="!paying">{{ $t('order.payNow') }}</span>
            <span v-else class="lux-spin" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
import { showToast } from 'vant'
import { orderStatusKey, orderStatusTone } from '~/utils/orderStatus'
import { availableActions } from '~/utils/orderActions'
const { t } = useI18n()
interface Detail { order_info:{ id:number; order_sn:string; status:string; total:number; name:string; mobile:string; address:string }; goods:{ goods_name:string; goods_image:string; goods_price:number; nums:number }[] }
const { apiFetch } = useApi()
const { pay } = usePayment()
const { busy: acting, cancel, confirmReceipt, remove } = useOrderActions()
const barActions = computed(() => detail.value ? availableActions(detail.value.order_info.status) : [])
async function onCancel() {
  if (detail.value && await cancel(detail.value.order_info.id)) await load()
}
async function onConfirm() {
  if (detail.value && await confirmReceipt(detail.value.order_info.id)) await load()
}
async function onDelete() {
  if (detail.value && await remove(detail.value.order_info.id)) navigateTo('/order')
}
const route = useRoute()
const detail = ref<Detail | null>(null)
const paying = ref(false)
const isUnpaid = computed(() => ['PAYING','WAIT_BUYER_PAY'].includes(detail.value?.order_info.status || ''))

async function load() {
  const res = await apiFetch<{ data: Detail }>(`/v1/orders/${route.params.id}`)
  detail.value = res.data
}
async function doPay() {
  if (!detail.value) return
  paying.value = true
  try {
    const oi = detail.value.order_info
    const r = await pay({ orderId: oi.id, orderSn: oi.order_sn, amount: oi.total })
    if (r === 'paid') { showToast(t('order.paySuccess')); await load() }
    else showToast(t('order.payIncomplete'))
  } catch (e:any) { showToast(e?.message || t('order.payFailed')) }
  finally { paying.value = false }
}
onMounted(async () => {
  await load()
  if (route.query.pay === '1' && isUnpaid.value) doPay()
})
</script>

<style scoped>
/* ---- Status hero ---- */
.od-hero {
  position: relative; overflow: hidden;
  padding: 30px 22px 28px; margin-bottom: 14px; border-radius: 20px;
  background: linear-gradient(160deg, var(--lux-surface-2), var(--lux-surface));
  border: 1px solid var(--lux-hair);
}
.od-hero-dot {
  display: inline-block; width: 9px; height: 9px; border-radius: 50%;
  background: var(--lux-text-3); box-shadow: 0 0 0 4px rgba(255, 255, 255, .04);
  margin-bottom: 14px;
}
.od-hero-status { font-size: 27px; font-weight: 700; letter-spacing: 3px; color: var(--lux-text); line-height: 1; }
.od-hero-sn { margin-top: 12px; font-size: 12px; letter-spacing: .5px; color: var(--lux-text-3); font-variant-numeric: tabular-nums; }
/* status colour treatments */
.od-hero.is-amber {
  border-color: rgba(227, 186, 125, .38);
  background:
    radial-gradient(120% 80% at 0% 0%, rgba(224, 190, 120, .16), transparent 60%),
    linear-gradient(160deg, var(--lux-surface-2), var(--lux-surface));
}
.od-hero.is-amber .od-hero-dot { background: var(--lux-gold); box-shadow: 0 0 12px rgba(227, 186, 125, .8), 0 0 0 4px rgba(227, 186, 125, .12); }
.od-hero.is-amber .od-hero-status { color: var(--lux-gold); }
.od-hero.is-muted .od-hero-dot { background: var(--lux-text-2); box-shadow: 0 0 0 4px rgba(255, 255, 255, .05); }
.od-hero.is-muted .od-hero-status { color: var(--lux-text); }
.od-hero.is-dim .od-hero-status { color: var(--lux-text-2); }

/* ---- Address ---- */
.od-addr { position: relative; display: flex; align-items: center; gap: 14px; padding: 18px 16px; overflow: hidden; }
.od-addr-pin {
  flex: 0 0 42px; width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center;
  background: linear-gradient(140deg, var(--lux-accent-2), var(--lux-accent));
  box-shadow: 0 6px 16px rgba(224, 190, 120, .45);
}
.od-addr-pin svg { width: 23px; height: 23px; fill: #fff; }
.od-addr-body { flex: 1; min-width: 0; }
.od-name { font-size: 16px; font-weight: 600; color: var(--lux-text); display: flex; align-items: baseline; gap: 10px; }
.od-tel { font-size: 13px; font-weight: 400; color: var(--lux-text-2); letter-spacing: 1px; font-variant-numeric: tabular-nums; }
.od-detail { font-size: 13px; color: var(--lux-text-2); margin-top: 5px; line-height: 1.5; }

/* ---- Goods ---- */
.od-goods { padding: 4px 16px 16px; }
.od-item { display: flex; gap: 13px; padding: 15px 0; border-bottom: 1px solid var(--lux-hair-soft); }
.od-thumb {
  flex: 0 0 66px; width: 66px; height: 66px; border-radius: 14px; overflow: hidden;
  background: var(--lux-thumb-bg); border: 1px solid var(--lux-hair-soft); display: grid; place-items: center;
}
.od-thumb img { width: 100%; height: 100%; object-fit: cover; }
.od-thumb-ph { font-size: 11px; color: var(--lux-text-3); }
.od-item-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.od-item-name {
  font-size: 14px; font-weight: 500; color: var(--lux-text); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.od-item-row { margin-top: auto; padding-top: 8px; display: flex; align-items: baseline; justify-content: space-between; }
.od-price { font-size: 16px; }
.od-qty {
  font-size: 12px; color: var(--lux-text-2); font-variant-numeric: tabular-nums;
  background: var(--lux-chip-bg); border: 1px solid var(--lux-hair-soft); padding: 3px 10px; border-radius: 999px;
}

/* ---- Sum ---- */
.od-sum { display: flex; align-items: baseline; justify-content: flex-end; gap: 12px; padding: 16px 0 4px; }
.od-sum-label { font-size: 14px; color: var(--lux-text); font-weight: 500; }
.od-total { font-size: 22px; }

/* ---- Pay bar ---- */
.od-bar-info { flex: 1; display: flex; align-items: baseline; gap: 8px; }
.od-bar-label { font-size: 13px; color: var(--lux-text-2); }
.od-bar-price { font-size: 25px; line-height: 1; }
.od-pay-btn { flex: 0 0 auto; min-width: 148px; height: 50px; font-size: 16px; }
.od-bar-btns { flex: 1; display: flex; gap: 10px; justify-content: flex-end; align-items: center; }
.od-act-btn { flex: 0 0 auto; min-width: 116px; height: 50px; font-size: 15px; }
</style>
