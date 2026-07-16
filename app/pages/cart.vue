<template>
  <div class="cart-page">
    <van-nav-bar title="购物车" />
    <div v-if="!isLoggedIn" class="cart-guest">
      <van-empty description="登录后查看购物车">
        <van-button round type="primary" class="go-shop-btn" @click="navigateTo('/login?redirect=/cart')">去登录</van-button>
      </van-empty>
    </div>
    <template v-else>
      <van-empty v-if="!loading && items.length === 0" description="购物车还是空的，快去挑好物吧～">
        <van-button round type="primary" class="go-shop-btn" @click="navigateTo('/')">去逛逛</van-button>
      </van-empty>
      <div v-else class="cart-list">
        <div v-for="it in items" :key="it.id" class="cart-item">
          <van-checkbox :model-value="it.checked" @update:model-value="(v:boolean)=>toggle(it, v)" />
          <van-image width="80" height="80" radius="8" :src="it.goods_image" />
          <div class="ci-main">
            <div class="ci-name">{{ it.goods_name }}</div>
            <div class="ci-bottom">
              <span class="ci-price">¥{{ it.goods_price?.toFixed(2) }}</span>
              <van-stepper :model-value="it.nums" min="1" @change="(v:number)=>changeNums(it, v)" />
            </div>
          </div>
          <van-icon name="delete-o" class="ci-del" @click="remove(it)" />
        </div>
      </div>
      <van-submit-bar v-if="items.length" :price="checkedTotalCents" button-text="去结算" @submit="goCheckout">
        <van-checkbox :model-value="allChecked" @update:model-value="toggleAll">全选</van-checkbox>
      </van-submit-bar>
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
.cart-page { background: var(--color-bg-page); min-height: 100vh; padding-bottom: 60px; }
.cart-list { padding: 10px; }
.cart-item { display:flex; align-items:center; gap:10px; background:var(--color-bg-card); border-radius:12px; padding:10px; margin-bottom:10px; }
.ci-main { flex:1; min-width:0; }
.ci-name { font-size:14px; color:var(--color-text-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ci-bottom { display:flex; justify-content:space-between; align-items:center; margin-top:12px; }
.ci-price { color:var(--color-primary); font-weight:bold; }
.ci-del { color:var(--color-text-secondary); font-size:20px; }
.go-shop-btn { width:160px; }
</style>
