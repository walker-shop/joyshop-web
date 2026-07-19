<template>
  <div class="lux auth-page">
    <div class="auth-amb" aria-hidden="true">
      <span class="orb orb-1" />
      <span class="orb orb-2" />
      <span class="orb orb-3" />
    </div>

    <header class="auth-head">
      <button class="lux-back" :aria-label="$t('common.back')" @click="navigateTo('/login')">
        <svg viewBox="0 0 24 24"><path d="M15.5 4.5 8 12l7.5 7.5-1.4 1.4L5.2 12l8.9-8.9z" /></svg>
      </button>
    </header>

    <section class="auth-hero">
      <div class="auth-mark">
        <span class="auth-mark-glow" />
        <img class="auth-logo-img" src="/logo.png" alt="ZShop" width="80" height="80">
      </div>
      <div class="auth-brand">ZShop</div>
      <div class="auth-rule"><span class="auth-rule-dot" /></div>
      <h1 class="auth-title">{{ $t('register.title') }}</h1>
      <p class="auth-sub">{{ $t('register.subtitle') }}</p>
    </section>

    <section class="auth-card">
      <label class="auth-field">
        <span class="auth-label">{{ $t('register.email') }}</span>
        <div class="auth-inwrap">
          <svg class="auth-ico" viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 4v10h16V8l-8 5z" /></svg>
          <input v-model="email" class="auth-input" type="text" autocomplete="email" :placeholder="$t('register.emailPlaceholder')" >
        </div>
      </label>
      <label class="auth-field">
        <span class="auth-label">{{ $t('register.username') }}</span>
        <div class="auth-inwrap">
          <svg class="auth-ico" viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z" /></svg>
          <input v-model="username" class="auth-input" type="text" autocomplete="nickname" :placeholder="$t('register.usernamePlaceholder')" >
        </div>
      </label>
      <label class="auth-field">
        <span class="auth-label">{{ $t('register.password') }}</span>
        <div class="auth-inwrap">
          <svg class="auth-ico" viewBox="0 0 24 24"><path d="M17 9V7a5 5 0 0 0-10 0v2H5v13h14V9h-2zm-8 0V7a3 3 0 0 1 6 0v2H9z" /></svg>
          <input v-model="password" class="auth-input" type="password" autocomplete="new-password" :placeholder="$t('register.passwordPlaceholder')" >
        </div>
      </label>
      <label class="auth-field">
        <span class="auth-label">{{ $t('register.confirm') }}</span>
        <div class="auth-inwrap">
          <svg class="auth-ico" viewBox="0 0 24 24"><path d="M17 9V7a5 5 0 0 0-10 0v2H5v13h14V9h-2zm-8 0V7a3 3 0 0 1 6 0v2H9z" /></svg>
          <input v-model="confirm" class="auth-input" type="password" autocomplete="new-password" :placeholder="$t('register.confirmPlaceholder')" >
        </div>
      </label>

      <button class="lux-btn lux-btn--block auth-submit" :disabled="loading" @click="onSubmit">
        <span v-if="loading" class="lux-spin" />
        <span v-else>{{ $t('register.submit') }}</span>
      </button>

      <div class="auth-alt">{{ $t('register.haveAccount') }}<span @click="toLogin">{{ $t('register.toLogin') }}</span></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
definePageMeta({ layout: 'blank' })
const { t } = useI18n()
const route = useRoute()
const { register } = useAuth()
const email = ref('')
const username = ref('')
const password = ref('')
const confirm = ref('')
const loading = ref(false)

function redirectTarget() {
  const r = route.query.redirect
  return typeof r === 'string' && r ? r : '/user'
}
async function onSubmit() {
  if (!email.value || !password.value) { showToast(t('register.needEmailPwd')); return }
  if (password.value.length < 8) { showToast(t('register.pwdMin')); return }
  if (password.value !== confirm.value) { showToast(t('register.pwdMismatch')); return }
  loading.value = true
  try {
    await register(email.value, username.value || email.value.split('@')[0], password.value)
    showToast(t('register.success'))
    navigateTo(redirectTarget())
  } catch (e: any) {
    showToast(e?.message || t('register.failed'))
  } finally {
    loading.value = false
  }
}
function toLogin() {
  navigateTo(`/login?redirect=${encodeURIComponent(redirectTarget())}`)
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; position: relative; overflow: hidden;
  background: var(--lux-auth-bg) center top / cover no-repeat, var(--lux-bg);
}
.auth-page::before {
  content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--lux-bg) 30%, transparent) 0%,
    transparent 20% 50%,
    color-mix(in srgb, var(--lux-bg) 80%, transparent) 100%);
}
.auth-amb { display: none; }

