// Use installed CJK/Thai fonts instead of downloading large web-font subsets.
// Keep the small Latin display face as a progressive enhancement.
export default defineNuxtPlugin(() => {
  onNuxtReady(() => {
    void import('@fontsource-variable/archivo').catch(() => {})
  })
})
