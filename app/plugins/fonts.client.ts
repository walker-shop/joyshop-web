// Keep fallback fonts readable on the first paint. Brand fonts load after hydration.
export default defineNuxtPlugin(() => {
  onNuxtReady(() => {
    void Promise.allSettled([
      import('@fontsource-variable/archivo'),
      import('@fontsource-variable/noto-sans-sc'),
      import('@fontsource-variable/noto-sans-thai'),
    ])
  })
})