.auth-head, .auth-hero, .auth-card { position: relative; z-index: 1; }
.auth-head { height: 54px; display: flex; align-items: center; padding: 0 12px; }
.auth-head .lux-back { position: static; }

.auth-hero { padding: 8px 26px 20px; text-align: center; }
.auth-mark { position: relative; display: inline-grid; place-items: center; margin-bottom: 10px; }
.auth-mark-glow {
  position: absolute; width: 140px; height: 140px; border-radius: 50%;
  background: radial-gradient(circle, rgba(224, 190, 120, .5), rgba(227, 186, 125, .14) 45%, transparent 70%);
  filter: blur(10px); pointer-events: none;
}
.auth-logo-img {
  position: relative; width: 80px; height: 80px; border-radius: 20px; display: block;
  box-shadow: 0 12px 30px rgba(0, 0, 0, .32), 0 0 0 1px var(--lux-hair);
}
.auth-brand {
  font-size: 20px; font-weight: 700; letter-spacing: 4px; line-height: 1;
  background: linear-gradient(135deg, var(--lux-gold), var(--lux-accent-2) 55%, var(--lux-accent));
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.auth-rule { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 12px 0 14px; }
.auth-rule::before, .auth-rule::after { content: ''; width: 42px; height: 1px; background: linear-gradient(90deg, transparent, var(--lux-gold)); }
.auth-rule::after { transform: scaleX(-1); }
.auth-rule-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--lux-gold); box-shadow: 0 0 8px var(--lux-gold); }
.auth-title { font-size: 24px; font-weight: 700; letter-spacing: 2px; color: var(--lux-text); }
.auth-sub { margin-top: 8px; font-size: 13px; letter-spacing: .5px; color: var(--lux-text-2); }

.auth-card {
  margin: 6px 20px 40px; padding: 22px 20px 20px;
  background: color-mix(in srgb, var(--lux-surface) 80%, transparent);
  backdrop-filter: saturate(160%) blur(22px);
  border: 1px solid var(--lux-hair); border-radius: 24px;
  box-shadow: 0 20px 50px rgba(30, 18, 8, .14), inset 0 1px 0 color-mix(in srgb, #fff 30%, transparent);
}
.auth-field { display: block; margin-bottom: 14px; }
.auth-label { display: block; font-size: 11px; letter-spacing: 2px; color: var(--lux-text-3); margin-bottom: 7px; text-transform: uppercase; }
.auth-inwrap { position: relative; display: flex; align-items: center; }
.auth-ico { position: absolute; left: 14px; width: 19px; height: 19px; fill: var(--lux-text-3); pointer-events: none; transition: fill .15s ease; }
.auth-input {
  width: 100%; height: 50px; padding: 0 16px 0 42px; box-sizing: border-box;
  background: var(--lux-surface-2); border: 1px solid var(--lux-hair); border-radius: 14px;
  color: var(--lux-text); font-size: 15px; letter-spacing: .3px;
  transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
}
.auth-input::placeholder { color: var(--lux-text-3); }
.auth-inwrap:focus-within .auth-ico { fill: var(--lux-accent); }
.auth-input:focus {
  outline: none;
  border-color: var(--lux-accent);
  box-shadow: 0 0 0 3px rgba(224, 190, 120, .16);
}

@media (prefers-reduced-motion: reduce) {
  .orb { animation: none; }
  .auth-input, .auth-ico { transition: none; }
}

.auth-submit { margin-top: 28px; }
.auth-alt { margin-top: 22px; text-align: center; color: var(--lux-text-2); font-size: 14px; letter-spacing: .3px; }
.auth-alt span { color: var(--lux-gold); font-weight: 600; cursor: pointer; }
</style>
