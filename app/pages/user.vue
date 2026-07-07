<template>
  <div class="user-page">
    <div class="user-header">
      <van-image
        round
        width="60"
        height="60"
        src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
        class="user-avatar"
      />
      <div class="user-info">
        <span class="login-text" @click="handleLogin">登录/注册</span>
        <span class="login-tip">登录后享受更多权益</span>
      </div>
    </div>

    <!-- 订单状态快捷行 -->
    <div class="order-card">
      <div class="order-hd">
        <span class="oh-title">我的订单</span>
        <span class="oh-all" @click="goOrders()">全部订单 ›</span>
      </div>
      <div class="order-row">
        <div v-for="o in orderTabs" :key="o.status" class="order-item" @click="goOrders(o.status)">
          <van-icon :name="o.icon" size="26" />
          <span>{{ o.label }}</span>
        </div>
      </div>
    </div>

    <van-cell-group inset class="user-menu">
      <van-cell title="收货地址" icon="location-o" is-link @click="requireLogin()" />
      <van-cell title="我的收藏" icon="like-o" is-link @click="requireLogin()" />
      <van-cell title="联系客服" icon="service-o" is-link @click="onToast('客服功能开发中')" />
    </van-cell-group>

    <van-cell-group inset class="user-menu">
      <van-cell title="深色模式" icon="brush-o" center>
        <template #right-icon>
          <div class="theme-switcher">
            <span
              v-for="opt in themeOptions"
              :key="opt.value"
              class="theme-option"
              :class="{ active: themeMode === opt.value }"
              @click="setTheme(opt.value)"
            >
              {{ opt.label }}
            </span>
          </div>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'

const { themeMode, setTheme } = useTheme()

const themeOptions = [
  { label: '跟随系统', value: 'system' as const },
  { label: '浅色', value: 'light' as const },
  { label: '深色', value: 'dark' as const },
]

const orderTabs = [
  { status: 'unpaid', label: '待付款', icon: 'gold-coin-o' },
  { status: 'unshipped', label: '待发货', icon: 'send-gift-o' },
  { status: 'shipped', label: '待收货', icon: 'logistics' },
  { status: 'unrated', label: '待评价', icon: 'comment-o' },
  { status: 'aftersale', label: '退款/售后', icon: 'after-sale' },
]

function onToast(msg: string) { showToast(msg) }

// 未接登录流程：一律诚实提示登录，不伪造已登录状态
function requireLogin(): boolean {
  const token = import.meta.client ? localStorage.getItem('token') : null
  if (!token) { showToast('请先登录'); return false }
  return true
}
function handleLogin() { showToast('登录功能开发中') }
function goOrders(_status?: string) {
  if (!requireLogin()) return
  showToast('订单功能开发中')
}
</script>

<style scoped>
.user-page {
  background-color: var(--color-bg-page);
  min-height: 100vh;
  transition: var(--theme-transition);
}

.user-header {
  display: flex;
  align-items: center;
  padding: 30px 20px 20px;
  background: linear-gradient(135deg, var(--color-header-gradient-start) 0%, var(--color-header-gradient-end) 100%);
  color: var(--color-text-inverse);
  transition: var(--theme-transition);
}

.user-avatar {
  margin-right: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.login-text {
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

.login-tip {
  font-size: 13px;
  margin-top: 4px;
  opacity: 0.8;
}

/* 订单快捷行 */
.order-card {
  margin: 12px;
  background: var(--color-bg-card);
  border-radius: 12px;
  padding: 14px 8px 16px;
  transition: var(--theme-transition);
}
.order-hd {
  display: flex;
  align-items: center;
  padding: 0 8px 12px;
}
.oh-title { font-size: 15px; font-weight: 700; color: var(--color-text-primary); }
.oh-all { margin-left: auto; font-size: 12px; color: var(--color-text-tertiary); }
.order-row { display: grid; grid-template-columns: repeat(5, 1fr); }
.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
}
.order-item :deep(.van-icon) { color: var(--color-primary); }

.user-menu {
  margin-top: 12px;
}

.theme-switcher {
  display: flex;
  background-color: var(--color-bg-page);
  border-radius: 8px;
  padding: 2px;
  gap: 2px;
}

.theme-option {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.theme-option.active {
  background-color: var(--color-primary);
  color: #fff;
  font-weight: 500;
}
</style>
