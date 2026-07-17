<template>
  <div class="search-page">
    <div class="ambient" aria-hidden="true" />

    <!-- 搜索头 -->
    <header class="topbar">
      <button class="back" aria-label="返回" @click="goBack">
        <svg viewBox="0 0 24 24"><path d="M15.5 19 8.5 12l7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="box">
        <svg viewBox="0 0 24 24" class="s-ic"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>
        <input
          ref="inputEl"
          v-model="kw"
          class="input"
          type="search"
          enterkeyhint="search"
          placeholder="搜索心仪好物"
          @keyup.enter="submit(kw)"
        >
        <button v-if="kw" class="clear" aria-label="清空" @click="clearInput">
          <svg viewBox="0 0 24 24"><path d="M12 10.6 7.4 6 6 7.4l4.6 4.6L6 16.6 7.4 18l4.6-4.6 4.6 4.6 1.4-1.4-4.6-4.6L18 7.4 16.6 6z"/></svg>
        </button>
      </div>
      <button class="go" @click="submit(kw)">搜索</button>
    </header>

    <div class="scroll">
      <!-- 初始态：历史 + 热门 -->
      <template v-if="!submitted">
        <section v-if="history.length" class="block">
          <div class="blk-hd">
            <h3>搜索历史</h3>
            <button class="del" aria-label="清除历史" @click="clearHistory">
              <svg viewBox="0 0 24 24"><path d="M6 7h12M9 7V5h6v2m-7 0 1 12h6l1-12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <div class="chips">
            <button v-for="h in history" :key="h" class="chip" @click="submit(h)">{{ h }}</button>
          </div>
        </section>

        <section class="block">
          <div class="blk-hd"><h3><span class="spark">✦</span> 热门搜索</h3></div>
          <div class="chips">
            <button v-for="(h, i) in hotTerms" :key="h" class="chip hot" :class="{ top: i < 3 }" @click="submit(h)">{{ h }}</button>
          </div>
        </section>
      </template>

      <!-- 结果态 -->
      <template v-else>
        <div class="res-hd">
          <span>“<em>{{ activeKw }}</em>”</span>
          <span v-if="!loading" class="cnt">{{ total }} 件</span>
        </div>

        <div v-if="loading" class="grid">
          <div v-for="n in 6" :key="n" class="skel" />
        </div>

        <div v-else-if="!results.length" class="empty">
          <div class="empty-mark">Z</div>
          <p>没找到「{{ activeKw }}」相关好物</p>
          <span class="tip">换个关键词试试</span>
        </div>

        <div v-else class="grid">
          <button
            v-for="(item, i) in results"
            :key="item.id"
            class="card"
            :style="{ animationDelay: `${Math.min(i, 8) * 45}ms` }"
            @click="navigateTo(`/goods/${item.id}`)"
          >
            <div class="card-thumb">
              <van-image class="fill" :src="item.goodsFrontImage" fit="cover">
                <template #loading><div class="mono dim">{{ monogram(item.name) }}</div></template>
                <template #error><div class="mono">{{ monogram(item.name) }}</div></template>
              </van-image>
              <div v-if="item.marketPrice > item.shopPrice" class="card-off">
                {{ Math.round((1 - item.shopPrice / item.marketPrice) * 100) }}% off
              </div>
            </div>
            <div class="card-body">
              <div class="card-title" v-html="highlight(item.name)" />
              <div class="card-foot">
                <div class="price">
                  <span class="cur">¥</span><span class="int">{{ priceParts(item.shopPrice).int }}</span><span class="dec">.{{ priceParts(item.shopPrice).dec }}</span>
                </div>
                <span v-if="item.marketPrice > item.shopPrice" class="market">¥{{ item.marketPrice }}</span>
                <span class="add" @click.stop="quickAdd($event, item)">
                  <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>
                </span>
              </div>
            </div>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'

const config = useRuntimeConfig()
const { tenantId } = useTenant()
const route = useRoute()
const router = useRouter()

const HISTORY_KEY = 'zshop_search_history'
const HOT = ['手机', '连衣裙', 'MacBook', '口红', '运动鞋', '蓝牙耳机', '洗面奶', '零食', '双肩包', '空调']

