<template>
  <div class="layout">
    <div class="layout-content">
      <slot />
    </div>
    <van-tabbar v-model="activeTab" route class="app-tabbar">
      <van-tabbar-item to="/">
        <template #icon="{ active }">
          <PhStorefront :weight="active ? 'fill' : 'regular'" :size="22" />
        </template>
        首页
      </van-tabbar-item>
      <van-tabbar-item to="/category">
        <template #icon="{ active }">
          <PhSquaresFour :weight="active ? 'fill' : 'regular'" :size="22" />
        </template>
        分类
      </van-tabbar-item>
      <van-tabbar-item to="/cart" :badge="cartCount > 0 ? cartCount : ''">
        <template #icon="{ active }">
          <PhShoppingBag :weight="active ? 'fill' : 'regular'" :size="22" />
        </template>
        购物车
      </van-tabbar-item>
      <van-tabbar-item to="/user">
        <template #icon="{ active }">
          <PhUserCircle :weight="active ? 'fill' : 'regular'" :size="22" />
        </template>
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { PhStorefront, PhSquaresFour, PhShoppingBag, PhUserCircle } from '@phosphor-icons/vue'

const activeTab = ref(0)
const { count: cartCount, refresh: refreshCart } = useCartCount()
onMounted(refreshCart)
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-page);
  transition: var(--theme-transition);
}

.layout-content {
  flex: 1;
  padding-bottom: 50px;
}

/* 玻璃质感 tabbar + 金色顶边 */
.app-tabbar :deep(.van-tabbar) {
  max-width: 480px;
  left: 50% !important;
  transform: translateX(-50%);
  right: auto !important;
  height: 58px;
  padding-bottom: env(safe-area-inset-bottom);
  background: color-mix(in srgb, var(--color-tabbar-bg) 80%, transparent);
  backdrop-filter: saturate(160%) blur(18px);
  -webkit-backdrop-filter: saturate(160%) blur(18px);
  border-top: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  box-shadow: 0 -6px 22px rgba(0, 0, 0, 0.16);
}
.app-tabbar :deep(.van-tabbar-item) {
  color: var(--color-text-tertiary);
  background: transparent;
  transition: color .18s ease, transform .18s ease;
}
.app-tabbar :deep(.van-tabbar-item__text) { font-size: 11px; font-weight: 600; margin-top: 3px; letter-spacing: .5px; }
.app-tabbar :deep(.van-tabbar-item--active) { color: var(--color-primary); background: transparent; }
/* 选中项：图标上浮 + 金色发光 + 顶部金条 */
.app-tabbar :deep(.van-tabbar-item--active .van-tabbar-item__icon) {
  transform: translateY(-2px);
  filter: drop-shadow(0 4px 10px color-mix(in srgb, var(--color-primary) 60%, transparent));
  transition: transform .18s cubic-bezier(.34,1.56,.64,1);
}
.app-tabbar :deep(.van-tabbar-item--active)::before {
  content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 26px; height: 3px; border-radius: 0 0 3px 3px;
  background: linear-gradient(90deg, var(--color-primary-light), var(--color-primary));
  box-shadow: 0 0 10px color-mix(in srgb, var(--color-primary) 70%, transparent);
}
.app-tabbar :deep(.van-badge) {
  background: linear-gradient(135deg, #e6cd8f, #a9822f) !important;
  border: none !important; color: #2a1f0a !important; font-weight: 800;
}
</style>
