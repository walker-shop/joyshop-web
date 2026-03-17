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
        v-for="cat in topCategories"
        :key="cat.id"
        :icon="cat.icon"
        :text="cat.name"
        @click="navigateTo(`/category?id=${cat.id}`)"
      />
    </van-grid>

    <div class="section-header">
      <span class="section-title">热门推荐</span>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-empty
        v-if="!loading && products.length === 0"
        description="暂无商品"
        image="search"
      />
      <div v-else class="product-list">
        <van-card
          v-for="item in products"
          :key="item.id"
          :price="item.shopPrice?.toFixed(2)"
          :title="item.name"
          :thumb="item.goodsFrontImage"
          @click="navigateTo(`/goods/${item.id}`)"
        />
      </div>
      <van-loading v-if="loading" class="loading-more">加载中...</van-loading>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { tenantId } = useTenant()
const searchValue = ref('')
const refreshing = ref(false)
const loading = ref(false)

// === Banners ===
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

// === Categories ===
interface Category {
  id: number
  name: string
  parentId: number
  level: number
  icon?: string
}

const ICON_MAP: Record<string, string> = {
  '手机通讯': 'phone-o',
  '电脑办公': 'tv-o',
  '服饰鞋包': 'bag-o',
  '家用电器': 'desktop-o',
  '美妆护肤': 'smile-o',
  '食品饮料': 'coupon-o',
  '运动户外': 'fire-o',
  '数码配件': 'audio-o',
  '家居家装': 'home-o',
  '母婴玩具': 'gift-o',
}

const allCategories = ref<Category[]>([])
const topCategories = computed(() => {
  const tops = allCategories.value
    .filter(c => !c.parentId || c.parentId === 0)
    .slice(0, 8)
  return tops.map(c => ({
    ...c,
    icon: ICON_MAP[c.name] || 'apps-o',
  }))
})

async function fetchCategories() {
  try {
    const res = await $fetch<{ code: number; data: { data: Category[] } }>(
      `${config.public.apiBase}/v1/categories`,
    )
    if (res.code === 200) {
      const payload = res.data
      allCategories.value = Array.isArray(payload) ? payload : (payload?.data || [])
    }
  } catch (e) {
    console.warn('Failed to fetch categories:', e)
  }
}

// === Products ===
const products = ref<any[]>([])

async function fetchProducts() {
  loading.value = true
  try {
    const res = await $fetch<{ code: number; data: { data: any[]; total: number } }>(
      `${config.public.apiBase}/v1/goods`,
      { params: { page: 1, pageSize: 20, isHot: true, tenant_id: tenantId } },
    )
    if (res.code === 200 && res.data?.data) {
      products.value = res.data.data
    }
  } catch (e) {
    console.warn('Failed to fetch products:', e)
  } finally {
    loading.value = false
  }
}

// === Init ===
await fetchBanners()
await fetchCategories()
await fetchProducts()

async function onRefresh() {
  await Promise.all([fetchBanners(), fetchProducts()])
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

.loading-more {
  text-align: center;
  padding: 16px;
}
</style>