const kw = ref('')
const activeKw = ref('')
const submitted = ref(false)
const loading = ref(false)
const results = ref<any[]>([])
const total = ref(0)
const history = ref<string[]>([])
const inputEl = ref<HTMLInputElement | null>(null)
const hotTerms = HOT

function monogram(name: string) { const s = (name || '').trim(); return s ? s[0] : 'Z' }
function priceParts(n: number) {
  const [int = '0', dec = '00'] = Number(n || 0).toFixed(2).split('.')
  return { int, dec }
}
function escapeHtml(s: string) {
  return (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string))
}
// 命中关键词高亮（先转义再插标记，避免 XSS）
function highlight(name: string) {
  const safe = escapeHtml(name)
  const q = activeKw.value.trim()
  if (!q) return safe
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return safe.replace(re, '<mark>$1</mark>')
}

function loadHistory() {
  if (!import.meta.client) return
  try { history.value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { history.value = [] }
}
function pushHistory(term: string) {
  const t = term.trim()
  if (!t) return
  history.value = [t, ...history.value.filter(h => h !== t)].slice(0, 10)
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value)) } catch {}
}
function clearHistory() {
  history.value = []
  try { localStorage.removeItem(HISTORY_KEY) } catch {}
}
function clearInput() {
  kw.value = ''
  submitted.value = false
  inputEl.value?.focus()
}
function goBack() {
  if (window.history.length > 1) router.back()
  else navigateTo('/')
}

async function submit(term: string) {
  const t = (term || '').trim()
  if (!t) { showToast('请输入关键词'); return }
  kw.value = t
  activeKw.value = t
  submitted.value = true
  loading.value = true
  results.value = []
  pushHistory(t)
  inputEl.value?.blur()
  try {
    const res = await $fetch<{ code: number; data: { data: any[]; total: number } }>(
      `${config.public.apiBase}/v1/goods`,
      { params: { page: 1, pageSize: 20, keywords: t, tenant_id: tenantId } },
    )
    if (res.code === 200 && res.data) {
      results.value = res.data.data || []
      total.value = res.data.total || results.value.length
    }
  } catch (e) { console.warn('search:', e) } finally { loading.value = false }
}

