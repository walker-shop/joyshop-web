<template>
  <div class="cart-page">
    <van-nav-bar title="购物车" />
    <van-empty
      description="购物车是空的"
      image="cart"
    >
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

.go-shop-btn {
  width: 160px;
}
</style>
