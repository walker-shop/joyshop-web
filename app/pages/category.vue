<template>
  <div class="category-page">
    <van-nav-bar title="分类" />
    <div class="category-body">
      <van-sidebar v-model="activeIndex" class="category-sidebar" @change="onSidebarChange">
        <van-sidebar-item
          v-for="cat in parentCategories"
          :key="cat.id"
          :title="cat.name"
        />
      </van-sidebar>
      <div class="category-content">
        <!-- Sub categories -->
        <van-grid v-if="currentSubCategories.length" :column-num="3" :border="false">
          <van-grid-item
            v-for="sub in currentSubCategories"
            :key="sub.id"
            :text="sub.name"
            @click="onSubClick(sub)"
          >
            <template #icon>
              <img class="sub-cat-icon" :src="getSubIcon(sub)" :alt="sub.name" />
            </template>
          </van-grid-item>
        </van-grid>

        <!-- Products in this category -->
        <div v-if="categoryProducts.length" class="category-products">
          <van-card
            v-for="item in categoryProducts"
            :key="item.id"
            :price="item.shopPrice?.toFixed(2)"
            :title="item.name"
            :thumb="item.goodsFrontImage"
            @click="navigateTo(`/goods/${item.id}`)"
          />
        </div>
        <van-loading v-if="loadingProducts" class="loading">加载中...</van-loading>
        <van-empty v-if="!loadingProducts && categoryProducts.length === 0 && currentSubCategories.length === 0" description="暂无数据" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { tenantId } = useTenant()
const route = useRoute()

interface Category {
  id: number
  name: string
  parentId: number
  level: number
}

const activeIndex = ref(0)
const allCategories = ref<Category[]>([])
const categoryProducts = ref<any[]>([])
const loadingProducts = ref(false)
const selectedSubId = ref<number | null>(null)

const SUB_ICON_MAP: Record<string, string> = {
  '手机': 'https://img.icons8.com/3d-fluency/94/iphone.png',
  '手机配件': 'https://img.icons8.com/3d-fluency/94/usb-cable.png',
  '摄影摄像': 'https://img.icons8.com/3d-fluency/94/camera.png',
  '智能设备': 'https://img.icons8.com/3d-fluency/94/smartwatch.png',
  '影音娱乐': 'https://img.icons8.com/3d-fluency/94/headphones.png',
  '笔记本': 'https://img.icons8.com/3d-fluency/94/laptop.png',
  '台式机': 'https://img.icons8.com/3d-fluency/94/workstation.png',
  '显示器': 'https://img.icons8.com/3d-fluency/94/monitor.png',
  '键鼠外设': 'https://img.icons8.com/3d-fluency/94/keyboard.png',
  '办公文具': 'https://img.icons8.com/3d-fluency/94/pencil.png',
  'T恤衬衫': 'https://img.icons8.com/3d-fluency/94/t-shirt.png',
  '外套夹克': 'https://img.icons8.com/3d-fluency/94/coat.png',
  '裤装': 'https://img.icons8.com/3d-fluency/94/trousers.png',
  '内衣袜子': 'https://img.icons8.com/3d-fluency/94/socks.png',
  '运动鞋': 'https://img.icons8.com/3d-fluency/94/sneakers.png',
  '休闲鞋': 'https://img.icons8.com/3d-fluency/94/shoe-man.png',
  '双肩包': 'https://img.icons8.com/3d-fluency/94/backpack.png',
  '拉杆箱': 'https://img.icons8.com/3d-fluency/94/suitcase.png',
  '面部护肤': 'https://img.icons8.com/3d-fluency/94/spa.png',
  '彩妆': 'https://img.icons8.com/3d-fluency/94/lipstick.png',
  '洗护用品': 'https://img.icons8.com/3d-fluency/94/soap.png',
  '香水': 'https://img.icons8.com/3d-fluency/94/perfume-bottle.png',
  '零食坚果': 'https://img.icons8.com/3d-fluency/94/peanuts.png',
  '茶饮冲调': 'https://img.icons8.com/3d-fluency/94/tea.png',
  '生鲜水果': 'https://img.icons8.com/3d-fluency/94/apple.png',
  '粮油调味': 'https://img.icons8.com/3d-fluency/94/rice-bowl.png',
  '空调': 'https://img.icons8.com/3d-fluency/94/air-conditioner.png',
  '冰箱': 'https://img.icons8.com/3d-fluency/94/fridge.png',
  '洗衣机': 'https://img.icons8.com/3d-fluency/94/washing-machine.png',
  '厨房电器': 'https://img.icons8.com/3d-fluency/94/microwave.png',
  '清洁电器': 'https://img.icons8.com/3d-fluency/94/vacuum-cleaner.png',
  '运动服饰': 'https://img.icons8.com/3d-fluency/94/t-shirt.png',
  '健身器材': 'https://img.icons8.com/3d-fluency/94/dumbbell.png',
  '户外装备': 'https://img.icons8.com/3d-fluency/94/tent.png',
  '骑行运动': 'https://img.icons8.com/3d-fluency/94/cycling.png',
}

function getSubIcon(sub: Category): string {
  return SUB_ICON_MAP[sub.name] || 'https://img.icons8.com/3d-fluency/94/tag.png'
}

// Parent categories (level 1)
const parentCategories = computed(() =>
  allCategories.value.filter(c => !c.parentId || c.parentId === 0)
)

// Sub categories of active parent
const currentSubCategories = computed(() => {
  const parent = parentCategories.value[activeIndex.value]
  if (!parent) return []
  return allCategories.value.filter(c => c.parentId === parent.id)
})

async function fetchCategories() {
  try {
    const res = await $fetch<{ code: number; data: any }>(
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

async function fetchProducts(categoryId: number) {
  loadingProducts.value = true
  categoryProducts.value = []
  try {
    const res = await $fetch<{ code: number; data: { data: any[]; total: number } }>(
      `${config.public.apiBase}/v1/goods`,
      { params: { page: 1, pageSize: 20, categoryId, tenant_id: tenantId } },
    )
    if (res.code === 200 && res.data?.data) {
      categoryProducts.value = res.data.data
    }
  } catch (e) {
    console.warn('Failed to fetch products:', e)
  } finally {
    loadingProducts.value = false
  }
}

function onSidebarChange(index: number) {
  selectedSubId.value = null
  categoryProducts.value = []
  // Auto-load products for the parent category
  const parent = parentCategories.value[index]
  if (parent) {
    fetchProducts(parent.id)
  }
}

function onSubClick(sub: Category) {
  selectedSubId.value = sub.id
  fetchProducts(sub.id)
}

// Init
await fetchCategories()

// Handle query param ?id=xxx (from homepage category click)
const queryId = Number(route.query.id)
if (queryId && parentCategories.value.length) {
  const idx = parentCategories.value.findIndex(c => c.id === queryId)
  if (idx >= 0) {
    activeIndex.value = idx
  }
}

// Load products for initial category
if (parentCategories.value.length) {
  const parent = parentCategories.value[activeIndex.value]
  if (parent) {
    await fetchProducts(parent.id)
  }
}
</script>

<style scoped>
.category-page {
  background-color: var(--color-bg-card);
  min-height: 100vh;
  transition: var(--theme-transition);
}

.category-body {
  display: flex;
  height: calc(100vh - 96px);
}

.category-sidebar {
  flex-shrink: 0;
  width: 100px;
  overflow-y: auto;
}

.category-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background-color: var(--color-bg-page);
  transition: var(--theme-transition);
}

.category-products {
  padding-top: 8px;
}

.sub-cat-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.loading {
  text-align: center;
  padding: 20px;
}
</style>
