import { createI18n } from 'vue-i18n'
import type { MessageSchema } from './types'
import { syncVantLocale } from './vant-locale'
import { DEFAULT_LOCALE, type LocaleCode } from './constants'

export * from './constants'

// Each locale is an independent, build-time compiled chunk.
const loaders: Record<LocaleCode, () => Promise<{ default: MessageSchema }>> = {
  'zh-Hans': () => import('./locales/zh-Hans'),
  'zh-Hant': () => import('./locales/zh-Hant'),
  en: () => import('./locales/en'),
  th: () => import('./locales/th'),
}

export async function createAppI18n(locale: LocaleCode) {
  const codes = [...new Set([locale, DEFAULT_LOCALE])]
  const entries = await Promise.all(codes.map(async code => [code, (await loaders[code]()).default] as const))
  return createI18n({
    legacy: false,
    globalInjection: true,
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    messages: Object.fromEntries(entries),
  })
}

export type AppI18n = Awaited<ReturnType<typeof createAppI18n>>
const pendingSwitch = new WeakMap<AppI18n, number>()

export async function setLocale(i18n: AppI18n, code: LocaleCode): Promise<boolean> {
  const request = (pendingSwitch.get(i18n) || 0) + 1
  pendingSwitch.set(i18n, request)
  if (!i18n.global.availableLocales.includes(code)) {
    const messages = (await loaders[code]()).default
    i18n.global.setLocaleMessage(code, messages)
  }
  // A slower earlier selection must not overwrite a newer selection.
  if (pendingSwitch.get(i18n) !== request) return false
  await syncVantLocale(code)
  if (pendingSwitch.get(i18n) !== request) return false
  i18n.global.locale.value = code
  return true
}
