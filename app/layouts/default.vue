<template>
  <div class="layout">
    <div class="layout-content">
      <slot />
    </div>
    <van-tabbar v-model="activeTab" route class="app-tabbar">
      <van-tabbar-item to="/">
        <template #icon="{ active }">
          <PhHouse :weight="active ? 'fill' : 'regular'" :size="22" />
        </template>
        首页
      </van-tabbar-item>
      <van-tabbar-item to="/category">
        <template #icon="{ active }">
          <PhGridFour :weight="active ? 'fill' : 'regular'" :size="22" />
        </template>
        分类
      </van-tabbar-item>
      <van-tabbar-item to="/cart">
        <template #icon="{ active }">
          <PhShoppingCart :weight="active ? 'fill' : 'regular'" :size="22" />
        </template>
        购物车
      </van-tabbar-item>
      <van-tabbar-item to="/user">
        <template #icon="{ active }">
          <PhUser :weight="active ? 'fill' : 'regular'" :size="22" />
        </template>
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { PhHouse, PhGridFour, PhShoppingCart, PhUser } from '@phosphor-icons/vue'

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
