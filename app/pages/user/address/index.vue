<template>
  <div class="lux addr-page">
    <header class="lux-head">
      <button class="lux-back" aria-label="返回" @click="navigateTo('/user')">
        <svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
      </button>
      <span class="lux-head-title">收货地址</span>
    </header>

    <div class="lux-scroll">
      <!-- 空态 -->
      <div v-if="!loading && uiList.length === 0" class="lux-empty">
        <div class="lux-empty-ico">📍</div>
        <div class="lux-empty-txt">还没有收货地址</div>
      </div>

      <!-- 地址卡片列表 -->
      <button
        v-for="item in uiList"
        :key="item.id"
        class="addr-card"
        @click="onPick(item)"
      >
        <div class="addr-pin">
          <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
        </div>
        <div class="addr-body">
          <div class="addr-name">
            {{ item.name }}<span class="addr-tel">{{ item.tel }}</span>
          </div>
          <div class="addr-detail">{{ item.address }}</div>
        </div>
        <span
          class="addr-edit"
          role="button"
          aria-label="编辑"
          @click.stop="onEdit(item)"
        >
          <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
        </span>
        <span class="lux-edge" />
      </button>
    </div>

    <!-- 新增地址 -->
    <div class="lux-bar">
      <button class="lux-btn lux-btn--block" @click="navigateTo('/user/address/edit')">
        新增地址
      </button>
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
.addr-page { padding-bottom: 0; }

/* ---- Address card ---- */
.addr-card {
  position: relative; width: 100%; text-align: left;
  display: flex; align-items: center; gap: 14px;
  padding: 18px 16px; margin-bottom: 14px;
  background: linear-gradient(160deg, var(--lux-surface-2), var(--lux-surface));
  border: 1px solid var(--lux-hair); border-radius: 18px; overflow: hidden;
  cursor: pointer;
  transition: transform .12s ease, border-color .12s ease;
}
.addr-card:active { transform: scale(.995); }
.addr-pin {
  flex: 0 0 42px; width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center;
  background: linear-gradient(140deg, var(--lux-accent-2), var(--lux-accent));
  box-shadow: 0 6px 16px rgba(224, 190, 120, .45);
}
.addr-pin svg { width: 23px; height: 23px; fill: #fff; }
.addr-body { flex: 1; min-width: 0; }
.addr-name { font-size: 16px; font-weight: 600; color: var(--lux-text); display: flex; align-items: baseline; gap: 10px; }
.addr-tel { font-size: 13px; font-weight: 400; color: var(--lux-text-2); letter-spacing: 1px; font-variant-numeric: tabular-nums; }
.addr-detail { font-size: 13px; color: var(--lux-text-2); margin-top: 5px; line-height: 1.5; }
.addr-edit {
  flex: 0 0 36px; width: 36px; height: 36px; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--lux-surface); border: 1px solid var(--lux-hair);
  transition: border-color .12s ease, background .12s ease;
}
.addr-edit:active { background: var(--lux-surface-2); }
.addr-edit svg { width: 17px; height: 17px; fill: var(--lux-gold); }
</style>
