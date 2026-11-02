<template>
<section class="desktop-commerce" aria-label="ZShop desktop storefront">
        <aside class="desktop-category-rail">
          <header>
            <PhSquaresFour :size="22" weight="fill" />
            <div>
              <small>SHOP BY</small>
              <strong>{{ $t('category.title') }}</strong>
            </div>
          </header>
          <nav :aria-label="$t('category.title')">
            <NuxtLink
              v-for="cat in topCategories"
              :key="cat.id"
              :to="`/category?id=${cat.id}`"
            >
              <component :is="cat.comp" :size="21" />
              <span>{{ cat.name }}</span>
              <PhCaretRight :size="15" />
            </NuxtLink>
          </nav>
          <NuxtLink to="/category" class="rail-all">
            {{ $t('home.viewAll').replace('›', '').trim() }}
            <PhArrowRight :size="17" />
          </NuxtLink>
        </aside>

        <div class="desktop-hero">
          <div class="desktop-hero__media">
            <NuxtLink v-if="(!heroReady || !isDesktop) && banners.length" :to="bannerTarget(banners[0].url)" class="desktop-hero__link">
              <img class="hero-initial-image" :src="bannerImage(banners[0].image)" :alt="`${$t('home.heroTitle1')}${$t('home.heroTitle2')}`" width="1200" height="675" fetchpriority="high" />
            </NuxtLink>
            <van-swipe v-else-if="banners.length" :autoplay="5000" lazy-render class="desktop-swipe" indicator-color="#ffffff">
              <van-swipe-item v-for="item in banners" :key="item.id">
                <NuxtLink :to="bannerTarget(item.url)" class="desktop-hero__link">
                  <van-image :src="bannerImage(item.image)" fit="cover" :alt="`${$t('home.heroTitle1')}${$t('home.heroTitle2')}`">
                    <template #loading><div class="image-skeleton" /></template>
                    <template #error><div class="hero-fallback">ZShop</div></template>
                  </van-image>
                </NuxtLink>
              </van-swipe-item>
            </van-swipe>
            <div v-else class="hero-fallback">ZShop</div>
          </div>
          <div class="desktop-hero__copy">
            <h1>{{ $t('home.heroTitle1') }}<strong>{{ $t('home.heroTitle2') }}</strong></h1>
            <p>{{ $t('home.heroSubtitle') }}</p>
            <NuxtLink to="/category" class="hero-cta">
              {{ $t('home.viewAll').replace('›', '').trim() }}
              <PhArrowRight :size="18" />
            </NuxtLink>
          </div>
        </div>

        <aside class="desktop-service-panel">
          <header>
            <small>MY ZSHOP</small>
            <h2>{{ $t('nav.mine') }}</h2>
            <p>{{ $t('home.heroSubtitle') }}</p>
          </header>
          <nav class="account-shortcuts">
            <NuxtLink to="/order"><PhReceipt :size="21" /><span>{{ $t('user.myOrders') }}</span></NuxtLink>
            <NuxtLink to="/cart"><PhShoppingBag :size="21" /><span>{{ $t('nav.cart') }}</span></NuxtLink>
            <NuxtLink to="/user/favorites"><PhHeart :size="21" /><span>{{ $t('user.favorites') }}</span></NuxtLink>
          </nav>
          <div class="service-promises">
            <span><PhShieldCheck :size="20" /><b>{{ $t('login.perkGenuine') }}</b></span>
            <span><PhArrowUUpLeft :size="20" /><b>{{ $t('login.perkRefund') }}</b></span>
            <span><PhTruck :size="20" /><b>{{ $t('pdp.shipTip') }}</b></span>
          </div>
        </aside>
      </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { PhArrowRight, PhArrowUUpLeft, PhCaretRight, PhHeart, PhReceipt, PhShieldCheck, PhShoppingBag, PhSquaresFour, PhTruck } from '@phosphor-icons/vue'
import { bannerImage } from '~/utils/bannerImages'

defineProps<{
  banners: { id: number; image: string; url: string; index: number }[]
  topCategories: { id: number; name: string; comp: Component }[]
  locale: string
}>()
const heroReady = ref(false)
const isDesktop = ref(false)
let desktopQuery: MediaQueryList | undefined
const updateDesktop = () => { isDesktop.value = desktopQuery?.matches ?? false }
onMounted(() => {
  desktopQuery = window.matchMedia('(min-width: 1024px)')
  updateDesktop()
  desktopQuery.addEventListener('change', updateDesktop)
  heroReady.value = true
})
onBeforeUnmount(() => desktopQuery?.removeEventListener('change', updateDesktop))
function bannerTarget(url: string): string {
  return /^\/(category|goods)(\/|\?|$)/.test(url || '') ? url : '/category'
}
</script>

<style scoped>
.desktop-commerce { display: none; }
.hero-cta {
  min-height: 44px;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-top: var(--space-lg);
  padding-inline: 17px;
  border-radius: var(--radius-md);
  background: var(--color-accent-ink);
  color: var(--color-text-inverse);
  font-weight: 680;
}

