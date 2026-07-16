<template>
  <div class="checkout-page">
    <van-nav-bar title="确认订单" left-arrow @click-left="navigateTo('/cart')" />

    <div class="ck-addr" @click="pickAddr">
      <template v-if="addr">
        <div class="ck-addr-name">{{ addr.signerName }} {{ addr.signerMobile }}</div>
        <div class="ck-addr-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.address }}</div>
      </template>
      <div v-else class="ck-addr-empty">＋ 选择收货地址</div>
    </div>

    <div class="ck-goods">
      <div v-for="it in checkedItems" :key="it.id" class="ck-item">
        <van-image width="60" height="60" radius="6" :src="it.goods_image" />
        <div class="ck-item-main">
          <div class="ck-item-name">{{ it.goods_name }}</div>
          <div class="ck-item-row"><span class="ck-price">¥{{ it.goods_price?.toFixed(2) }}</span><span>x{{ it.nums }}</span></div>
        </div>
      </div>
    </div>

    <van-field v-model="post" label="备注" placeholder="留言（选填）" type="textarea" rows="1" autosize />

    <van-submit-bar :price="totalCents" button-text="提交订单" :loading="submitting" @submit="submit">
      <span class="ck-count">共 {{ checkedItems.length }} 件</span>
    </van-submit-bar>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
import { showToast } from 'vant'
interface CartItem { id:number; goods_name:string; goods_image:string; goods_price:number; nums:number; checked:boolean }
interface Addr { id:number; province:string; city:string; district:string; address:string; signerName:string; signerMobile:string }

const { apiFetch } = useApi()
const { refresh: refreshBadge } = useCartCount()
const route = useRoute()

const checkedItems = ref<CartItem[]>([])
const addr = ref<Addr | null>(null)
const post = ref('')
const submitting = ref(false)

const totalCents = computed(() => Math.round(checkedItems.value.reduce((s,i)=>s + i.goods_price * i.nums, 0) * 100))

async function loadCart() {
  const res = await apiFetch<{ total:number; data:CartItem[]|null }>('/v1/cart')
  checkedItems.value = (res.data || []).filter(i => !!i.checked).map(i => ({ ...i, nums: i.nums || 1 }))
  if (checkedItems.value.length === 0) { showToast('没有勾选的商品'); navigateTo('/cart') }
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
  if (!addr.value) { showToast('请选择收货地址'); return }
  submitting.value = true
  try {
    const full = `${addr.value.province}${addr.value.city}${addr.value.district}${addr.value.address}`
    const res = await apiFetch<{ id:number; order_sn:string; total:number; msg:string }>('/v1/orders', {
      method: 'POST',
      body: { address: full, name: addr.value.signerName, mobile: addr.value.signerMobile, post: post.value },
    })
    await refreshBadge()
    showToast('下单成功')
    navigateTo(`/order/${res.id}?pay=1`)
  } catch (e:any) {
    showToast(e?.data?.msg || e?.message || '下单失败')
  } finally { submitting.value = false }
}
</script>

<style scoped>
.checkout-page { min-height:100vh; background:var(--color-bg-page); padding-bottom:60px; }
.ck-addr { background:var(--color-bg-card); margin:10px; padding:14px; border-radius:12px; }
.ck-addr-name { font-weight:bold; color:var(--color-text-primary); }
.ck-addr-detail { color:var(--color-text-secondary); font-size:13px; margin-top:4px; }
.ck-addr-empty { color:var(--color-primary); }
.ck-goods { background:var(--color-bg-card); margin:10px; padding:6px 12px; border-radius:12px; }
.ck-item { display:flex; gap:10px; padding:10px 0; }
.ck-item-main { flex:1; min-width:0; }
.ck-item-name { font-size:14px; color:var(--color-text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ck-item-row { display:flex; justify-content:space-between; margin-top:14px; }
.ck-price { color:var(--color-primary); font-weight:bold; }
.ck-count { color:var(--color-text-secondary); font-size:13px; }
</style>
