<template>
  <div class="cart-page">
    <van-nav-bar title="购物车" />
    <van-empty description="购物车还是空的，快去挑好物吧～">
      <template #image>
        <svg class="empty-svg" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="58" fill="var(--color-primary-soft)" />
          <path d="M34 42h6l7 34h32l7-24H46" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="52" cy="86" r="5" fill="var(--color-primary)" />
          <circle cx="76" cy="86" r="5" fill="var(--color-primary)" />
          <path d="M62 30v14M55 37h14" stroke="var(--color-primary-light)" stroke-width="4" stroke-linecap="round" />
        </svg>
      </template>
      <van-button round type="primary" class="go-shop-btn" @click="navigateTo('/')">
        去逛逛
      </van-button>
    </van-empty>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.cart-page {
  background-color: var(--color-bg-card);
  min-height: 100vh;
  transition: var(--theme-transition);
}

.empty-svg {
  width: 120px;
  height: 120px;
}

.go-shop-btn {
  width: 160px;
  margin-top: 8px;
}
</style>
