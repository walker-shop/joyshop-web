<template>
  <div class="lux">
    <header class="lux-head">
      <button class="lux-back" aria-label="返回" @click="navigateTo('/user')">
        <svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
      </button>
      <span class="lux-head-title">我的订单</span>
    </header>

    <!-- 状态筛选 tabs -->
    <nav class="od-tabs">
      <button
        v-for="t in tabs"
        :key="t.status"
        class="od-tab"
        :class="{ 'is-active': activeStatus === t.status }"
        @click="activeStatus = t.status; load()"
      >
        {{ t.label }}
        <span class="od-tab-glow" />
      </button>
    </nav>

    <div class="lux-scroll">
      <!-- 空状态 -->
      <div v-if="!loading && orders.length === 0" class="lux-empty">
        <div class="lux-empty-ico">🧾</div>
        <div class="lux-empty-txt">暂无订单</div>
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
          <span class="oc-sn">订单号 <b>{{ o.order_sn }}</b></span>
          <span
            class="oc-status"
            :class="{
              'is-amber': statusLabel(o.status) === '待付款',
              'is-muted': statusLabel(o.status) === '已支付' || statusLabel(o.status) === '已完成',
              'is-dim': statusLabel(o.status) === '已关闭',
            }"
          >{{ statusLabel(o.status) }}</span>
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
import { orderStatusLabel } from '~/utils/orderStatus'
interface Order { id:number; order_sn:string; status:string; total:number; name:string }
const { apiFetch } = useApi()
const route = useRoute()
const tabs = [
  { status:'', label:'全部' }, { status:'PAYING', label:'待付款' },
  { status:'TRADE_SUCCESS', label:'已支付' }, { status:'TRADE_CLOSED', label:'已关闭' },
]
const activeStatus = ref<string>(typeof route.query.status === 'string' ? route.query.status : '')
const orders = ref<Order[]>([])
const loading = ref(false)
const statusLabel = orderStatusLabel

async function load() {
  loading.value = true
  try {
    const q = activeStatus.value ? `?status=${activeStatus.value}` : ''
    const res = await apiFetch<{ total:number; data:Order[]|null }>(`/v1/orders${q}`)
    orders.value = res.data || []
  } catch (e:any) { showToast(e?.message || '加载订单失败') }
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
