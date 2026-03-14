<template>
  <div class="category-page">
    <van-nav-bar title="分类" />
    <div class="category-body">
      <van-sidebar v-model="activeIndex" class="category-sidebar">
        <van-sidebar-item
          v-for="cat in sidebarList"
          :key="cat.id"
          :title="cat.name"
        />
      </van-sidebar>
      <div class="category-content">
        <van-grid :column-num="3" :border="false">
          <van-grid-item
            v-for="sub in currentSubCategories"
            :key="sub.id"
            :text="sub.name"
            icon="photo-o"
          />
        </van-grid>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const activeIndex = ref(0)

const sidebarList = ref([
  {
    id: 1,
    name: '手机数码',
    children: [
      { id: 101, name: '手机' },
      { id: 102, name: '耳机' },
      { id: 103, name: '充电器' },
      { id: 104, name: '手机壳' },
      { id: 105, name: '数据线' },
      { id: 106, name: '移动电源' },
    ],
  },
  {
    id: 2,
    name: '电脑办公',
    children: [
      { id: 201, name: '笔记本' },
      { id: 202, name: '台式机' },
      { id: 203, name: '显示器' },
      { id: 204, name: '键盘' },
      { id: 205, name: '鼠标' },
    ],
  },
  {
    id: 3,
    name: '服饰鞋包',
    children: [
      { id: 301, name: 'T恤' },
      { id: 302, name: '外套' },
      { id: 303, name: '裤子' },
      { id: 304, name: '运动鞋' },
      { id: 305, name: '单肩包' },
    ],
  },
  {
    id: 4,
    name: '美妆护肤',
    children: [
      { id: 401, name: '面膜' },
      { id: 402, name: '防晒' },
      { id: 403, name: '口红' },
      { id: 404, name: '洗面奶' },
    ],
  },
  {
    id: 5,
    name: '食品生鲜',
    children: [
      { id: 501, name: '零食' },
      { id: 502, name: '水果' },
      { id: 503, name: '饮料' },
      { id: 504, name: '牛奶' },
    ],
  },
  {
    id: 6,
    name: '家用电器',
    children: [
      { id: 601, name: '空调' },
      { id: 602, name: '冰箱' },
      { id: 603, name: '洗衣机' },
      { id: 604, name: '电饭煲' },
    ],
  },
])

const currentSubCategories = computed(() => {
  return sidebarList.value[activeIndex.value]?.children ?? []
})
</script>

<style scoped>
.category-page {
  background-color: #fff;
  min-height: 100vh;
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
  background-color: #f7f8fa;
}
</style>
