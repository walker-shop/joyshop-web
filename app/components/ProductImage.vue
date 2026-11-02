<template>
  <div class="product-image">
    <img
      v-if="src && !failed"
      :key="src"
      ref="image"
      :src="src"
      :alt="alt"
      :style="{ objectFit: fit }"
      loading="lazy"
      decoding="async"
      @load="loaded = true"
      @error="failed = true"
    >
    <div v-if="failed || !src" class="product-image__placeholder" role="img" :aria-label="alt">
      <slot name="error" />
    </div>
    <div v-else-if="!loaded" class="product-image__placeholder" aria-hidden="true">
      <slot name="loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
const props = withDefaults(defineProps<{ src?: string; alt: string; fit?: CSSProperties['objectFit'] }>(), { fit: 'cover' })
const image = ref<HTMLImageElement>()
const loaded = ref(false)
const failed = ref(false)
function checkCachedImage() {
  if (image.value?.complete && image.value.naturalWidth > 0) loaded.value = true
}
watch(() => props.src, async () => {
  loaded.value = false
  failed.value = false
  await nextTick()
  checkCachedImage()
})
onMounted(checkCachedImage)
</script>

<style scoped>
.product-image { position: relative; }
.product-image > img { display: block; width: 100%; height: 100%; }
.product-image__placeholder { position: absolute; inset: 0; }
</style>
