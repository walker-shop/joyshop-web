<template>
  <div class="home-page">
    <van-search
      v-model="searchValue"
      placeholder="搜索商品"
      shape="round"
      readonly
      @click="navigateTo('/search')"
    />

    <van-swipe v-if="banners.length" :autoplay="3000" lazy-render class="home-swiper">
      <van-swipe-item v-for="item in banners" :key="item.id">
        <img
          class="banner-img"
          :src="item.image"
          @click="item.url && navigateTo(item.url)"
        />
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
const config = useRuntimeConfig()
const { tenantId } = useTenant()
const searchValue = ref('')
const refreshing = ref(false)

interface Banner {
  id: number
  image: string
  url: string
  index: number
}

const banners = ref<Banner[]>([])

async function fetchBanners() {
  try {
    const res = await $fetch<{ code: number; data: { data: Banner[] } }>(
      `${config.public.apiBase}/v1/banners`,
      { params: { tenant_id: tenantId } },
    )
    if (res.code === 200 && res.data?.data) {
      banners.value = res.data.data
    }
  } catch (e) {
    console.warn('Failed to fetch banners:', e)
  }
}

await fetchBanners()

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

async function onRefresh() {
  await fetchBanners()
  refreshing.value = false
}
</script>

<style scoped>
.home-page {
  background-color: var(--color-bg-page);
  transition: var(--theme-transition);
}

.home-swiper {
  margin: 8px 12px;
  border-radius: 8px;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: block;
  object-fit: cover;
}

.category-grid {
  margin: 8px 0;
  background-color: var(--color-bg-card);
  transition: var(--theme-transition);
}

.section-header {
  padding: 12px 16px 8px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.product-list {
  padding: 0 12px;
}
</style>
