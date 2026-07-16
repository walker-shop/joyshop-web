<template>
  <div class="od-page">
    <van-nav-bar title="订单详情" left-arrow @click-left="navigateTo('/order')" />
    <template v-if="detail">
      <div class="od-status">{{ statusLabel(detail.order_info.status) }}</div>
      <div class="od-addr">
        <div class="od-name">{{ detail.order_info.name }} {{ detail.order_info.mobile }}</div>
        <div class="od-detail">{{ detail.order_info.address }}</div>
      </div>
      <div class="od-goods">
        <div v-for="(g,i) in detail.goods" :key="i" class="od-item">
          <van-image width="60" height="60" radius="6" :src="g.goods_image" />
          <div class="od-item-main">
            <div class="od-item-name">{{ g.goods_name }}</div>
            <div class="od-item-row"><span class="od-price">¥{{ g.goods_price?.toFixed(2) }}</span><span>x{{ g.nums }}</span></div>
          </div>
        </div>
      </div>
      <div class="od-sum">实付 <span class="od-total">¥{{ detail.order_info.total?.toFixed(2) }}</span></div>
      <div v-if="isUnpaid" class="od-pay">
        <van-button type="primary" block round :loading="paying" @click="doPay">立即支付</van-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
import { showToast } from 'vant'
import { orderStatusLabel } from '~/utils/orderStatus'
interface Detail { order_info:{ id:number; order_sn:string; status:string; total:number; name:string; mobile:string; address:string }; goods:{ goods_name:string; goods_image:string; goods_price:number; nums:number }[] }
const { apiFetch } = useApi()
const { pay } = usePayment()
const route = useRoute()
const detail = ref<Detail | null>(null)
const paying = ref(false)
const statusLabel = orderStatusLabel
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
    if (r === 'paid') { showToast('支付成功'); await load() }
    else showToast('支付未完成')
  } catch (e:any) { showToast(e?.message || '支付失败') }
  finally { paying.value = false }
}
onMounted(async () => {
  await load()
  if (route.query.pay === '1' && isUnpaid.value) doPay()
})
</script>

<style scoped>
.od-page { min-height:100vh; background:var(--color-bg-page); padding-bottom:70px; }
.od-status { padding:20px; font-size:18px; font-weight:bold; color:var(--color-primary); }
.od-addr { background:var(--color-bg-card); margin:10px; padding:14px; border-radius:12px; }
.od-name { font-weight:bold; color:var(--color-text-primary); }
.od-detail { color:var(--color-text-secondary); font-size:13px; margin-top:4px; }
.od-goods { background:var(--color-bg-card); margin:10px; padding:6px 12px; border-radius:12px; }
.od-item { display:flex; gap:10px; padding:10px 0; }
.od-item-main { flex:1; min-width:0; }
.od-item-name { font-size:14px; color:var(--color-text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.od-item-row { display:flex; justify-content:space-between; margin-top:14px; }
.od-price,.od-total { color:var(--color-primary); font-weight:bold; }
.od-sum { text-align:right; padding:12px 20px; color:var(--color-text-primary); }
.od-pay { position:fixed; left:0; right:0; bottom:0; padding:10px 12px; background:var(--color-bg-card); }
</style>
