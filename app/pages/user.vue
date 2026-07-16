<template>
  <div class="lux user-page">
    <!-- Hero header -->
    <header class="uz-hero">
      <div class="uz-hero-glow" />
      <div class="uz-id" :class="{ 'is-guest': !isLoggedIn }" @click="!isLoggedIn && handleLogin()">
        <div class="uz-avatar">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.3 0-8 1.7-8 5v1h16v-1c0-3.3-4.7-5-8-5z" />
          </svg>
          <span class="uz-avatar-ring" />
        </div>
        <div class="uz-id-body">
          <template v-if="isLoggedIn">
            <span class="uz-name">{{ user?.nickname || user?.username }}</span>
            <span class="uz-sub">欢迎回来 · 尊享会员</span>
          </template>
          <template v-else>
            <span class="uz-name">登录 / 注册</span>
            <span class="uz-sub">登录后享受更多专属权益</span>
          </template>
        </div>
        <svg v-if="!isLoggedIn" class="uz-id-arr" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>
      </div>
    </header>

    <div class="uz-scroll">
      <!-- 订单状态快捷行 -->
      <section class="lux-card lux-card--raised uz-orders">
        <div class="uz-orders-hd">
          <span class="uz-orders-title">我的订单</span>
          <button class="uz-orders-all" @click="goOrders()">
            全部订单
            <svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>
          </button>
        </div>
        <div class="uz-orders-row">
          <button v-for="o in orderTabs" :key="o.status" class="uz-order-item" @click="goOrders(o.status)">
            <span class="uz-order-ico">
              <van-icon :name="o.icon" size="24" />
            </span>
            <span class="uz-order-label">{{ o.label }}</span>
          </button>
        </div>
        <span class="lux-edge" />
      </section>

      <!-- 菜单组 -->
      <section class="lux-card uz-menu">
        <button class="uz-row" @click="goAddress">
          <span class="uz-row-ico"><van-icon name="location-o" size="20" /></span>
          <span class="uz-row-label">收货地址</span>
          <svg class="uz-row-arr" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>
        </button>
        <button class="uz-row" @click="onToast('收藏功能开发中')">
          <span class="uz-row-ico"><van-icon name="like-o" size="20" /></span>
          <span class="uz-row-label">我的收藏</span>
          <svg class="uz-row-arr" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>
        </button>
        <button class="uz-row" @click="onToast('客服功能开发中')">
          <span class="uz-row-ico"><van-icon name="service-o" size="20" /></span>
          <span class="uz-row-label">联系客服</span>
          <svg class="uz-row-arr" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>
        </button>
      </section>

      <!-- 主题切换 -->
      <section class="lux-card uz-theme">
        <div class="uz-theme-hd">
          <span class="uz-row-ico"><van-icon name="brush-o" size="20" /></span>
          <span class="uz-row-label">深色模式</span>
        </div>
        <div class="uz-switch">
          <button
            v-for="opt in themeOptions"
            :key="opt.value"
            class="uz-switch-opt"
            :class="{ active: themeMode === opt.value }"
            @click="setTheme(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </section>

      <!-- 退出登录 -->
      <button v-if="isLoggedIn" class="lux-btn-ghost uz-logout" @click="onLogout">退出登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'

const { themeMode, setTheme } = useTheme()
const { isLoggedIn, user, logout } = useAuth()

const themeOptions = [
  { label: '跟随系统', value: 'system' as const },
  { label: '浅色', value: 'light' as const },
  { label: '深色', value: 'dark' as const },
]

const orderTabs = [
  { status: 'PAYING', label: '待付款', icon: 'gold-coin-o' },
  { status: 'TRADE_SUCCESS', label: '已支付', icon: 'send-gift-o' },
  { status: 'TRADE_CLOSED', label: '已关闭', icon: 'close' },
  { status: '', label: '全部', icon: 'orders-o' },
]

function onToast(msg: string) { showToast(msg) }
function ensureLogin(): boolean {
  if (!isLoggedIn.value) { navigateTo('/login?redirect=/user'); return false }
  return true
}
function handleLogin() { if (!isLoggedIn.value) navigateTo('/login?redirect=/user') }
function goOrders(status?: string) {
  if (!ensureLogin()) return
  navigateTo(status ? `/order?status=${status}` : '/order')
}
function goAddress() { if (ensureLogin()) navigateTo('/user/address') }
function onLogout() { logout(); showToast('已退出登录') }
</script>

<style scoped>
/* page keeps default layout's bottom tabbar (~50px) — reserve space */
.user-page { min-height: 100vh; }

