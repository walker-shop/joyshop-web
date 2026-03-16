<template>
  <div class="layout">
    <div class="layout-content">
      <slot />
    </div>
    <van-tabbar v-model="activeTab" route class="app-tabbar">
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="apps-o" to="/category">分类</van-tabbar-item>
      <van-tabbar-item icon="shopping-cart-o" to="/cart">购物车</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/user">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
const activeTab = ref(0)
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

/* PC 端限制 tabbar 宽度居中 */
.app-tabbar :deep(.van-tabbar) {
  max-width: 480px;
  left: 50% !important;
  transform: translateX(-50%);
  right: auto !important;
}
</style>
