export default defineNuxtPlugin(() => {
  const { isDark } = useTheme()

  const setFavicon = (dark: boolean) => {
    const theme = dark ? 'dark' : 'light'
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      || document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/x-icon'
    link.href = `/icons/favicon-${theme}.ico`
    if (!link.parentNode) document.head.appendChild(link)

    const link32 = document.querySelector<HTMLLinkElement>('link[rel="icon"][sizes="32x32"]')
      || document.createElement('link')
    link32.rel = 'icon'
    link32.type = 'image/png'
    link32.sizes = '32x32' as any
    link32.href = `/icons/favicon-32x32-${theme}.png`
    if (!link32.parentNode) document.head.appendChild(link32)

    const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')
      || document.createElement('link')
    apple.rel = 'apple-touch-icon'
    apple.href = `/icons/apple-touch-icon-${theme}.png`
    if (!apple.parentNode) document.head.appendChild(apple)
  }

  // Sync favicon with app theme (not just system preference)
  watch(isDark, (dark) => setFavicon(dark), { immediate: true })
})
