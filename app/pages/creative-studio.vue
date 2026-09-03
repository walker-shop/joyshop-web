<template>
  <main class="creative-page">
    <header class="creative-hero">
      <NuxtLink to="/" class="back-link">← 返回 ZShop</NuxtLink>
      <p class="eyebrow">ZSHOP CREATIVE STUDIO</p>
      <h1>让商品，<em>直接成为广告主角。</em></h1>
      <p class="intro">面向商品上新、门店活动和品牌投放的竖版短视频制作入口。提交产品与使用场景，即可进入脚本、画面与成片制作流程。</p>
      <NuxtLink to="/category" class="primary-action">选择商品，开始出片 <PhArrowRight :size="19" /></NuxtLink>
    </header>
    <section class="creative-proof" aria-label="广告出片流程">
      <article><span>01</span><h2>选商品或活动</h2><p>从商城商品、促销活动或线下门店开始，明确这支广告要讲什么。</p></article>
      <article><span>02</span><h2>确定投放场景</h2><p>新品种草、节日大促、短视频带货或门店引流，按 9:16 传播场景制作。</p></article>
      <article><span>03</span><h2>交付可发布成片</h2><p>输出视频、字幕与封面素材，供商品页、社媒和广告投放直接使用。</p></article>
    </section>
    <section class="creative-note">
      <PhSparkle :size="22" weight="fill" />
      <p>当前入口用于提交制作需求；成片会在创意确认与制作完成后交付，不把未生成内容展示为已完成广告。</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { PhArrowRight, PhSparkle } from '@phosphor-icons/vue'
</script>

<style scoped>
.creative-page { width: min(100%, 920px); min-height: 100vh; margin: 0 auto; padding: clamp(20px, 5vw, 58px) clamp(18px, 5vw, 48px) 100px; }
.creative-hero { position: relative; overflow: hidden; padding: clamp(30px, 7vw, 72px); border-radius: 28px; color: #fff; background: radial-gradient(circle at 88% 8%, rgb(255 229 175 / .44), transparent 28%), linear-gradient(135deg, #18130f, #4c2c11); }
.creative-hero::after { content: ''; position: absolute; right: -80px; bottom: -130px; width: 310px; height: 310px; border: 1px solid rgb(255 255 255 / .22); border-radius: 50%; box-shadow: 0 0 0 42px rgb(255 255 255 / .06), 0 0 0 84px rgb(255 255 255 / .04); }
.back-link, .primary-action { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 8px; font-weight: 700; }
.back-link { color: rgb(255 255 255 / .76); font-size: 14px; }.eyebrow { position: relative; z-index: 1; margin: 54px 0 14px; color: #f7d795; font-size: 12px; font-weight: 800; letter-spacing: .15em; }
h1 { position: relative; z-index: 1; max-width: 9ch; margin: 0; font-family: var(--font-display); font-size: clamp(44px, 8vw, 78px); line-height: .98; letter-spacing: -.06em; } h1 em { display: block; color: #f7d795; font-style: normal; }
.intro { position: relative; z-index: 1; max-width: 620px; margin: 24px 0 0; color: rgb(255 255 255 / .76); font-size: 16px; line-height: 1.75; }.primary-action { margin-top: 30px; padding: 14px 18px; border-radius: 12px; background: #f7d795; color: #2b190a; }
.creative-proof { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 20px; }.creative-proof article { min-height: 220px; padding: 24px 20px; border: 1px solid var(--color-border); border-radius: 18px; background: var(--color-bg-card); }.creative-proof span { color: var(--color-primary-dark); font-family: var(--font-display); font-size: 24px; font-weight: 800; }.creative-proof h2 { margin: 34px 0 8px; font-size: 18px; }.creative-proof p { margin: 0; color: var(--color-text-secondary); font-size: 14px; line-height: 1.7; }
.creative-note { display: flex; gap: 12px; margin-top: 20px; padding: 18px; border-radius: 14px; background: var(--color-primary-soft); color: var(--color-primary-dark); }.creative-note p { margin: 0; font-size: 14px; line-height: 1.7; }
@media (max-width: 640px) { .creative-hero { border-radius: 20px; } .creative-proof { grid-template-columns: 1fr; } .creative-proof article { min-height: 0; } }
</style>