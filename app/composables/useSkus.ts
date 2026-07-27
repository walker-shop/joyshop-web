// SKU/规格：对接 goods-web /v1/goods/:id/specs|skus。扁平商品返回空。
export interface SpecValue { id: number; value: string; sort: number }
export interface GoodsSpec { id: number; name: string; sort: number; values: SpecValue[] }
export interface GoodsSku {
  id: number
  sku_sn: string
  spec_signature: string
  value_ids: number[]
  shop_price: number
  market_price: number
  image: string
  enabled: boolean
}

// 与后端 skuSignature 一致：value_id 升序逗号串。
export function skuSignature(valueIds: number[]): string {
  return [...valueIds].sort((a, b) => a - b).join(',')
}

export function useSkus() {
  const { apiFetch } = useApi()

  async function loadSpecs(goodsId: number | string): Promise<GoodsSpec[]> {
    const res = await apiFetch<{ data?: GoodsSpec[] | null }>(`/v1/goods/${goodsId}/specs`)
    return res.data ?? []
  }
  async function loadSkus(goodsId: number | string): Promise<GoodsSku[]> {
    const res = await apiFetch<{ data?: GoodsSku[] | null }>(`/v1/goods/${goodsId}/skus`)
    return res.data ?? []
  }
  // 客户端按已选 value_id 组合命中 SKU（签名匹配）。
  function matchSku(skus: GoodsSku[], valueIds: number[]): GoodsSku | null {
    if (!valueIds.length) return null
    const sig = skuSignature(valueIds)
    return skus.find(s => s.spec_signature === sig && s.enabled) ?? null
  }

  return { loadSpecs, loadSkus, matchSku, skuSignature }
}