// 快速加购 + 飞入 tabbar 购物车（与首页/分类一致）
const { apiFetch } = useApi()
const { isLoggedIn } = useAuth()
const { refresh: refreshCart } = useCartCount()
async function quickAdd(e: MouseEvent, item: any) {
  if (!isLoggedIn.value) { showToast('请先登录'); navigateTo('/login?redirect=/search'); return }
  const btn = (e.currentTarget as HTMLElement)?.getBoundingClientRect()
  try {
    await apiFetch('/v1/cart', { method: 'POST', body: { goodsId: Number(item.id), nums: 1, checked: true } })
    await refreshCart()
    if (btn) flyToCart(btn.left + btn.width / 2, btn.top + btn.height / 2, item.goodsFrontImage)
    showToast('已加入购物车')
  } catch (err: any) { showToast(err?.data?.msg || err?.message || '加入购物车失败') }
}
function flyToCart(sx: number, sy: number, img?: string) {
  if (!import.meta.client) return
  const cartTab = document.querySelectorAll('.van-tabbar .van-tabbar-item')[2] as HTMLElement
  const cart = cartTab?.getBoundingClientRect()
  if (!cart) return
  const dx = (cart.left + cart.width / 2) - sx
  const dy = (cart.top + cart.height / 2 - 8) - sy
  const ball = document.createElement('div')
  ball.style.cssText = `position:fixed;left:${sx}px;top:${sy}px;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;z-index:9999;pointer-events:none;overflow:hidden;box-shadow:0 5px 16px rgba(169,130,47,.6);${img ? `background:#000 center/cover url('${img}')` : 'background:linear-gradient(135deg,#e6cd8f,#a9822f)'};border:2px solid #f0dca6;`
  document.body.appendChild(ball)
  const anim = ball.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0 },
    { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 100}px) scale(.9)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${dx}px,${dy}px) scale(.2)`, opacity: .3, offset: 1 },
  ], { duration: 720, easing: 'cubic-bezier(.45,-0.2,.7,1)' })
  anim.onfinish = () => {
    ball.remove()
    cartTab?.classList.add('cart-bumped')
    setTimeout(() => cartTab?.classList.remove('cart-bumped'), 450)
  }
}

onMounted(() => {
  loadHistory()
  const q = (route.query.q as string || '').trim()
  if (q) submit(q)
  else nextTick(() => inputEl.value?.focus())
})
</script>

<style scoped>
.search-page {
  position: relative; min-height: 100vh; background: var(--color-bg-page);
  display: flex; flex-direction: column;
}
.ambient {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background: radial-gradient(80% 30% at 50% -4%, color-mix(in srgb, var(--color-primary) 22%, transparent), transparent 60%);
}
.search-page > :not(.ambient) { position: relative; z-index: 1; }

/* 搜索头 */
.topbar {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; gap: 8px; padding: 9px 12px 10px;
  background: color-mix(in srgb, var(--color-bg-page) 74%, transparent);
  backdrop-filter: saturate(150%) blur(16px); -webkit-backdrop-filter: saturate(150%) blur(16px);
}
.back {
  flex-shrink: 0; width: 34px; height: 34px; border: 0; border-radius: 50%; cursor: pointer;
  display: grid; place-items: center; background: transparent; color: var(--color-text-primary);
}
.back svg { width: 22px; height: 22px; }
.box {
  flex: 1; height: 38px; display: flex; align-items: center; gap: 7px; padding: 0 10px 0 12px;
  border-radius: 20px; background: var(--color-bg-card);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 40%, transparent);
}
.s-ic { width: 16px; height: 16px; fill: var(--color-primary); flex-shrink: 0; }
.input {
  flex: 1; min-width: 0; border: 0; background: none; outline: none;
  font-size: 14px; color: var(--color-text-primary);
}
.input::placeholder { color: var(--color-text-tertiary); }
.input::-webkit-search-cancel-button { display: none; }
.clear {
  flex-shrink: 0; width: 20px; height: 20px; border: 0; border-radius: 50%; cursor: pointer;
  display: grid; place-items: center; background: color-mix(in srgb, var(--color-text-tertiary) 30%, transparent);
}
.clear svg { width: 13px; height: 13px; fill: var(--color-bg-card); }
.go {
  flex-shrink: 0; border: 0; cursor: pointer; height: 34px; padding: 0 14px; border-radius: 18px;
  font-size: 14px; font-weight: 700; color: #2a1f0a;
  background: linear-gradient(135deg, #e6cd8f, #c9a24c 52%, #a9822f);
  box-shadow: 0 3px 10px color-mix(in srgb, var(--color-primary) 34%, transparent);
  transition: transform .12s ease;
}
.go:active { transform: scale(.94); }

.scroll { flex: 1; padding: 8px 14px 70px; }

/* 历史 / 热门 */
.block { margin-top: 14px; }
.blk-hd { display: flex; align-items: center; margin-bottom: 12px; }
.blk-hd h3 {
  margin: 0; font-size: 15px; font-weight: 900; color: var(--color-text-primary);
  display: flex; align-items: center; gap: 5px;
}
.blk-hd h3 .spark { color: var(--color-primary); }
.del {
  margin-left: auto; width: 30px; height: 30px; border: 0; cursor: pointer; border-radius: 50%;
  display: grid; place-items: center; background: transparent; color: var(--color-text-tertiary);
}
.del svg { width: 18px; height: 18px; }
.chips { display: flex; flex-wrap: wrap; gap: 10px; }
.chip {
  border: 1px solid var(--color-border); cursor: pointer; max-width: 100%;
  background: var(--color-bg-card); color: var(--color-text-secondary);
  font-size: 13px; padding: 8px 15px; border-radius: 999px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  transition: transform .12s ease, border-color .12s ease;
}
.chip:active { transform: scale(.95); }
.chip.hot.top {
  color: var(--color-primary-dark); font-weight: 700;
  background: var(--color-primary-soft);
  border-color: color-mix(in srgb, var(--color-primary) 34%, transparent);
}

/* 结果头 */
.res-hd { display: flex; align-items: baseline; gap: 8px; padding: 14px 2px 12px; }
.res-hd span { font-size: 14px; color: var(--color-text-secondary); }
.res-hd em { font-style: normal; font-weight: 800; color: var(--color-primary); }
.res-hd .cnt { margin-left: auto; font-size: 12px; color: var(--color-text-tertiary); }

/* 结果网格（复用首页卡片语言） */
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.card {
  background: var(--color-bg-card); border: 1px solid var(--color-border);
  border-radius: 16px; overflow: hidden; padding: 0; cursor: pointer; text-align: left;
  box-shadow: 0 2px 10px rgba(0,0,0,.05);
  animation: rise .42s cubic-bezier(.22,.61,.36,1) both;
  transition: transform .16s ease, box-shadow .16s ease;
}
.card:active { transform: translateY(1px) scale(.985); box-shadow: 0 1px 6px rgba(0,0,0,.05); }
@keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.card-thumb { position: relative; width: 100%; aspect-ratio: 1 / 1; background: var(--color-search-bg); }
.card-off {
  position: absolute; top: 8px; left: 8px; z-index: 2; font-size: 10px; font-weight: 800; color: #2a1f0a;
  background: linear-gradient(135deg, #e6cd8f, #c9a24c); border-radius: 7px; padding: 3px 6px;
}
.fill { width: 100%; height: 100%; display: block; }
.mono {
  width: 100%; height: 100%; display: grid; place-items: center;
  font-size: 40px; font-weight: 900; font-style: italic;
  color: color-mix(in srgb, var(--color-primary) 55%, transparent);
  background: radial-gradient(120% 120% at 30% 20%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 60%), var(--color-search-bg);
}
.mono.dim { opacity: .5; }
.card-body { padding: 9px 11px 11px; }
.card-title {
  font-size: 13px; line-height: 1.42; color: var(--color-text-primary);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 37px;
}
.card-title :deep(mark) { background: none; color: var(--color-primary); font-weight: 800; }
.card-foot { display: flex; align-items: baseline; gap: 6px; margin-top: 5px; }
.price { color: var(--color-price); font-weight: 900; font-variant-numeric: tabular-nums; }
.cur { font-size: 12px; }
.int { font-size: 21px; }
.dec { font-size: 12px; }
.market { font-size: 11px; color: var(--color-text-tertiary); text-decoration: line-through; }
.add {
  margin-left: auto; align-self: flex-end;
  width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
  background: linear-gradient(135deg, #e6cd8f, #c9a24c 52%, #a9822f);
  box-shadow: 0 3px 9px color-mix(in srgb, var(--color-primary) 42%, transparent);
  transition: transform .14s ease;
}
.add:active { transform: scale(.86); }
.add svg { width: 15px; height: 15px; fill: #2a1f0a; }

/* 骨架 */
.skel {
  height: 232px; border-radius: 16px;
  background: linear-gradient(100deg, var(--color-bg-card) 30%, var(--color-search-bg) 50%, var(--color-bg-card) 70%);
  background-size: 200% 100%; animation: shine 1.3s ease-in-out infinite;
}
@keyframes shine { from { background-position: 200% 0; } to { background-position: -200% 0; } }

/* 空态 */
.empty { padding: 70px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.empty p { margin: 0; color: var(--color-text-secondary); font-size: 14px; }
.empty .tip { color: var(--color-text-tertiary); font-size: 12px; }
.empty-mark {
  width: 76px; height: 76px; border-radius: 22px; display: grid; place-items: center;
  font-size: 40px; font-weight: 900; font-style: italic; color: #2a1f0a;
  background: linear-gradient(135deg, #e6cd8f, #c9a24c 52%, #a9822f);
  box-shadow: 0 8px 22px color-mix(in srgb, var(--color-primary) 34%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .card, .skel { animation: none; }
}
</style>