/* ---- Hero ---- */
.uz-hero {
  position: relative;
  padding: 40px 18px 26px;
  overflow: hidden;
}
.uz-hero-glow {
  position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
  width: 320px; height: 220px; pointer-events: none;
  background: radial-gradient(60% 60% at 50% 40%, rgba(224, 190, 120, .28), transparent 70%);
  filter: blur(6px);
}
.uz-id {
  position: relative;
  display: flex; align-items: center; gap: 15px;
  width: 100%; text-align: left;
}
.uz-id.is-guest { cursor: pointer; }
.uz-avatar {
  position: relative; flex: 0 0 62px; width: 62px; height: 62px; border-radius: 50%;
  display: grid; place-items: center;
  background: linear-gradient(140deg, var(--lux-surface-2), var(--lux-surface));
  border: 1px solid var(--lux-hair);
  box-shadow: 0 8px 24px rgba(0, 0, 0, .4);
}
.uz-avatar svg { width: 34px; height: 34px; fill: var(--lux-gold); }
.uz-avatar-ring {
  position: absolute; inset: -3px; border-radius: 50%; pointer-events: none;
  background: linear-gradient(135deg, var(--lux-gold), var(--lux-accent) 60%, transparent);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
  opacity: .85;
}
.uz-id-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.uz-name { font-size: 20px; font-weight: 700; color: var(--lux-text); letter-spacing: .5px; }
.uz-sub { font-size: 12.5px; color: var(--lux-text-2); letter-spacing: .3px; }
.uz-id-arr { width: 20px; height: 20px; fill: none; stroke: var(--lux-text-3); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }

/* ---- Scroll body ---- */
.uz-scroll { flex: 1; padding: 4px 14px calc(66px + env(safe-area-inset-bottom)); }

/* ---- Orders ---- */
.uz-orders { position: relative; padding: 16px 8px 18px; overflow: hidden; }
.uz-orders-hd { display: flex; align-items: center; padding: 0 10px 14px; }
.uz-orders-title { font-size: 15px; font-weight: 600; color: var(--lux-text); letter-spacing: .5px; }
.uz-orders-all {
  margin-left: auto; display: inline-flex; align-items: center; gap: 2px;
  border: 0; background: transparent; cursor: pointer;
  font-size: 12.5px; color: var(--lux-text-2);
}
.uz-orders-all svg { width: 15px; height: 15px; fill: none; stroke: var(--lux-text-3); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.uz-orders-row { display: grid; grid-template-columns: repeat(4, 1fr); }
.uz-order-item {
  display: flex; flex-direction: column; align-items: center; gap: 9px;
  border: 0; background: transparent; cursor: pointer; padding: 4px 0;
}
.uz-order-ico {
  width: 46px; height: 46px; border-radius: 15px; display: grid; place-items: center;
  background: var(--lux-surface); border: 1px solid var(--lux-hair);
  color: var(--lux-gold);
  transition: transform .12s ease, border-color .12s ease;
}
.uz-order-item:active .uz-order-ico { transform: translateY(1px); border-color: var(--lux-accent); }
.uz-order-ico :deep(.van-icon) { color: var(--lux-gold); }
.uz-order-label { font-size: 12px; color: var(--lux-text-2); }

/* ---- Menu ---- */
.uz-menu { padding: 4px 4px; }
.uz-row {
  width: 100%; display: flex; align-items: center; gap: 13px;
  border: 0; background: transparent; cursor: pointer; text-align: left;
  padding: 15px 12px; border-bottom: 1px solid var(--lux-hair-soft);
}
.uz-row:last-child { border-bottom: 0; }
.uz-row:active { background: rgba(255, 255, 255, .03); }
.uz-row-ico {
  flex: 0 0 34px; width: 34px; height: 34px; border-radius: 11px; display: grid; place-items: center;
  background: var(--lux-surface-2); border: 1px solid var(--lux-hair-soft);
}
.uz-row-ico :deep(.van-icon) { color: var(--lux-price); }
.uz-row-label { flex: 1; font-size: 15px; color: var(--lux-text); font-weight: 500; }
.uz-row-arr { width: 18px; height: 18px; fill: none; stroke: var(--lux-text-3); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }

/* ---- Theme switch ---- */
.uz-theme { display: flex; align-items: center; gap: 12px; padding: 15px 16px; }
.uz-theme-hd { display: flex; align-items: center; gap: 13px; flex: 1; min-width: 0; }
.uz-switch {
  display: flex; gap: 3px; padding: 3px;
  background: var(--lux-bg); border: 1px solid var(--lux-hair-soft); border-radius: 999px;
}
.uz-switch-opt {
  border: 0; background: transparent; cursor: pointer; white-space: nowrap;
  padding: 6px 12px; border-radius: 999px; font-size: 12px; color: var(--lux-text-2);
  transition: color .15s ease, background .15s ease;
}
.uz-switch-opt.active {
  color: #1a0d05; font-weight: 700;
  background: linear-gradient(135deg, var(--lux-gold), var(--lux-accent-2) 55%, var(--lux-accent));
  box-shadow: 0 4px 12px rgba(224, 190, 120, .4);
}

/* ---- Logout ---- */
.uz-logout {
  width: 100%; height: 48px; margin-top: 4px; font-size: 15px; letter-spacing: 4px;
  color: var(--lux-text-2);
}
.uz-logout:active { color: var(--lux-accent); }

@media (prefers-reduced-motion: reduce) {
  .uz-order-ico, .uz-switch-opt { transition: none; }
}
</style>
