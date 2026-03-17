<template>
  <div class="layout-blank">
    <slot />
  </div>
</template>

<style scoped>
.layout-blank {
  min-height: 100vh;
  background-color: var(--color-bg-page);
  transition: var(--theme-transition);
}
</style>
