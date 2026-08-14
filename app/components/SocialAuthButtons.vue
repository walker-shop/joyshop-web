<script setup lang="ts">
declare global {
  interface Window {
    google?: {
      accounts: { id: {
        initialize: (options: { client_id: string; callback: (response: { credential: string }) => void; ux_mode?: string }) => void
        renderButton: (target: HTMLElement, options: Record<string, unknown>) => void
      } }
    }
  }
}

const emit = defineEmits<{ authenticated: []; error: [message: string] }>()
const { t, locale } = useI18n()
const { socialLogin } = useAuth()
const { tenantCode } = useTenant()
const config = useRuntimeConfig()
const iamBase = config.public.iamBase as string
const googleClientID = config.public.googleClientId as string

const pending = ref(false)
const googleButton = ref<HTMLElement | null>(null)
let popup: Window | null = null

const googleLocale: Record<string, string> = { 'zh-Hans': 'zh_CN', 'zh-Hant': 'zh_TW', en: 'en', th: 'th' }

async function finish(provider: 'google' | 'telegram', payload: Record<string, unknown>) {
  pending.value = true
  try {
    await socialLogin(provider, payload)
    emit('authenticated')
  } catch (e: any) {
    emit('error', e?.message || t('socialAuth.failed'))
  } finally {
    pending.value = false
  }
}

function handleGoogleCredential(credential: string) {
  void finish('google', { id_token: credential })
}

function renderGoogleButton() {
  if (!googleClientID || !window.google || !googleButton.value) return
  googleButton.value.replaceChildren()
  window.google.accounts.id.initialize({ client_id: googleClientID, callback: ({ credential }) => handleGoogleCredential(credential), ux_mode: 'popup' })
  window.google.accounts.id.renderButton(googleButton.value, {
    type: 'standard', theme: 'outline', size: 'large', shape: 'rectangular',
    text: 'continue_with', width: Math.min(400, Math.round(googleButton.value.clientWidth)), locale: googleLocale[locale.value] || 'en',
  })
}

function loadGoogleIdentity() {
  if (!googleClientID) return
  const existing = document.querySelector<HTMLScriptElement>('#google-identity-services')
  if (existing) {
    if (window.google) renderGoogleButton()
    else existing.addEventListener('load', renderGoogleButton, { once: true })
    return
  }
  const script = document.createElement('script')
  script.id = 'google-identity-services'
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.addEventListener('load', renderGoogleButton, { once: true })
  document.head.append(script)
}

function openTelegram() {
  const params = new URLSearchParams({ tenant_code: tenantCode, origin: window.location.origin })
  popup = window.open(`${iamBase}/api/auth/telegram/oidc/start?${params.toString()}`, 'zshop-telegram-login', 'popup,width=520,height=680')
  if (!popup) emit('error', t('socialAuth.popupBlocked'))
}

async function handleTelegramMessage(event: MessageEvent) {
  const trustedOrigins = new Set([window.location.origin, new URL(iamBase, window.location.origin).origin])
  if (!trustedOrigins.has(event.origin) || event.data?.type !== 'zshop-telegram-oidc') return
  popup?.close()
  if (event.data.error || !event.data.ticket) {
    emit('error', event.data.error || t('socialAuth.failed'))
    return
  }
  await finish('telegram', { oidc_ticket: event.data.ticket })
}

watch(locale, () => nextTick(renderGoogleButton))
onMounted(() => {
  loadGoogleIdentity()
  window.addEventListener('message', handleTelegramMessage)
})
onUnmounted(() => window.removeEventListener('message', handleTelegramMessage))
</script>

<template>
  <div class="social-auth-block">
    <div class="social-divider"><span>{{ t('socialAuth.orContinueWith') }}</span></div>
    <div class="social-buttons" :class="{ 'is-pending': pending }">
      <button class="social-btn telegram-btn" type="button" :disabled="pending" @click="openTelegram">
        <span class="social-mark telegram-mark">
          <svg viewBox="0 0 24 24"><path fill="currentColor" d="M21.8 3.4 18.6 19c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.2L6.1 12.7l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6L20.5 2.2c.9-.3 1.7.2 1.3 1.2Z" /></svg>
        </span>
        <span class="provider-label">{{ t('socialAuth.continueTelegram') }}</span>
      </button>
      <div v-if="googleClientID" class="social-btn google-btn">
        <div ref="googleButton" class="google-gis" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.social-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0 14px; color: var(--lux-text-3); font-size: 11px; letter-spacing: .5px; }
.social-divider::before, .social-divider::after { content: ''; height: 1px; flex: 1; background: var(--lux-hair); }
.social-buttons {
  --provider-border: rgb(218 220 224);
  --provider-bg: rgb(255 255 255);
  --provider-bg-hover: rgb(248 249 250);
  --provider-text: rgb(60 64 67);
  width: min(100%, 400px);
  display: grid;
  gap: 10px;
  margin-inline: auto;
  transition: opacity 160ms ease;
}
.social-buttons.is-pending { pointer-events: none; opacity: .58; }
.social-btn { width: 100%; }
.telegram-btn {
  height: 40px;
  display: grid; grid-template-columns: 28px minmax(0, 1fr); align-items: center; gap: 16px; padding: 0 12px;
  border: 1px solid var(--provider-border); border-radius: 4px; background: var(--provider-bg);
  color: var(--provider-text); font-size: 14px; font-weight: 500; letter-spacing: .2px;
  cursor: pointer;
  transition: border-color 160ms ease, background-color 160ms ease;
}
.provider-label { min-width: 0; justify-self: stretch; text-align: left; }
.telegram-btn:hover:not(:disabled) { border-color: var(--provider-border); background: var(--provider-bg-hover); }
.telegram-btn:focus-visible { outline: 3px solid color-mix(in oklch, var(--color-primary) 55%, transparent); outline-offset: 2px; }
.telegram-btn:disabled { opacity: .55; }
.telegram-mark { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: #29a9eb; color: #fff; }
.telegram-mark svg { width: 14px; height: 14px; }
.google-btn { position: relative; height: 44px; overflow: hidden; border-radius: 4px; }
.google-gis { width: 100%; height: 44px; overflow: hidden; }
.google-gis :deep(iframe) {
  display: block;
  width: 420px !important;
  max-width: none !important;
  height: 44px !important;
  margin: 0 0 0 -10px !important;
}

@media (prefers-reduced-motion: reduce) {
  .social-buttons, .telegram-btn { transition: none; }
}
</style>
