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
        {{ $t('nav.home') }}
      </van-tabbar-item>
      <van-tabbar-item to="/category">
        <template #icon="{ active }">
          <PhSquaresFour :weight="active ? 'fill' : 'regular'" :size="22" />
        </template>
        {{ $t('nav.category') }}
      </van-tabbar-item>
      <van-tabbar-item to="/cart" :badge="cartCount > 0 ? cartCount : ''">
        <template #icon="{ active }">
          <PhShoppingBag :weight="active ? 'fill' : 'regular'" :size="22" />
        </template>
        {{ $t('nav.cart') }}
      </van-tabbar-item>
      <van-tabbar-item to="/user">
        <template #icon="{ active }">
          <PhUserCircle :weight="active ? 'fill' : 'regular'" :size="22" />
        </template>
        {{ $t('nav.mine') }}
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

/* 玻璃质感 tabbar + 金色顶边（.app-tabbar 直接就是 .van-tabbar 根元素，不能用 :deep 后代选择） */
.app-tabbar {
  max-width: 480px;
  left: 50% !important;
  transform: translateX(-50%);
  right: auto !important;
  --van-tabbar-height: 62px;
  height: 62px;
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
  padding-top: 3px;
  transition: color .18s ease;
}
.app-tabbar :deep(.van-tabbar-item__text) { font-size: 11px; font-weight: 600; margin-top: 2px; letter-spacing: .5px; }
.app-tabbar :deep(.van-tabbar-item--active) { color: var(--color-primary); background: transparent; }
.app-tabbar :deep(.van-tabbar-item--active .van-tabbar-item__text) { font-weight: 800; }
/* 选中项：图标嵌入香槟金渐变圆角块 + 深咖图标 + 上浮发光（对齐全站金按钮语言） */
.app-tabbar :deep(.van-tabbar-item__icon) {
  padding: 6px 9px; border-radius: 13px; margin-bottom: 3px;
  transition: background .2s ease, transform .22s cubic-bezier(.34, 1.56, .64, 1), box-shadow .2s ease, color .2s ease;
}
.app-tabbar :deep(.van-tabbar-item--active .van-tabbar-item__icon) {
  background: linear-gradient(135deg, #e6cd8f, #c9a24c 52%, #a9822f);
  color: #2a1f0a !important; /* 盖过 global.css 里 html.dark .van-tabbar-item__icon{color:inherit!important} */
  transform: translateY(-3px);
  box-shadow: 0 7px 18px color-mix(in srgb, var(--color-primary) 55%, transparent), inset 0 1px 0 rgba(255, 255, 255, .4);
}
.app-tabbar :deep(.van-badge) {
  background: linear-gradient(135deg, #e6cd8f, #a9822f) !important;
  border: none !important; color: #2a1f0a !important; font-weight: 800;
}
</style>
