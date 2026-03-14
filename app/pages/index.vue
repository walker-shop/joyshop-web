<template>
  <div class="home-page">
    <van-search
      v-model="searchValue"
      placeholder="搜索商品"
      shape="round"
      readonly
      @click="navigateTo('/search')"
    />

    <van-swipe :autoplay="3000" lazy-render class="home-swiper">
      <van-swipe-item v-for="item in banners" :key="item.id">
        <div class="swipe-item" :style="{ backgroundColor: item.color }">
          {{ item.text }}
        </div>
      </van-swipe-item>
    </van-swipe>

    <van-grid :column-num="4" :border="false" class="category-grid">
      <van-grid-item
        v-for="cat in categories"
        :key="cat.name"
        :icon="cat.icon"
        :text="cat.name"
        @click="navigateTo('/category')"
      />
    </van-grid>

    <div class="section-header">
      <span class="section-title">热门推荐</span>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-empty
        v-if="products.length === 0"
        description="暂无商品"
        image="search"
      />
      <div v-else class="product-list">
        <van-card
          v-for="item in products"
          :key="item.id"
          :price="item.price"
          :title="item.name"
          :thumb="item.image"
          @click="navigateTo(`/goods/${item.id}`)"
        />
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
const searchValue = ref('')
const refreshing = ref(false)

const banners = ref([
  { id: 1, color: '#0ea5a0', text: '新品上市' },
  { id: 2, color: '#f44336', text: '限时特惠' },
  { id: 3, color: '#ff9800', text: '品牌精选' },
])

const categories = ref([
  { name: '手机', icon: 'phone-o' },
  { name: '电脑', icon: 'tv-o' },
  { name: '服饰', icon: 'bag-o' },
  { name: '鞋包', icon: 'gift-o' },
  { name: '美妆', icon: 'smile-o' },
  { name: '食品', icon: 'coupon-o' },
  { name: '家电', icon: 'desktop-o' },
  { name: '更多', icon: 'more-o' },
])

const products = ref<any[]>([])

function onRefresh() {
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}
</script>

<style scoped>
.home-page {
  background-color: #f7f8fa;
}

.home-swiper {
  margin: 8px 12px;
  border-radius: 8px;
  overflow: hidden;
}

.swipe-item {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
}

.category-grid {
  margin: 8px 0;
  background-color: #fff;
}

.section-header {
  padding: 12px 16px 8px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.product-list {
  padding: 0 12px;
}
</style>
