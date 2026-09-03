export interface CatalogProduct {
  id: number
  name: string
  price: number
  marketPrice: number | null
  image: string | null
  badges: string[]
  requiresOptions: boolean
  productUrl: string
}

export function normalizeProduct(item: Record<string, any>, origin: string): CatalogProduct {
  const price = Number(item.hasSku && item.minSkuPrice ? item.minSkuPrice : item.shopPrice || 0)
  const marketPrice = Number(item.marketPrice || 0)
  return {
    id: Number(item.id),
    name: String(item.name || ''),
    price,
    marketPrice: marketPrice > price ? marketPrice : null,
    image: item.goodsFrontImage || null,
    badges: [item.isHot && 'popular', item.isNew && 'new', item.shipFree && 'free-shipping'].filter(Boolean) as string[],
    requiresOptions: Boolean(item.hasSku),
    productUrl: `${origin}/goods/${item.id}`,
  }
}

export function positiveInteger(value: unknown, field: string): number {
  const number = Number(value)
  if (!Number.isInteger(number) || number < 1) throw new Error(`${field} must be a positive integer`)
  return number
}

export function searchTerm(value: unknown): string {
  const term = String(value || '').trim()
  if (!term) throw new Error('query is required')
  if (term.length > 100) throw new Error('query must be 100 characters or fewer')
  return term
}
