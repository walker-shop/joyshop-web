import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('../vant-locale', () => ({ syncVantLocale: vi.fn().mockResolvedValue(undefined) }))
import { syncVantLocale } from '../vant-locale'
import { createAppI18n, setLocale } from '../index'

afterEach(() => vi.mocked(syncVantLocale).mockReset().mockResolvedValue(undefined))

describe('locale loading', () => {
  it('initializes only the requested locale and fallback', async () => {
    const chinese = await createAppI18n('zh-Hans')
    expect(chinese.global.availableLocales).toEqual(['zh-Hans'])
    const english = await createAppI18n('en')
    expect(english.global.availableLocales).toEqual(['en', 'zh-Hans'])
    expect(english.global.t('nav.home')).toBe('Home')
    expect(chinese.global.locale.value).toBe('zh-Hans')
  })
  it('loads additional languages on selection and keeps translations usable', async () => {
    const i18n = await createAppI18n('zh-Hans')
    for (const code of ['en', 'th', 'zh-Hant', 'zh-Hans'] as const) {
      expect(await setLocale(i18n, code)).toBe(true)
      expect(i18n.global.locale.value).toBe(code)
      expect(i18n.global.t('home.heroTitle1')).not.toBe('home.heroTitle1')
    }
  })
  it('keeps the active language when loading fails', async () => {
    const i18n = await createAppI18n('zh-Hans')
    vi.mocked(syncVantLocale).mockRejectedValueOnce(new Error('network failure'))
    await expect(setLocale(i18n, 'en')).rejects.toThrow('network failure')
    expect(i18n.global.locale.value).toBe('zh-Hans')
  })
})
