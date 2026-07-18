import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type LocaleCode } from './constants'

const CODES = SUPPORTED_LOCALES.map((l) => l.code) as readonly LocaleCode[]

function isSupported(x: string): x is LocaleCode {
  return (CODES as readonly string[]).includes(x)
}

// 把任意 language tag 归一化到支持的 LocaleCode（匹配不到返回 null）
export function normalize(tag: string | null | undefined): LocaleCode | null {
  if (!tag) return null
  const t = tag.trim()
  if (isSupported(t)) return t
  const lower = t.toLowerCase()
  if (lower.startsWith('zh')) {
    // zh-Hant / zh-TW / zh-HK / zh-MO → 繁；其余 zh → 简
    if (/hant|tw|hk|mo/.test(lower)) return 'zh-Hant'
    return 'zh-Hans'
  }
  if (lower.startsWith('th')) return 'th'
  if (lower.startsWith('en')) return 'en'
  return null
}

// 从 Accept-Language 头取首个能匹配的
function fromAcceptLanguage(header: string | null | undefined): LocaleCode | null {
  if (!header) return null
  for (const part of header.split(',')) {
    const tag = part.split(';')[0]?.trim()
    const n = normalize(tag)
    if (n) return n
  }
  return null
}

// 优先级：cookie > Accept-Language > navigator > 默认
export function resolveLocale(
  cookie?: string | null,
  acceptLang?: string | null,
  navLang?: string | null,
): LocaleCode {
  return (
    normalize(cookie) ??
    fromAcceptLanguage(acceptLang) ??
    normalize(navLang) ??
    DEFAULT_LOCALE
  )
}
