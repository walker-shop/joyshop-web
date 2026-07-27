// 评价：对接 goods-web /v1/goods/review*（goods-web 统一 {code,msg,data} 信封）。
export interface ReviewItem {
  rating: number
  content: string
  nickname: string
  createdAt: string
}
export interface GoodsReviews {
  avgRating: number
  total: number
  data: ReviewItem[]
}

interface Envelope<T> { code: number; msg: string; data: T }

export function useReviews() {
  const { apiFetch } = useApi()

  // 提交评价
  async function submitReview(body: { orderId: number; goodsId: number; rating: number; content: string }) {
    return apiFetch('/v1/goods/review', { method: 'POST', body })
  }

  // 订单已评商品 id 列表
  async function getReviewedGoodsIds(orderId: number | string): Promise<number[]> {
    const res = await apiFetch<Envelope<{ reviewedGoodsIds: number[] | null }>>(`/v1/goods/review-status/${orderId}`)
    return res?.data?.reviewedGoodsIds ?? []
  }

  // PDP 评价列表 + 聚合（公开：显式传 tenantId，未登录时网关拿不到租户）
  async function getGoodsReviews(goodsId: number | string, tenantId?: number, page = 1, pageSize = 10): Promise<GoodsReviews> {
    const params: Record<string, unknown> = { p: page, psize: pageSize }
    if (tenantId) params.tenant_id = tenantId
    const res = await apiFetch<Envelope<GoodsReviews>>(`/v1/goods/${goodsId}/reviews`, { params })
    const d = res?.data
    return {
      avgRating: d?.avgRating ?? 0,
      total: d?.total ?? 0,
      data: (d?.data ?? []).map((r): ReviewItem => ({
        rating: r.rating ?? 0,
        content: r.content ?? '',
        nickname: r.nickname ?? '',
        createdAt: r.createdAt ?? '',
      })),
    }
  }

  return { submitReview, getReviewedGoodsIds, getGoodsReviews }
}
