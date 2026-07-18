import { createAppI18n, setLocale } from '~/i18n'
import { resolveLocale } from '~/i18n/detector'
import { LANG_COOKIE, type LocaleCode } from '~/i18n/constants'

export default defineNuxtPlugin(async (nuxtApp) => {
  // locale 权威来源：cookie（SSR 服务端/客户端同读，防 hydration mismatch）
  const cookie = useCookie<LocaleCode | null>(LANG_COOKIE, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    default: () => null,
  })
  const headers = import.meta.server ? useRequestHeaders(['accept-language']) : {}
  const acceptLang = headers['accept-language'] ?? null
  const navLang = import.meta.client ? navigator.language : null

  const locale = resolveLocale(cookie.value, acceptLang, navLang)
  if (!cookie.value) cookie.value = locale // 首访落 cookie，后续稳定

  const i18n = createAppI18n(locale)
  nuxtApp.vueApp.use(i18n)
  await setLocale(i18n, locale)

  // 暴露语言切换给页面（写 cookie + 切 locale + 同步 Vant）
  return {
    provide: {
      setAppLocale: async (code: LocaleCode) => {
        cookie.value = code
        await setLocale(i18n, code)
      },
    },
  }
})
