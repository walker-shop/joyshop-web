import { describe, it, expect } from 'vitest'
import { fetchPublicStorefront } from './publicStorefront'

describe('public storefront snapshot', () => {
  it('starts all public reads together and keeps only display fields', async () => {
    const calls: any[] = []
    const resolves: ((v: any) => void)[] = []
    const fetcher = ((url: string, options: any) => {
      calls.push({ url, options })
      return new Promise(resolve => resolves.push(resolve))
    }) as any
    const pending = fetchPublicStorefront(fetcher, 'https://example.com/api', '3')
    expect(calls).toHaveLength(3)
    expect(calls.every(call => call.options.params.tenant_id === '3' && !call.options.headers)).toBe(true)
    resolves[0]!({ code: 200, data: { data: [{ id: 1, image: '/banner.webp', url: '/category', index: 1, internal: 'omit' }] } })
    resolves[1]!({ code: 200, data: { data: [{ id: 7, name: 'Product', stock: 9, price: 10 }] } })
    resolves[2]!({ code: 200, data: [{ id: 2, name: 'Category', parentId: 0, level: 1, icon: 'box' }] })
    expect(await pending).toEqual({ banners: [{ id: 1, image: '/banner.webp', url: '/category', index: 1 }], catalog: [{ id: 7, name: 'Product' }], categories: [{ id: 2, name: 'Category', parentId: 0, level: 1, icon: 'box' }] })
  })
  it('fails the snapshot instead of caching an unsuccessful upstream response', async () => {
    const fetcher = (async () => ({ code: 500, data: { data: [] } })) as any
    await expect(fetchPublicStorefront(fetcher, 'https://example.com/api', 3)).rejects.toThrow('unavailable')
  })
})
