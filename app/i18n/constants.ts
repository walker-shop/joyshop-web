// i18n 常量单一事实源：无 locale 文件依赖，供 detector 单测脱环境引用
export const SUPPORTED_LOCALES = [
  { code: 'zh-Hans', label: '简体', vant: 'zh-CN' },
  { code: 'zh-Hant', label: '繁體', vant: 'zh-TW' },
  { code: 'en', label: 'EN', vant: 'en-US' },
  { code: 'th', label: 'ไทย', vant: 'th-TH' },
] as const

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]['code']
export const DEFAULT_LOCALE: LocaleCode = 'zh-Hans'
export const LANG_COOKIE = 'zshop_lang'
