<template>
  <div class="layout">
    <header class="desktop-header">
      <div class="desktop-header__inner">
        <NuxtLink to="/" class="desktop-brand" aria-label="ZShop">
          <img src="/logo.png" alt="" width="36" height="36">
          <span>ZShop</span>
        </NuxtLink>

        <nav class="desktop-nav" :aria-label="$t('nav.home')">
          <NuxtLink to="/">{{ $t('nav.home') }}</NuxtLink>
          <NuxtLink to="/category">{{ $t('nav.category') }}</NuxtLink>
          <NuxtLink to="/creative-studio">广告出片</NuxtLink>
        </nav>

        <NuxtLink to="/search" class="desktop-search">
          <PhMagnifyingGlass :size="20" />
          <span>{{ $t('home.searchPlaceholder') }}</span>
        </NuxtLink>

        <nav class="desktop-actions" :aria-label="$t('nav.mine')">
          <div class="lang-switch" :class="{ open: langOpen }">
            <button type="button" class="desktop-action lang-trigger" @click="langOpen = !langOpen">
              <PhGlobe :size="22" />
              <span>{{ currentLocaleLabel }}</span>
            </button>
            <div v-if="langOpen" class="lang-menu">
              <button
                v-for="l in SUPPORTED_LOCALES"
                :key="l.code"
                type="button"
                class="lang-menu-opt"
                :class="{ active: locale === l.code }"
                @click="pickLocale(l.code)"
              >
                {{ l.label }}
              </button>
            </div>
          </div>
          <NuxtLink to="/cart" class="desktop-action">
            <PhShoppingBag :size="22" />
            <span>{{ $t('nav.cart') }}</span>
            <b v-if="cartCount > 0">{{ cartCount > 99 ? '99+' : cartCount }}</b>
          </NuxtLink>
          <NuxtLink to="/user" class="desktop-action">
            <PhUserCircle :size="22" />
            <span>{{ $t('nav.mine') }}</span>
          </NuxtLink>
        </nav>
      </div>
    </header>

    <div class="mobile-lang-switch" :class="{ open: langOpen }">
      <button type="button" class="mobile-lang-trigger" @click="langOpen = !langOpen">
        <PhGlobe :size="18" />
        <span>{{ currentLocaleLabel }}</span>
      </button>
      <div v-if="langOpen" class="lang-menu">
        <button
          v-for="l in SUPPORTED_LOCALES"
          :key="l.code"
          type="button"
          class="lang-menu-opt"
          :class="{ active: locale === l.code }"
          @click="pickLocale(l.code)"
        >
          {{ l.label }}
        </button>
      </div>
    </div>

    <main id="main-content" class="layout-content">
      <slot />
    </main>

    <van-tabbar v-model="activeTab" route :border="false" class="app-tabbar">
      <van-tabbar-item to="/">
        <template #icon="{ active }"><PhStorefront :weight="active ? 'fill' : 'regular'" :size="24" /></template>
        {{ $t('nav.home') }}
      </van-tabbar-item>
      <van-tabbar-item to="/category">
        <template #icon="{ active }"><PhSquaresFour :weight="active ? 'fill' : 'regular'" :size="24" /></template>
        {{ $t('nav.category') }}
      </van-tabbar-item>
      <van-tabbar-item to="/cart" :badge="cartCount > 0 ? cartCount : ''">
        <template #icon="{ active }"><PhShoppingBag :weight="active ? 'fill' : 'regular'" :size="24" /></template>
        {{ $t('nav.cart') }}
      </van-tabbar-item>
      <van-tabbar-item to="/user">
        <template #icon="{ active }"><PhUserCircle :weight="active ? 'fill' : 'regular'" :size="24" /></template>
        {{ $t('nav.mine') }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import {
  PhGlobe,
  PhMagnifyingGlass,
  PhShoppingBag,
  PhSquaresFour,
  PhStorefront,
  PhUserCircle,
} from '@phosphor-icons/vue'
import { SUPPORTED_LOCALES, type LocaleCode } from '~/i18n/constants'

const activeTab = ref(0)
const { count: cartCount, refresh: refreshCart } = useCartCount()
onMounted(refreshCart)

const { $setAppLocale } = useNuxtApp()
const { locale } = useI18n()
const langOpen = ref(false)
const currentLocaleLabel = computed(() => SUPPORTED_LOCALES.find(l => l.code === locale.value)?.label ?? SUPPORTED_LOCALES[0].label)

function pickLocale(code: LocaleCode) {
  $setAppLocale(code)
  langOpen.value = false
}
</script>

<style scoped>
.layout {
  --app-tabbar-height: 64px;
  min-height: 100vh;
  background: var(--color-bg-page);
}

.layout-content {
  min-height: 100vh;
  padding-bottom: calc(var(--app-tabbar-height) + env(safe-area-inset-bottom));
}

.lang-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 90;
  display: flex;
  flex-direction: column;
  min-width: 96px;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  box-shadow: 0 12px 28px oklch(0.2 0.03 70 / 0.16);
}

