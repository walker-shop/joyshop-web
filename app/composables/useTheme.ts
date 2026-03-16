type ThemeMode = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'joyshop-theme'

const themeMode = ref<ThemeMode>('system')
const isDark = ref(false)

let initialized = false

function getSystemDark(): boolean {
  if (import.meta.server) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return getSystemDark()
}

function applyTheme(dark: boolean) {
  if (import.meta.server) return
  const root = document.documentElement
  if (dark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function useTheme() {
  if (!initialized && import.meta.client) {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    if (saved && ['system', 'light', 'dark'].includes(saved)) {
      themeMode.value = saved
    }
    isDark.value = resolveIsDark(themeMode.value)
    applyTheme(isDark.value)

    // Listen for system theme changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', () => {
      if (themeMode.value === 'system') {
        isDark.value = getSystemDark()
        applyTheme(isDark.value)
      }
    })

    initialized = true
  }

  function setTheme(mode: ThemeMode) {
    themeMode.value = mode
    isDark.value = resolveIsDark(mode)
    applyTheme(isDark.value)
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, mode)
    }
  }

  return {
    themeMode: readonly(themeMode),
    isDark: readonly(isDark),
    setTheme,
  }
}
