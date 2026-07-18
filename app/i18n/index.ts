import { createI18n } from 'vue-i18n'
import type { MessageSchema } from './types'
import { syncVantLocale } from './vant-locale'
import { DEFAULT_LOCALE, type LocaleCode } from './constants'
import zhHans from './locales/zh-Hans'
import zhHant from './locales/zh-Hant'
import en from './locales/en'
import th from './locales/th'

export * from './constants'

const messages: Record<LocaleCode, MessageSchema> = {
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  en,
  th,
}

export function createAppI18n(locale: LocaleCode) {
  return createI18n({
    legacy: false,
    globalInjection: true,
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
  })
}

export type AppI18n = ReturnType<typeof createAppI18n>

// 切 locale（不负责写 cookie；由调用方用 Nuxt useCookie 持久化）
// mode-agnostic：composition 下 locale 是 ref（.value）、legacy/wrapper 下是 string（直赋）
export async function setLocale(i18n: AppI18n, code: LocaleCode) {
  const g = i18n.global as unknown as { locale: string | { value: string } }
  if (typeof g.locale === 'string') g.locale = code
  else g.locale.value = code
  await syncVantLocale(code)
}
