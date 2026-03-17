<template>
  <div class="goods-detail">
    <van-nav-bar
      title="商品详情"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <van-swipe :autoplay="3000" lazy-render class="goods-swiper">
      <van-swipe-item v-for="(img, idx) in goods.images" :key="idx">
        <van-image
          width="100%"
          height="375"
          fit="cover"
          :src="img"
        />
      </van-swipe-item>
    </van-swipe>

    <!-- Price card -->
    <div class="price-card">
      <div class="price-row">
        <span class="price-symbol">¥</span>
        <span class="price-value">{{ goods.price }}</span>
        <span v-if="goods.originalPrice" class="price-original">¥{{ goods.originalPrice }}</span>
      </div>
    </div>

    <!-- Info card -->
    <div class="info-card">
      <div class="goods-name">{{ goods.name }}</div>
      <div class="goods-desc">{{ goods.description }}</div>
    </div>

    <!-- Action bar -->
    <div class="action-bar">
      <div class="action-icons">
        <div class="action-icon-item" @click="showToast('客服功能开发中')">
          <van-icon name="chat-o" size="22" />
          <span>客服</span>
        </div>
        <div class="action-icon-item" @click="navigateTo('/cart')">
          <van-icon name="cart-o" size="22" />
          <span>购物车</span>
        </div>
      </div>
      <div class="action-buttons">
        <button class="btn-cart" @click="onAddCart">加入购物车</button>
        <button class="btn-buy" @click="onBuyNow">立即购买</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'

definePageMeta({ layout: 'blank' })

const route = useRoute()

// Mock data — will be replaced with real API
const { data: goods } = await useAsyncData(`goods-${route.params.id}`, () => {
  return Promise.resolve({
    id: route.params.id,
    name: '示例商品 — ' + route.params.id,
    description: '这是一个示例商品描述，后续将从API获取真实数据。',
    price: '99.00',
    originalPrice: '199.00',
    images: [
      'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
      'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg',
    ],
  })
}, {
  default: () => ({
    id: '',
    name: '',
    description: '',
    price: '0.00',
    originalPrice: '',
    images: [],
  }),
})

useSeoMeta({
  title: () => `${goods.value.name} - ZShop`,
  description: () => goods.value.description,
  ogTitle: () => goods.value.name,
  ogDescription: () => goods.value.description,
  ogImage: () => goods.value.images?.[0] ?? '',
})

function onAddCart() {
  showToast('已加入购物车')
}

function onBuyNow() {
  showToast('立即购买功能开发中')
}
</script>

<style scoped>
.goods-detail {
  background-color: var(--color-bg-page);
  min-height: 100vh;
  padding-bottom: 64px;
  transition: var(--theme-transition);
}

.goods-swiper {
  width: 100%;
  background-color: var(--color-bg-card);
}

/* ── Price card ── */
.price-card {
  background-color: var(--color-bg-card);
  padding: 16px;
  margin-bottom: 8px;
}

.price-row {
  display: flex;
  align-items: baseline;
  color: var(--color-price);
}

.price-symbol {
  font-size: 16px;
  font-weight: 600;
}

.price-value {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.price-original {
  margin-left: 8px;
  font-size: 13px;
  color: var(--color-text-tertiary);
  text-decoration: line-through;
}

/* ── Info card ── */
.info-card {
  background-color: var(--color-bg-card);
  padding: 16px;
  margin-bottom: 8px;
}

.goods-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  line-height: 1.5;
}

.goods-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* ── Custom action bar ── */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: flex;
  align-items: center;
  padding: 0 0 0 16px;
  background-color: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
  box-sizing: border-box;
  z-index: 100;
}

.action-icons {
  display: flex;
  align-items: center;
  align-self: stretch;
  gap: 16px;
  margin-right: 12px;
}

.action-icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  color: var(--color-text-secondary);
  cursor: pointer;
  gap: 2px;
}

.action-buttons {
  flex: 1;
  display: flex;
  gap: 0;
}

.action-buttons button {
  flex: 1;
  height: 50px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.5px;
}

.btn-cart {
  background-color: #111;
  color: #fff;
  border-radius: 0;
}

.btn-buy {
  background-color: var(--color-price);
  color: #fff;
  border-radius: 0;
}

.btn-cart:active {
  opacity: 0.85;
}

.btn-buy:active {
  opacity: 0.85;
}

/* ── Dark mode ── */
html.dark .btn-cart {
  background-color: #2a2a3e;
}
</style>
