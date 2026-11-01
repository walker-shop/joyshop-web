<script setup lang="ts">
const config = useRuntimeConfig()
const { tenantId } = useTenant()
const { data } = await useAsyncData('seo-catalog', () => $fetch<any>(`${config.public.apiBase}/v1/goods`, { params: { page: 1, pageSize: 12, tenant_id: tenantId }, timeout: 10000 }), { default: () => null })
const products = computed(() => data.value?.data?.data || [])
</script>
<template>
  <section v-if="products.length" class="seo-catalog" aria-label="商品目录">
    <h2>浏览商品详情</h2>
    <ul><li v-for="product in products" :key="product.id"><NuxtLink :to="`/goods/${product.id}`">{{ product.name }}</NuxtLink></li></ul>
  </section>
</template>
<style scoped>
.seo-catalog { padding: 2rem; max-width: 1200px; margin: auto; }
ul { display: flex; flex-wrap: wrap; gap: 1rem 2rem; padding-left: 1rem; }
a { color: inherit; text-decoration: underline; text-underline-offset: 4px; }
</style>