.lang-menu-opt {
  appearance: none;
  -webkit-appearance: none;
  border: none;
  outline: none;
  cursor: pointer;
  background: none;
  padding: 8px 10px;
  border-radius: 8px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.lang-menu-opt:hover { background: var(--color-primary-soft); color: var(--color-primary-dark); }
.lang-menu-opt.active { background: var(--color-primary-soft); color: var(--color-primary-dark); }

.mobile-lang-switch {
  position: fixed;
  top: max(env(safe-area-inset-top), 10px);
  right: 10px;
  z-index: 85;
}

.lang-trigger,
.mobile-lang-trigger {
  appearance: none;
  -webkit-appearance: none;
  border: none;
  outline: none;
  cursor: pointer;
}

.lang-trigger:focus-visible,
.mobile-lang-trigger:focus-visible,
.lang-menu-opt:focus-visible {
  outline: 2px solid var(--color-primary-dark);
  outline-offset: 2px;
}

.mobile-lang-trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding-inline: 10px;
  border-radius: 999px;
  background: color-mix(in oklch, var(--color-bg-card) 92%, transparent);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 14px oklch(0.2 0.03 70 / 0.12);
  backdrop-filter: blur(10px);
}

.mobile-lang-switch .lang-menu { min-width: 88px; }

@media (min-width: 768px) {
  .mobile-lang-switch { display: none; }
}

.desktop-header { display: none; }

.app-tabbar {
  height: var(--app-tabbar-height);
  padding-bottom: env(safe-area-inset-bottom);
  background: color-mix(in oklch, var(--color-bg-card) 94%, transparent);
  border-top: 1px solid var(--color-border);
  backdrop-filter: blur(16px);
}

.app-tabbar :deep(.van-tabbar-item) {
  min-width: 44px;
  color: var(--color-text-tertiary);
  background: transparent;
}

.app-tabbar :deep(.van-tabbar-item__text) {
  margin-top: 3px;
  font-size: 11px;
  font-weight: 600;
}

.app-tabbar :deep(.van-tabbar-item--active) {
  color: var(--color-primary-dark) !important;
  background: transparent;
}

.app-tabbar :deep(.van-badge) {
  min-width: 17px;
  padding: 2px 5px;
  border: 2px solid var(--color-bg-card) !important;
  background: var(--color-price) !important;
  color: var(--color-text-inverse) !important;
  font-size: 10px;
  font-weight: 700;
}

@media (min-width: 768px) {
  .desktop-header {
    position: sticky;
    top: 0;
    z-index: 80;
    display: block;
    border-bottom: 1px solid var(--color-border);
    background: color-mix(in oklch, var(--color-bg-card) 94%, transparent);
    backdrop-filter: blur(18px);
  }

  .desktop-header__inner {
    width: min(calc(100% - 48px), var(--page-max));
    height: 72px;
    margin-inline: auto;
    display: grid;
    grid-template-columns: auto minmax(220px, 1fr) auto;
    align-items: center;
    gap: var(--space-lg);
  }

  .desktop-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 780;
    letter-spacing: -0.02em;
  }

  .desktop-brand img {
    border-radius: 10px;
    box-shadow: 0 4px 14px oklch(0.3 0.04 70 / 0.14);
  }

  .desktop-nav { display: none; }
  .desktop-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .lang-switch { position: relative; }

  .desktop-nav a,
  .desktop-action {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding-inline: 13px;
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-size: 14px;
    font-weight: 650;
    transition: background 160ms ease, color 160ms ease;
  }

  .desktop-nav a:hover,
  .desktop-action:hover,
  .desktop-nav a.router-link-exact-active,
  .desktop-action.router-link-active {
    background: var(--color-primary-soft);
    color: var(--color-primary-dark);
  }

  .desktop-search {
    min-width: 0;
    height: 44px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding-inline: 15px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-search-bg);
    color: var(--color-text-secondary);
    font-size: 14px;
    transition: border-color 160ms ease, background 160ms ease;
  }

  .desktop-search:hover {
    border-color: var(--color-border-strong);
    background: var(--color-bg-card);
  }

  .desktop-search span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .desktop-action { position: relative; }
  .desktop-action > span { display: none; }
  .desktop-action b {
    min-width: 18px;
    height: 18px;
    display: grid;
    place-items: center;
    padding-inline: 4px;
    border-radius: 9px;
    background: var(--color-price);
    color: var(--color-text-inverse);
    font-size: 10px;
  }

  .layout-content {
    min-height: calc(100vh - 72px);
    padding-bottom: 0;
  }

  .app-tabbar { display: none; }
}

@media (min-width: 1024px) {
  .desktop-header__inner { grid-template-columns: auto auto minmax(320px, 1fr) auto; }
  .desktop-nav { display: flex; }
  .desktop-action > span { display: inline; }
}
</style>
