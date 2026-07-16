<template>
  <div class="addr-page">
    <van-nav-bar title="收货地址" left-arrow @click-left="navigateTo('/user')" />
    <van-empty v-if="!loading && list.length===0" description="还没有收货地址" />
    <van-address-list
      v-else
      :list="uiList"
      @click-item="onPick"
      @edit="onEdit"
    />
    <div class="addr-add">
      <van-button type="primary" block round @click="navigateTo('/user/address/edit')">新增地址</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
import { showToast } from 'vant'
interface Addr { id:number; province:string; city:string; district:string; address:string; signerName:string; signerMobile:string }
const { apiFetch } = useApi()
const route = useRoute()
const list = ref<Addr[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await apiFetch<{ total:number; data:Addr[]|null }>('/v1/userop/address')
    list.value = res.data || []
  } catch (e:any) { showToast(e?.message || '加载地址失败') }
  finally { loading.value = false }
}
onMounted(load)

const uiList = computed(() => list.value.map(a => ({
  id: a.id,
  name: a.signerName,
  tel: a.signerMobile,
  address: `${a.province}${a.city}${a.district}${a.address}`,
})))

function onPick(item: any) {
  // 从结算页进入时选地址回填
  if (route.query.from === 'checkout') {
    if (import.meta.client) localStorage.setItem('js_last_addr', String(item.id))
    navigateTo(`/checkout?addr=${item.id}`)
  }
}
function onEdit(item: any) { navigateTo(`/user/address/edit?id=${item.id}`) }
</script>

<style scoped>
.addr-page { min-height:100vh; background:var(--color-bg-page); }
.addr-add { padding:12px; }
</style>
