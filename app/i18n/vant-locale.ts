import { Locale } from 'vant'
import { SUPPORTED_LOCALES, type LocaleCode } from './constants'

// Vant 内置 lang 动态导入（zh-CN/zh-TW/en-US/th-TH 已确认存在于 Vant 4.9.22）
const loaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  'zh-CN': () => import('vant/es/locale/lang/zh-CN'),
  'zh-TW': () => import('vant/es/locale/lang/zh-TW'),
  'en-US': () => import('vant/es/locale/lang/en-US'),
  'th-TH': () => import('vant/es/locale/lang/th-TH'),
}

export async function syncVantLocale(code: LocaleCode): Promise<void> {
  const vantCode = SUPPORTED_LOCALES.find((l) => l.code === code)?.vant ?? 'zh-CN'
  const mod = await loaders[vantCode]?.()
  if (mod?.default) Locale.use(vantCode, mod.default)
}
