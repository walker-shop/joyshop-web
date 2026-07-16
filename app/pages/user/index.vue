<template>
  <div class="lux user-page">
    <!-- Hero header -->
    <header class="uz-hero">
      <div class="uz-hero-glow" />
      <div class="uz-id" :class="{ 'is-guest': !isLoggedIn }" @click="!isLoggedIn && handleLogin()">
        <div class="uz-avatar" :class="{ tappable: isLoggedIn }" @click.stop="isLoggedIn && pickAvatar()">
          <img v-if="avatarUrl" class="uz-avatar-img" :src="avatarUrl" alt="头像">
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.3 0-8 1.7-8 5v1h16v-1c0-3.3-4.7-5-8-5z" />
          </svg>
          <span class="uz-avatar-ring" />
          <span v-if="isLoggedIn" class="uz-avatar-cam" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2 7.2 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.2L15 2H9z" /></svg>
          </span>
          <input ref="fileInput" type="file" accept="image/*" hidden @change="onAvatarPicked">
        </div>
        <div class="uz-id-body">
          <template v-if="isLoggedIn">
            <span class="uz-name">{{ user?.nickname || user?.username }}</span>
            <div class="uz-tags">
              <span class="uz-level">{{ memberLevel }}</span>
              <span class="uz-badge">✦ 尊享会员</span>
            </div>
          </template>
          <template v-else>
            <span class="uz-name">登录 / 注册</span>
            <span class="uz-sub">登录后享受更多专属权益</span>
          </template>
        </div>
        <svg v-if="!isLoggedIn" class="uz-id-arr" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>
      </div>

      <!-- 会员数据 -->
      <div v-if="isLoggedIn" class="uz-stats">
        <button class="uz-stat" @click="onToast('积分商城开发中')">
          <span class="uz-stat-num">{{ stats.points }}</span>
          <span class="uz-stat-label">积分</span>
        </button>
        <span class="uz-stat-div" />
        <button class="uz-stat" @click="onToast('优惠券开发中')">
          <span class="uz-stat-num">{{ stats.coupons }}</span>
          <span class="uz-stat-label">优惠券</span>
        </button>
        <span class="uz-stat-div" />
        <button class="uz-stat" @click="onToast('收藏功能开发中')">
          <span class="uz-stat-num">{{ stats.favorites }}</span>
          <span class="uz-stat-label">收藏</span>
        </button>
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

// 会员数据（积分/优惠券暂无后端，占位 0，UI 已就绪待接；收藏可后续接真实数）
const stats = reactive({ points: 0, coupons: 0, favorites: 0 })
// 会员等级：按积分档换算（1000/级），暂无后端积分故为 V1
const memberLevel = computed(() => `V${Math.floor(stats.points / 1000) + 1}`)

// 头像：oss-web 直传 S3 + walker-iam 统一落档；失败回退本地预览
const { upload: uploadAvatar } = useAvatarUpload()
const avatarUrl = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const avatarUploading = ref(false)
watchEffect(() => { if (user.value?.avatar) avatarUrl.value = user.value.avatar })
function pickAvatar() { if (!avatarUploading.value) fileInput.value?.click() }
async function onAvatarPicked(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  avatarUrl.value = URL.createObjectURL(f) // 即时本地预览
  avatarUploading.value = true
  try {
    const url = await uploadAvatar(f)
    avatarUrl.value = url
    showToast('头像已更新')
  } catch (err) {
    showToast('已本地预览（上传服务未就绪）')
  } finally {
    avatarUploading.value = false
    input.value = ''
  }
}

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
  margin: 14px 14px 8px;
  padding: 26px 22px;
  border-radius: 22px;
  overflow: hidden;
  background:
    linear-gradient(120deg, rgba(16, 11, 3, .30), rgba(16, 11, 3, .62)),
    var(--lux-auth-bg) center / cover no-repeat;
  border: 1px solid color-mix(in srgb, var(--lux-gold) 34%, transparent);
  box-shadow: 0 12px 32px rgba(0, 0, 0, .42), inset 0 1px 0 rgba(255, 246, 223, .12);
}
.uz-hero-glow {
  position: absolute; top: -70px; right: -30px; pointer-events: none;
  width: 240px; height: 200px;
  background: radial-gradient(60% 60% at 60% 40%, rgba(230, 205, 143, .38), transparent 70%);
  filter: blur(4px);
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
  background: linear-gradient(140deg, rgba(30, 22, 10, .72), rgba(16, 11, 4, .82));
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 246, 223, .18);
  box-shadow: 0 8px 24px rgba(0, 0, 0, .5);
}
.uz-avatar svg { width: 34px; height: 34px; fill: var(--lux-gold); }
.uz-avatar-ring {
  position: absolute; inset: -3px; border-radius: 50%; pointer-events: none;
  background: linear-gradient(135deg, var(--lux-gold), var(--lux-accent) 60%, transparent);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
  opacity: .85;
}
.uz-avatar.tappable { cursor: pointer; }
.uz-avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.uz-avatar-cam {
  position: absolute; right: -2px; bottom: -2px; z-index: 2;
  width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center;
  background: linear-gradient(135deg, #e6cd8f, #a9822f); border: 2px solid rgba(16, 11, 4, .9);
  box-shadow: 0 2px 6px rgba(0, 0, 0, .5);
}
.uz-avatar-cam svg { width: 12px; height: 12px; fill: #2a1f0a; }

.uz-id-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.uz-tags { display: flex; align-items: center; gap: 7px; }
.uz-level {
  display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 7px;
  font-size: 12px; font-weight: 900; font-style: italic; letter-spacing: .5px;
  color: #2a1f0a; background: linear-gradient(135deg, #fbe9bd, #d9b876 55%, #b8963f);
  box-shadow: 0 2px 8px rgba(184, 150, 63, .5);
}
.uz-name { font-size: 21px; font-weight: 800; color: #fdf6e6; letter-spacing: .5px; text-shadow: 0 1px 6px rgba(0,0,0,.5); }
.uz-sub { font-size: 12.5px; color: rgba(253, 246, 230, .78); letter-spacing: .3px; text-shadow: 0 1px 4px rgba(0,0,0,.5); }
.uz-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 11px; border-radius: 999px; font-size: 11.5px; font-weight: 800; letter-spacing: .5px;
  color: #2a1f0a; background: linear-gradient(135deg, #f0dca6, #d9b876 52%, #c39f52);
  box-shadow: 0 3px 10px rgba(195, 159, 82, .5);
}
.uz-id-arr { width: 20px; height: 20px; fill: none; stroke: var(--lux-text-3); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }

/* ---- 会员数据 ---- */
.uz-stats {
  position: relative;
  display: flex; align-items: center; justify-content: space-around;
  margin-top: 20px; padding: 12px 8px 4px;
  border-top: 1px solid rgba(255, 246, 223, .16);
}
.uz-stat {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
  border: 0; background: transparent; cursor: pointer;
}
.uz-stat-num {
  font-size: 19px; font-weight: 800; color: #fdf6e6;
  font-variant-numeric: tabular-nums; text-shadow: 0 1px 6px rgba(0,0,0,.5);
}
.uz-stat-label { font-size: 11.5px; color: rgba(253, 246, 230, .72); letter-spacing: .5px; }
.uz-stat-div { width: 1px; height: 24px; background: rgba(255, 246, 223, .18); }
.uz-stat:active .uz-stat-num { color: var(--lux-accent-2); }

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
