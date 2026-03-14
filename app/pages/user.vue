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
  </div>
</template>

<script setup lang="ts">
function handleLogin() {
  // TODO: navigate to login page
}
</script>

<style scoped>
.user-page {
  background-color: #f7f8fa;
  min-height: 100vh;
}

.user-header {
  display: flex;
  align-items: center;
  padding: 30px 20px 20px;
  background: linear-gradient(135deg, #0ea5a0 0%, #0d8f8b 100%);
  color: #fff;
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
</style>