.hero-initial-image { display: block; width: 100%; height: 100%; object-fit: cover; }

.hero-fallback { width: 100%; height: 100%; display: grid; place-items: center; background: var(--color-search-bg); }
.image-skeleton { width: 100%; height: 100%; background: var(--color-search-bg); }
@media (min-width: 1024px) {
  .desktop-commerce {
    height: clamp(470px, 38vw, 560px);
    display: grid;
    grid-template-columns: minmax(180px, 220px) minmax(0, 1fr) minmax(220px, 270px);
    gap: var(--space-sm);
    margin-bottom: var(--space-2xl);
  }

  .desktop-category-rail,
  .desktop-service-panel,
  .desktop-hero {
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-bg-card);
  }

  .desktop-category-rail { display: flex; flex-direction: column; }
  .desktop-category-rail > header {
    min-height: 72px;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: var(--space-md);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-accent-ink);
    color: var(--color-text-inverse);
  }
  .desktop-category-rail > header div { min-width: 0; display: grid; gap: 3px; }
  .desktop-category-rail > header small,
  .desktop-service-panel > header small { font-family: var(--font-display); font-size: 9px; font-weight: 720; letter-spacing: .14em; }
  .desktop-category-rail > header strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; }
  .desktop-category-rail nav { min-height: 0; flex: 1; overflow-y: auto; padding: 7px; scrollbar-width: thin; }
  .desktop-category-rail nav a {
    min-height: 45px;
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) 16px;
    align-items: center;
    gap: 8px;
    padding-inline: 10px;
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
    font-size: 13px;
    transition: background 160ms ease, color 160ms ease;
  }
  .desktop-category-rail nav a span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .desktop-category-rail nav a svg:last-child { color: var(--color-text-tertiary); }
  .desktop-category-rail nav a:hover { background: var(--color-primary-soft); color: var(--color-primary-dark); }
  .rail-all {
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: var(--space-md);
    border-top: 1px solid var(--color-border);
    color: var(--color-primary-dark);
    font-size: 13px;
    font-weight: 700;
  }

  .desktop-hero { position: relative; background: var(--color-search-bg); }
  .desktop-hero__media,
  .desktop-swipe,
  .desktop-hero__link,
  .desktop-hero__link :deep(.van-image),
  .desktop-hero__link :deep(img) { width: 100%; height: 100%; display: block; }
  .desktop-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(90deg, color-mix(in oklch, var(--color-bg-card) 97%, transparent) 0%, color-mix(in oklch, var(--color-bg-card) 88%, transparent) 30%, transparent 68%);
  }
  .desktop-hero__copy {
    position: absolute;
    z-index: 2;
    left: clamp(24px, 4vw, 62px);
    top: 50%;
    width: min(43%, 390px);
    padding: clamp(22px, 2.2vw, 34px);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-bg-card);
    box-shadow: var(--shadow-soft);
    transform: translateY(-50%);
  }
  .desktop-hero__copy h1 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(34px, 3.4vw, 58px);
    line-height: .98;
    letter-spacing: -.05em;
  }
  .desktop-hero__copy h1 strong { display: block; color: var(--color-primary-dark); font-weight: inherit; }
  .desktop-hero__copy p { margin: 15px 0 0; color: var(--color-text-secondary); }

  .desktop-service-panel { display: flex; flex-direction: column; }
  .desktop-service-panel > header { padding: var(--space-lg) var(--space-md) var(--space-md); }
  .desktop-service-panel > header small { color: var(--color-primary-dark); }
  .desktop-service-panel > header h2 { margin: 6px 0 0; font-family: var(--font-display); font-size: 25px; }
  .desktop-service-panel > header p { margin: 6px 0 0; color: var(--color-text-secondary); font-size: 12px; }
  .account-shortcuts { display: grid; grid-template-columns: repeat(3, 1fr); margin-inline: var(--space-sm); border-block: 1px solid var(--color-border); }
  .account-shortcuts a { min-width: 0; min-height: 82px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--color-text-secondary); text-align: center; font-size: 11px; }
  .account-shortcuts a + a { border-left: 1px solid var(--color-border); }
  .account-shortcuts a:hover { color: var(--color-primary-dark); background: var(--color-primary-soft); }
  .account-shortcuts span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-inline: 4px; }
  .service-promises { flex: 1; display: grid; align-content: center; padding: var(--space-md); }
  .service-promises span { min-height: 50px; display: grid; grid-template-columns: 26px minmax(0, 1fr); align-items: center; gap: 9px; border-bottom: 1px solid var(--color-border); color: var(--color-primary-dark); }
  .service-promises span:last-child { border-bottom: 0; }
  .service-promises b { color: var(--color-text-secondary); font-size: 12px; font-weight: 570; line-height: 1.4; }

}
@media (min-width: 1440px) {
  .desktop-commerce { grid-template-columns: 230px minmax(0, 1fr) 280px; gap: var(--space-md); }
}
</style>
