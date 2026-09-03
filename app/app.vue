<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <WebMcpCompanion />
</template>

<script setup lang="ts">
// Initialize theme on app mount
const { isDark } = useTheme()
</script>
