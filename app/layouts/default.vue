<template>
  <div class="layout">
    <div class="layout-content">
      <slot />
    </div>
    <!-- :border="false" 关掉 Vant 自带的 van-hairline--top-bottom
         （它用 ::after 伪元素画 1px #EBEDF0 顶边，纯 CSS 的 border-top:none 盖不掉） -->
    <van-tabbar v-model="activeTab" route :border="false" class="app-tabbar">
      <van-tabbar-item to="/">
        <template #icon="{ active }">
          <PhStorefront :weight="active ? 'fill' : 'regular'" :size="24" />
        </template>
        {{ $t('nav.home') }}
      </van-tabbar-item>
      <van-tabbar-item to="/category">
        <template #icon="{ active }">
          <PhSquaresFour :weight="active ? 'fill' : 'regular'" :size="24" />
        </template>
        {{ $t('nav.category') }}
      </van-tabbar-item>
      <van-tabbar-item to="/cart" :badge="cartCount > 0 ? cartCount : ''">
        <template #icon="{ active }">
          <PhShoppingBag :weight="active ? 'fill' : 'regular'" :size="24" />
        </template>
        {{ $t('nav.cart') }}
      </van-tabbar-item>
      <van-tabbar-item to="/user">
        <template #icon="{ active }">
          <PhUserCircle :weight="active ? 'fill' : 'regular'" :size="24" />
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
  /* tabbar 高度单一来源：内容让位和 tabbar 自身都引用它，避免两处各写一个数字漂移 */
  --app-tabbar-height: 62px;
}

/* 让位高度必须等于 tabbar 实高 + 安全区。
   原来写死 50px 而 tabbar 是 62px，底部 12px 内容一直被压在 bar 下面 ——
   过去 bar 不透明所以看不出来，改成毛玻璃后会直接透出来。 */
.layout-content {
  flex: 1;
  padding-bottom: calc(var(--app-tabbar-height) + env(safe-area-inset-bottom));
}

/* tabbar：One UI 风格 —— 毛玻璃基底，无分割线、无阴影、无高亮块。
   选中态只靠「图标填充 + 主色 + 字重」表达，不给图标套底块也不打光：
   给图标戴金色小方块再加发光，是廉价机 UI 的典型手法，去掉才干净。
   注意 .app-tabbar 就是 .van-tabbar 根元素本身，不能用 :deep 后代选择器。 */
.app-tabbar {
  max-width: 480px;
  left: 50% !important;
  transform: translateX(-50%);
  right: auto !important;
  --van-tabbar-height: var(--app-tabbar-height);
  height: var(--app-tabbar-height);
  padding-bottom: env(safe-area-inset-bottom);
  /* 暗色下的底色由 global.css 的 html.dark 规则以 !important 接管，此处为亮色态 */
  background: color-mix(in srgb, var(--color-tabbar-bg) 72%, transparent);
  backdrop-filter: saturate(150%) blur(20px);
  -webkit-backdrop-filter: saturate(150%) blur(20px);
}
.app-tabbar :deep(.van-tabbar-item) {
  color: var(--color-text-tertiary);
  background: transparent;
  padding-top: 4px;
  transition: color .2s ease;
}
/* One UI 的标签是安静的：中等字重、无字距微调（CJK 加字距只会显松散） */
.app-tabbar :deep(.van-tabbar-item__text) {
  font-size: 11px;
  font-weight: 500;
  margin-top: 3px;
}
.app-tabbar :deep(.van-tabbar-item--active) { color: var(--color-primary); background: transparent; }
.app-tabbar :deep(.van-tabbar-item--active .van-tabbar-item__text) { font-weight: 600; }
.app-tabbar :deep(.van-tabbar-item__icon) {
  margin-bottom: 0;
  transition: transform .22s cubic-bezier(.34, 1.56, .64, 1), color .2s ease;
}
/* 选中态：仅极轻微放大，配合 Phosphor 图标从 regular 变 fill 的形变 */
.app-tabbar :deep(.van-tabbar-item--active .van-tabbar-item__icon) {
  transform: scale(1.04);
}
@media (prefers-reduced-motion: reduce) {
  .app-tabbar :deep(.van-tabbar-item__icon) { transition: none; }
  .app-tabbar :deep(.van-tabbar-item--active .van-tabbar-item__icon) { transform: none; }
}
/* 角标：One UI 的角标是纯色小圆点式，不用渐变也不用超粗字重 —— 渐变+800 会让
   一个 16px 的小圆看起来发脏、发挤。改纯色主色 + 深色字，收字重、收字号。 */
.app-tabbar :deep(.van-badge) {
  background: var(--color-primary) !important;
  border: none !important;
  color: #2a1f0a !important;
  font-weight: 600;
  font-size: 10px;
  line-height: 1;
  padding: 2px 5px;
  min-width: 16px;
  box-shadow: none !important;
}
</style>
