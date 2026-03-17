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

    <div class="goods-info">
      <div class="goods-price">
        <span class="price-symbol">¥</span>
        <span class="price-value">{{ goods.price }}</span>
        <span v-if="goods.originalPrice" class="price-original">¥{{ goods.originalPrice }}</span>
      </div>
      <div class="goods-name">{{ goods.name }}</div>
      <div class="goods-desc">{{ goods.description }}</div>
    </div>

    <van-action-bar>
      <van-action-bar-icon icon="chat-o" text="客服" />
      <van-action-bar-icon icon="cart-o" text="购物车" @click="navigateTo('/cart')" />
      <van-action-bar-button type="warning" text="加入购物车" @click="onAddCart" />
      <van-action-bar-button type="danger" text="立即购买" @click="onBuyNow" />
    </van-action-bar>
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
  background-color: var(--color-bg-card);
  min-height: 100vh;
  padding-bottom: 60px;
  transition: var(--theme-transition);
}

.goods-swiper {
  width: 100%;
}

.goods-info {
  padding: 12px 16px;
}

.goods-price {
  display: flex;
  align-items: baseline;
  color: var(--color-price);
  margin-bottom: 8px;
}

.price-symbol {
  font-size: 14px;
}

.price-value {
  font-size: 28px;
  font-weight: bold;
}

.price-original {
  margin-left: 8px;
  font-size: 14px;
  color: var(--color-text-tertiary);
  text-decoration: line-through;
}

.goods-name {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.goods-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}
</style>
