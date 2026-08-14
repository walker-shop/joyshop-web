<script setup lang="ts">
definePageMeta({ layout: 'blank' })

onMounted(() => {
  if (!window.opener) return
  const authData = Object.fromEntries(new URLSearchParams(window.location.hash.slice(1)))
  window.opener.postMessage({ type: 'zshop-telegram-oidc', ticket: authData.ticket, error: authData.error }, window.location.origin)
  window.close()
})
</script>

<template>
  <div />
</template>
