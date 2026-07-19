<template>
  <div class="lux">
    <header class="lux-head">
      <button class="lux-back" :aria-label="$t('common.back')" @click="navigateTo('/user')">
        <svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
      </button>
      <span class="lux-head-title">{{ $t('order.title') }}</span>
    </header>

    <!-- 状态筛选 tabs -->
    <nav class="od-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.status"
        class="od-tab"
        :class="{ 'is-active': activeStatus === tab.status }"
        @click="activeStatus = tab.status; load()"
      >
        {{ tab.label }}
        <span class="od-tab-glow" />
      </button>
    </nav>

    <div class="lux-scroll">
      <!-- 空状态 -->
      <div v-if="!loading && orders.length === 0" class="lux-empty">
        <div class="lux-empty-ico">🧾</div>
        <div class="lux-empty-txt">{{ $t('order.empty') }}</div>
      </div>

      <!-- 订单卡片列表 -->
      <div
        v-for="o in orders"
        v-else
        :key="o.id"
        class="lux-card od-card"
        @click="navigateTo(`/order/${o.id}`)"
      >
        <div class="oc-hd">
          <span class="oc-sn">{{ $t('order.orderNo') }} <b>{{ o.order_sn }}</b></span>
          <span
            class="oc-status"
            :class="{
              'is-amber': orderStatusTone(o.status) === 'amber',
              'is-muted': orderStatusTone(o.status) === 'muted',
              'is-dim': orderStatusTone(o.status) === 'dim',
            }"
          >{{ orderStatusKey(o.status) ? $t(orderStatusKey(o.status)) : o.status }}</span>
        </div>
        <div class="oc-bd">
          <span class="oc-name">{{ o.name }}</span>
          <span class="lux-price oc-total"><i>¥</i>{{ o.total?.toFixed(2) }}</span>
        </div>
        <span class="lux-edge" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
import { showToast } from 'vant'
import { orderStatusKey, orderStatusTone } from '~/utils/orderStatus'
const { t } = useI18n()
interface Order { id:number; order_sn:string; status:string; total:number; name:string }
const { apiFetch } = useApi()
const route = useRoute()
const tabs = computed(() => [
  { status:'', label: t('order.statusAll') }, { status:'PAYING', label: t('order.statusPaying') },
  { status:'TRADE_SUCCESS', label: t('order.statusPaid') }, { status:'TRADE_CLOSED', label: t('order.statusClosed') },
])
const activeStatus = ref<string>(typeof route.query.status === 'string' ? route.query.status : '')
const orders = ref<Order[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const q = activeStatus.value ? `?status=${activeStatus.value}` : ''
    const res = await apiFetch<{ total:number; data:Order[]|null }>(`/v1/orders${q}`)
    orders.value = res.data || []
  } catch (e:any) { showToast(e?.message || t('order.loadFailed')) }
  finally { loading.value = false }
}
onMounted(load)
</script>

<style scoped>
/* ---- Status tabs ---- */
.od-tabs {
  position: sticky; top: 54px; z-index: 15;
  display: flex; gap: 8px; padding: 12px 14px 10px; overflow-x: auto;
  background: color-mix(in srgb, var(--lux-bg) 82%, transparent);
  backdrop-filter: saturate(150%) blur(12px);
  -ms-overflow-style: none; scrollbar-width: none;
}
.od-tabs::-webkit-scrollbar { display: none; }
.od-tab {
  position: relative; flex: 0 0 auto; border: 1px solid var(--lux-hair);
  background: var(--lux-surface); color: var(--lux-text-2);
  font-size: 13px; letter-spacing: 1px; padding: 8px 18px; border-radius: 999px;
  cursor: pointer; transition: color .18s ease, border-color .18s ease, background .18s ease;
}
.od-tab.is-active {
  color: #1a0d05; font-weight: 700; border-color: transparent;
  background: linear-gradient(135deg, var(--lux-gold), var(--lux-accent-2) 45%, var(--lux-accent));
  box-shadow: 0 6px 18px rgba(224, 190, 120, .38), inset 0 1px 0 rgba(255, 255, 255, .35);
}
.od-tab-glow { display: none; }

/* ---- Order card ---- */
.od-card {
  position: relative; padding: 16px 16px 18px; overflow: hidden; cursor: pointer;
  transition: transform .12s ease, border-color .12s ease;
}
.od-card:active { transform: scale(.99); border-color: var(--lux-hair); }
.oc-hd { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--lux-text-2); }
.oc-sn { letter-spacing: .3px; }
.oc-sn b { color: var(--lux-text); font-weight: 600; font-variant-numeric: tabular-nums; }
.oc-status {
  font-size: 12px; font-weight: 600; letter-spacing: 1px; padding: 4px 12px; border-radius: 999px;
  border: 1px solid var(--lux-hair-soft); color: var(--lux-text-2);
}
.oc-status.is-amber { color: var(--lux-gold); border-color: rgba(227, 186, 125, .35); background: rgba(227, 186, 125, .1); }
.oc-status.is-muted { color: var(--lux-text-2); }
.oc-status.is-dim { color: var(--lux-text-3); border-color: var(--lux-hair-soft); }
.oc-bd { display: flex; justify-content: space-between; align-items: baseline; margin-top: 16px; }
.oc-name { font-size: 15px; font-weight: 500; color: var(--lux-text); }
.oc-total { font-size: 20px; }
</style>
