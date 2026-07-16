<template>
  <div class="order-page">
    <van-nav-bar title="我的订单" left-arrow @click-left="navigateTo('/user')" />
    <van-tabs v-model:active="activeStatus" @change="load">
      <van-tab v-for="t in tabs" :key="t.status" :title="t.label" :name="t.status" />
    </van-tabs>
    <van-empty v-if="!loading && orders.length===0" description="暂无订单" />
    <div v-else class="order-list">
      <div v-for="o in orders" :key="o.id" class="order-card" @click="navigateTo(`/order/${o.id}`)">
        <div class="oc-hd"><span>订单号 {{ o.order_sn }}</span><span class="oc-status">{{ statusLabel(o.status) }}</span></div>
        <div class="oc-bd"><span>{{ o.name }}</span><span class="oc-total">¥{{ o.total?.toFixed(2) }}</span></div>
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
.order-page { min-height:100vh; background:var(--color-bg-page); }
.order-list { padding:10px; }
.order-card { background:var(--color-bg-card); border-radius:12px; padding:14px; margin-bottom:10px; }
.oc-hd { display:flex; justify-content:space-between; font-size:13px; color:var(--color-text-secondary); }
.oc-status { color:var(--color-primary); }
.oc-bd { display:flex; justify-content:space-between; margin-top:10px; align-items:center; }
.oc-total { color:var(--color-primary); font-weight:bold; }
</style>
