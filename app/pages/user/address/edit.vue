<template>
  <div class="lux addr-edit">
    <header class="lux-head">
      <button class="lux-back" aria-label="返回" @click="back">
        <svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
      </button>
      <span class="lux-head-title">{{ isEdit ? '编辑地址' : '新增地址' }}</span>
    </header>

    <div class="lux-scroll">
      <section class="lux-card ae-card">
        <label class="ae-field">
          <span class="ae-label">收货人</span>
          <input v-model="form.signerName" class="ae-input" placeholder="姓名">
        </label>
        <label class="ae-field">
          <span class="ae-label">手机号</span>
          <input v-model="form.signerMobile" class="ae-input" inputmode="numeric" placeholder="11 位手机号">
        </label>
        <label class="ae-field">
          <span class="ae-label">省</span>
          <input v-model="form.province" class="ae-input" placeholder="省">
        </label>
        <label class="ae-field">
          <span class="ae-label">市</span>
          <input v-model="form.city" class="ae-input" placeholder="市">
        </label>
        <label class="ae-field">
          <span class="ae-label">区</span>
          <input v-model="form.district" class="ae-input" placeholder="区/县">
        </label>
        <label class="ae-field ae-field--area">
          <span class="ae-label">详细地址</span>
          <textarea v-model="form.address" class="ae-input ae-textarea" rows="2" placeholder="街道门牌等" />
        </label>
        <span class="lux-edge" />
      </section>

      <div class="ae-actions">
        <button class="lux-btn lux-btn--block" :disabled="saving" @click="save">
          <span v-if="!saving">保存</span>
          <span v-else class="lux-spin" />
        </button>
        <button v-if="isEdit" class="lux-btn-ghost ae-del" :disabled="deleting" @click="remove">
          <span v-if="!deleting">删除地址</span>
          <span v-else class="ae-del-spin" />
        </button>
      </div>
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
/* ---- Form card ---- */
.ae-card { position: relative; padding: 4px 16px; overflow: hidden; }
.ae-field {
  display: flex; align-items: center; gap: 14px;
  padding: 15px 0; border-bottom: 1px solid var(--lux-hair-soft);
}
.ae-field:last-of-type { border-bottom: 0; }
.ae-field--area { align-items: flex-start; }
.ae-label {
  flex: 0 0 68px; font-size: 14px; font-weight: 500; color: var(--lux-text);
  letter-spacing: .5px;
}
.ae-field--area .ae-label { padding-top: 6px; }
.ae-input {
  flex: 1; min-width: 0; border: 0; background: transparent; outline: none;
  font-size: 14px; color: var(--lux-text); font-family: inherit;
  border-bottom: 1px solid transparent; transition: border-color .15s ease;
  padding: 4px 0;
}
.ae-input::placeholder { color: var(--lux-text-3); }
.ae-input:focus { border-bottom-color: var(--lux-gold); }
.ae-textarea { resize: none; line-height: 1.5; }

/* ---- Actions ---- */
.ae-actions { margin-top: 8px; display: flex; flex-direction: column; gap: 12px; }
.ae-del {
  width: 100%; height: 48px; font-size: 15px; font-weight: 600; letter-spacing: 1px;
  color: var(--lux-accent);
}
.ae-del:disabled { opacity: .6; }
.ae-del-spin {
  width: 18px; height: 18px; border: 2.5px solid rgba(224, 190, 120, .25);
  border-top-color: var(--lux-accent); border-radius: 50%; animation: ae-rot .7s linear infinite;
}
@keyframes ae-rot { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) { .ae-input, .ae-del-spin { transition: none; animation: none; } }
</style>
