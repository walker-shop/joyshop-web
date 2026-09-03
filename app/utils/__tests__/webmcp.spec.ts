import { describe, expect, it } from 'vitest'
import { normalizeProduct, positiveInteger, searchTerm } from '../webmcp'

describe('WebMCP product helpers', () => {
  it('returns only stable product facts', () => {
    expect(normalizeProduct({ id: 7, name: 'Travel mug', shopPrice: 88, marketPrice: 120, isHot: true }, 'https://shop.test')).toEqual({
      id: 7, name: 'Travel mug', price: 88, marketPrice: 120, image: null,
      badges: ['popular'], requiresOptions: false, productUrl: 'https://shop.test/goods/7',
    })
  })

  it('uses the minimum option price and marks selection requirements', () => {
    const product = normalizeProduct({ id: 8, name: 'Jacket', shopPrice: 300, hasSku: true, minSkuPrice: 220 }, 'https://shop.test')
    expect(product.price).toBe(220)
    expect(product.requiresOptions).toBe(true)
  })

  it('rejects unsafe or empty arguments', () => {
    expect(() => positiveInteger(0, 'productId')).toThrow('positive integer')
    expect(() => searchTerm('   ')).toThrow('query is required')
  })
})
