<template>
  <div class="lux pts-page">
    <header class="lux-head">
      <button class="lux-back" :aria-label="$t('common.back')" @click="navigateTo('/user')">
        <svg viewBox="0 0 24 24"><path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
      </button>
      <span class="lux-head-title">{{ $t('user.myPoints') }}</span>
    </header>

    <div class="lux-scroll">
      <!-- 余额头卡 -->
      <section class="lux-card lux-card--raised pts-hero">
        <div class="pts-hero-glow" />
        <span class="pts-hero-label">{{ $t('user.pointsBalance') }}</span>
        <span class="pts-hero-num">{{ balance }}</span>
        <span class="lux-edge" />
      </section>

      <!-- 空态 -->
      <div v-if="!loading && records.length === 0" class="lux-empty">
        <div class="lux-empty-ico">✨</div>
        <div class="lux-empty-txt">{{ $t('user.pointsEmpty') }}</div>
        <button class="lux-btn pts-go" @click="navigateTo('/')">{{ $t('user.favGoShop') }}</button>
      </div>

      <!-- 流水 -->
      <section v-else class="lux-card pts-list">
        <div v-for="(r, i) in records" :key="i" class="pts-row">
          <div class="pts-row-main">
            <span class="pts-row-title">{{ reasonLabel(r.reason) }}</span>
            <span class="pts-row-sn">{{ r.orderSn }}</span>
          </div>
          <div class="pts-row-side">
            <span class="pts-row-amt">+{{ r.points }}</span>
            <span class="pts-row-time">{{ fmtTime(r.createdAt) }}</span>
          </div>
        </div>
        <button v-if="records.length < total" class="pts-more" :disabled="loading" @click="loadMore">
          {{ loading ? $t('common.loading') : $t('user.pointsMore') }}
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
import { showToast } from 'vant'
const { t } = useI18n()
const { fetchRecords } = usePoints()

const balance = ref(0)
const total = ref(0)
const records = ref<PointRecord[]>([])
const page = ref(1)
const pageSize = 20
const loading = ref(false)

function reasonLabel(reason: string): string {
  if (reason === 'order_finished') return t('user.pointsFromOrder')
  return reason || t('user.pointsFromOrder')
}
function fmtTime(iso: string): string {
  if (!iso) return ''
  // RFC3339 → YYYY-MM-DD HH:mm
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16).replace('T', ' ')
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

async function load(reset = false) {
  if (loading.value) return
  loading.value = true
  try {
    const res = await fetchRecords(page.value, pageSize)
    balance.value = res.balance
    total.value = res.total
    records.value = reset ? res.records : [...records.value, ...res.records]
  } catch (e: any) {
    showToast(e?.data?.msg || e?.message || t('user.favActionFailed'))
  } finally {
    loading.value = false
  }
}
function loadMore() { page.value += 1; load() }
onMounted(() => load(true))
</script>

<style scoped>
.pts-page { padding-bottom: 0; }
.pts-go { min-width: 148px; height: 46px; margin-top: 20px; }

/* 余额头卡 */
.pts-hero {
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 26px 20px 24px; margin-bottom: 14px;
}
.pts-hero-glow {
  position: absolute; top: -60px; right: -20px; pointer-events: none;
  width: 200px; height: 180px;
  background: radial-gradient(60% 60% at 60% 40%, rgba(230, 205, 143, .34), transparent 70%);
  filter: blur(4px);
}
.pts-hero-label { font-size: 13px; color: var(--lux-text-2); letter-spacing: .5px; }
.pts-hero-num {
  font-size: 40px; font-weight: 800; letter-spacing: .5px;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, var(--lux-gold), var(--lux-accent-2) 55%, var(--lux-accent));
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}

/* 流水列表 */
.pts-list { padding: 4px 4px; }
.pts-row {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 12px; border-bottom: 1px solid var(--lux-hair-soft);
}
.pts-row:last-of-type { border-bottom: 0; }
.pts-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.pts-row-title { font-size: 14.5px; color: var(--lux-text); font-weight: 500; }
.pts-row-sn { font-size: 11.5px; color: var(--lux-text-3); font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pts-row-side { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.pts-row-amt { font-size: 17px; font-weight: 800; color: var(--lux-price); font-variant-numeric: tabular-nums; }
.pts-row-time { font-size: 11px; color: var(--lux-text-3); }
.pts-more {
  width: 100%; height: 42px; margin-top: 4px; border: 0; background: transparent; cursor: pointer;
  font-size: 13px; color: var(--lux-text-2);
}
.pts-more:disabled { opacity: .6; }
</style>
