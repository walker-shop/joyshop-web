<template>
  <div class="lux cp-page">
    <header class="lux-head">
      <button class="lux-back" :aria-label="$t('common.back')" @click="navigateTo('/user')">
        <svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
      </button>
      <span class="lux-head-title">{{ $t('user.couponCenter') }}</span>
    </header>

    <div class="cp-tabs">
      <button :class="['cp-tab', { on: tab === 'avail' }]" @click="tab = 'avail'">{{ $t('user.couponAvailable') }}</button>
      <button :class="['cp-tab', { on: tab === 'mine' }]" @click="tab = 'mine'">{{ $t('user.couponMine') }}</button>
    </div>

    <div class="lux-scroll">
      <!-- 可领 -->
      <section v-if="tab === 'avail'">
        <div v-if="!loading && templates.length === 0" class="lux-empty">
          <div class="lux-empty-ico">🎟️</div>
          <div class="lux-empty-txt">{{ $t('user.couponEmpty') }}</div>
        </div>
        <div v-for="c in templates" :key="c.id" class="cp-card">
          <div class="cp-card-left">
            <div class="cp-amt">{{ amountLabel(c) }}</div>
            <div class="cp-cond">{{ thresholdLabel(c) }}</div>
          </div>
          <div class="cp-card-right">
            <div class="cp-name">{{ c.name }}</div>
            <div class="cp-valid">{{ fmtDate(c.validTo) }}</div>
            <button class="cp-btn" :disabled="c.claimed || c.soldOut" @click="onClaim(c)">
              {{ c.soldOut ? $t('user.couponSoldOut') : c.claimed ? $t('user.couponClaimed') : $t('user.couponClaim') }}
            </button>
          </div>
        </div>
      </section>

      <!-- 我的券 -->
      <section v-else>
        <div v-if="!loading && mine.length === 0" class="lux-empty">
          <div class="lux-empty-ico">🎟️</div>
          <div class="lux-empty-txt">{{ $t('user.couponEmpty') }}</div>
        </div>
        <div v-for="c in mine" :key="c.id" :class="['cp-card', { used: c.status === 2 }]">
          <div class="cp-card-left">
            <div class="cp-amt">{{ amountLabel(c) }}</div>
            <div class="cp-cond">{{ thresholdLabel(c) }}</div>
          </div>
          <div class="cp-card-right">
            <div class="cp-name">{{ c.name }}</div>
            <div class="cp-valid">{{ fmtDate(c.validTo) }}</div>
            <span class="cp-status">{{ c.status === 2 ? $t('user.couponUsed') : '' }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
import type { CouponTemplate, MyCoupon } from '~/composables/useCoupons'
definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const { listTemplates, claim, listMine } = useCoupons()

const tab = ref<'avail' | 'mine'>('avail')
const templates = ref<CouponTemplate[]>([])
const mine = ref<MyCoupon[]>([])
const loading = ref(false)

function amountLabel(c: { type: number; discountCents: number; discountPercent: number }) {
  if (c.type === 1) return t('user.couponFull', { n: (c.discountCents / 100).toFixed(0) })
  return t('user.couponDiscount', { n: c.discountPercent })
}
function thresholdLabel(c: { thresholdCents: number }) {
  return c.thresholdCents > 0 ? t('user.couponThreshold', { n: (c.thresholdCents / 100).toFixed(0) }) : t('user.couponNoThreshold')
}
function fmtDate(iso: string) { return iso ? iso.slice(0, 10) : '' }

async function loadAvail() {
  loading.value = true
  try { templates.value = await listTemplates() }
  catch (e: any) { showToast(e?.data?.msg || e?.message) }
  finally { loading.value = false }
}
async function loadMine() {
  loading.value = true
  try { mine.value = await listMine(0) }
  catch (e: any) { showToast(e?.data?.msg || e?.message) }
  finally { loading.value = false }
}
async function onClaim(c: CouponTemplate) {
  try {
    await claim(c.id)
    showToast(t('user.couponClaimSuccess'))
    await loadAvail()
  } catch (e: any) {
    showToast(e?.data?.msg || t('user.couponClaimFailed'))
  }
}
watch(tab, (v) => { v === 'avail' ? loadAvail() : loadMine() })
onMounted(loadAvail)
</script>

<style scoped>
.cp-tabs { display: flex; gap: 8px; padding: 12px 14px 0; }
.cp-tab { flex: 1; height: 40px; border: 1px solid var(--lux-hair); border-radius: 999px; background: var(--lux-surface); color: var(--lux-text-2); font-size: 14px; }
.cp-tab.on { color: #1a0d05; font-weight: 700; background: linear-gradient(135deg, var(--lux-gold), var(--lux-accent)); border-color: transparent; }
.cp-card { display: flex; gap: 0; margin: 12px 14px; border: 1px solid var(--lux-hair); border-radius: 16px; overflow: hidden; background: var(--lux-surface); }
.cp-card.used { opacity: .5; }
.cp-card-left { flex: 0 0 116px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 18px 8px; background: linear-gradient(140deg, var(--lux-surface-2), var(--lux-surface)); border-right: 1px dashed var(--lux-hair); }
.cp-amt { font-size: 20px; font-weight: 800; color: var(--lux-price); text-align: center; }
.cp-cond { font-size: 11px; color: var(--lux-text-3); }
.cp-card-right { flex: 1; min-width: 0; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; position: relative; }
.cp-name { font-size: 15px; font-weight: 600; color: var(--lux-text); }
.cp-valid { font-size: 12px; color: var(--lux-text-3); }
.cp-btn { align-self: flex-end; min-width: 72px; height: 34px; border: 0; border-radius: 999px; color: #1a0d05; font-weight: 700; background: linear-gradient(135deg, var(--lux-gold), var(--lux-accent)); }
.cp-btn:disabled { opacity: .5; background: var(--lux-chip-bg); color: var(--lux-text-3); }
.cp-status { position: absolute; right: 16px; top: 14px; font-size: 12px; color: var(--lux-text-3); }

@media (min-width: 1024px) {
  .cp-tabs {
    width: min(calc(100% - 48px), 1200px);
    margin-inline: auto;
    padding: 20px 0 0;
  }
  .cp-tab { flex: 0 0 180px; min-height: 44px; }
  .lux-scroll { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-content: start; gap: var(--space-md); }
  .lux-scroll > * { margin: 0; }
  .lux-scroll > .lux-empty { grid-column: 1 / -1; }
  .cp-card { min-height: 148px; border-radius: var(--radius-lg); }
  .cp-card-left { flex-basis: 142px; }
  .cp-card:hover { border-color: var(--color-border-strong); box-shadow: var(--shadow-soft); }
}
</style>
