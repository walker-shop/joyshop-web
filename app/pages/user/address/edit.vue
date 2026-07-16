<template>
  <div class="addr-edit">
    <van-nav-bar :title="isEdit ? '编辑地址' : '新增地址'" left-arrow @click-left="back" />
    <van-cell-group inset>
      <van-field v-model="form.signerName" label="收货人" placeholder="姓名" />
      <van-field v-model="form.signerMobile" label="手机号" placeholder="11 位手机号" />
      <van-field v-model="form.province" label="省" placeholder="省" />
      <van-field v-model="form.city" label="市" placeholder="市" />
      <van-field v-model="form.district" label="区" placeholder="区/县" />
      <van-field v-model="form.address" label="详细地址" placeholder="街道门牌等" type="textarea" rows="2" />
    </van-cell-group>
    <div class="addr-actions">
      <van-button type="primary" block round :loading="saving" @click="save">保存</van-button>
      <van-button v-if="isEdit" block round class="del-btn" :loading="deleting" @click="remove">删除</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
import { showToast } from 'vant'
const { apiFetch } = useApi()
const route = useRoute()
const id = computed(() => route.query.id ? Number(route.query.id) : null)
const isEdit = computed(() => id.value !== null)
const form = ref({ signerName:'', signerMobile:'', province:'', city:'', district:'', address:'' })
const saving = ref(false)
const deleting = ref(false)

async function load() {
  if (!isEdit.value) return
  const res = await apiFetch<{ total:number; data:any[]|null }>('/v1/userop/address')
  const a = (res.data || []).find(x => x.id === id.value)
  if (a) form.value = { signerName:a.signerName, signerMobile:a.signerMobile, province:a.province, city:a.city, district:a.district, address:a.address }
}
onMounted(load)

function valid(): boolean {
  const f = form.value
  if (!f.signerName || !f.signerMobile || !f.province || !f.city || !f.district || !f.address) { showToast('请填完整'); return false }
  if (!/^\d{11}$/.test(f.signerMobile)) { showToast('手机号需 11 位'); return false }
  return true
}
async function save() {
  if (!valid()) return
  saving.value = true
  try {
    if (isEdit.value) await apiFetch(`/v1/userop/address/${id.value}`, { method:'PUT', body: form.value })
    else await apiFetch('/v1/userop/address', { method:'POST', body: form.value })
    showToast('已保存'); back()
  } catch (e:any) { showToast(e?.message || '保存失败') }
  finally { saving.value = false }
}
async function remove() {
  deleting.value = true
  try { await apiFetch(`/v1/userop/address/${id.value}`, { method:'DELETE' }); showToast('已删除'); back() }
  catch (e:any) { showToast(e?.message || '删除失败') }
  finally { deleting.value = false }
}
function back() { navigateTo(`/user/address${route.query.from ? '?from=' + route.query.from : ''}`) }
</script>

<style scoped>
.addr-edit { min-height:100vh; background:var(--color-bg-page); }
.addr-actions { padding:16px 12px; display:flex; flex-direction:column; gap:10px; }
.del-btn { color: var(--color-danger, #ee0a24); }
</style>
