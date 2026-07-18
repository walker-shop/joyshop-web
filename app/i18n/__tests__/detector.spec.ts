import { describe, it, expect } from 'vitest'
import { resolveLocale, normalize } from '../detector'

describe('normalize', () => {
  it('直接支持码原样返回', () => {
    expect(normalize('zh-Hant')).toBe('zh-Hant')
    expect(normalize('th')).toBe('th')
  })
  it('zh 系细分繁简', () => {
    expect(normalize('zh-TW')).toBe('zh-Hant')
    expect(normalize('zh-HK')).toBe('zh-Hant')
    expect(normalize('zh-CN')).toBe('zh-Hans')
    expect(normalize('zh')).toBe('zh-Hans')
  })
  it('en/th 前缀匹配，无关返回 null', () => {
    expect(normalize('en-US')).toBe('en')
    expect(normalize('th-TH')).toBe('th')
    expect(normalize('fr-FR')).toBeNull()
    expect(normalize('')).toBeNull()
  })
})

describe('resolveLocale 优先级', () => {
  it('cookie 优先', () => {
    expect(resolveLocale('en', 'th-TH', 'zh-CN')).toBe('en')
  })
  it('无 cookie 用 Accept-Language 首个可匹配', () => {
    expect(resolveLocale(null, 'fr-FR,th-TH;q=0.9', null)).toBe('th')
  })
  it('再退 navigator', () => {
    expect(resolveLocale(null, null, 'zh-TW')).toBe('zh-Hant')
  })
  it('全无 → 默认 zh-Hans', () => {
    expect(resolveLocale(null, null, null)).toBe('zh-Hans')
  })
})
