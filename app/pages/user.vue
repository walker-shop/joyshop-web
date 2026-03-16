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

    <van-cell-group inset class="user-menu">
      <van-cell title="我的订单" icon="orders-o" is-link />
      <van-cell title="收货地址" icon="location-o" is-link />
      <van-cell title="我的收藏" icon="like-o" is-link />
      <van-cell title="联系客服" icon="service-o" is-link />
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
const { themeMode, setTheme } = useTheme()

const themeOptions = [
  { label: '跟随系统', value: 'system' as const },
  { label: '浅色', value: 'light' as const },
  { label: '深色', value: 'dark' as const },
]

function handleLogin() {
  // TODO: navigate to login page
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
