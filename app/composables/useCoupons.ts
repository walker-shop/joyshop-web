// 优惠券：对接 userop-web /v1/userop/coupons/*（满减+折扣）。
export interface CouponTemplate {
  id: number
  name: string
  type: number            // 1=满减 2=折扣
  thresholdCents: number
  discountCents: number
  discountPercent: number
  maxDiscountCents: number
  validFrom: string
  validTo: string
  claimed: boolean
  soldOut: boolean
}
export interface MyCoupon {
  id: number
  templateId: number
  name: string
  type: number
  thresholdCents: number
  discountCents: number
  discountPercent: number
  maxDiscountCents: number
  status: number          // 1=unused 2=used
  validFrom: string
  validTo: string
}

interface RawTpl {
  id?: number; name?: string; type?: number
  threshold_cents?: number; discount_cents?: number; discount_percent?: number; max_discount_cents?: number
  valid_from?: string; valid_to?: string; claimed?: boolean; sold_out?: boolean
}
interface RawMine {
  id?: number; template_id?: number; name?: string; type?: number
  threshold_cents?: number; discount_cents?: number; discount_percent?: number; max_discount_cents?: number
  status?: number; valid_from?: string; valid_to?: string
}

function mapTpl(r: RawTpl): CouponTemplate {
  return {
    id: r.id ?? 0, name: r.name ?? '', type: r.type ?? 1,
    thresholdCents: r.threshold_cents ?? 0, discountCents: r.discount_cents ?? 0,
    discountPercent: r.discount_percent ?? 0, maxDiscountCents: r.max_discount_cents ?? 0,
    validFrom: r.valid_from ?? '', validTo: r.valid_to ?? '',
    claimed: !!r.claimed, soldOut: !!r.sold_out,
  }
}
function mapMine(r: RawMine): MyCoupon {
  return {
    id: r.id ?? 0, templateId: r.template_id ?? 0, name: r.name ?? '', type: r.type ?? 1,
    thresholdCents: r.threshold_cents ?? 0, discountCents: r.discount_cents ?? 0,
    discountPercent: r.discount_percent ?? 0, maxDiscountCents: r.max_discount_cents ?? 0,
    status: r.status ?? 1, validFrom: r.valid_from ?? '', validTo: r.valid_to ?? '',
  }
}

// 与后端 calcDiscountCents 完全一致：未满门槛=0，折扣封顶，不倒付。Math.floor 对齐 Go 整数除法。
export function calcCouponDiscountCents(c: { type: number; thresholdCents: number; discountCents: number; discountPercent: number; maxDiscountCents: number }, orderCents: number): number {
  if (orderCents < c.thresholdCents) return 0
  let d = 0
  if (c.type === 1) d = c.discountCents
  else if (c.type === 2) {
    d = Math.floor(orderCents * c.discountPercent / 100)
    if (c.maxDiscountCents > 0 && d > c.maxDiscountCents) d = c.maxDiscountCents
  }
  if (d > orderCents) d = orderCents
  return d < 0 ? 0 : d
}

export function useCoupons() {
  const { apiFetch } = useApi()

  async function listTemplates(): Promise<CouponTemplate[]> {
    const res = await apiFetch<{ data?: RawTpl[] | null }>('/v1/userop/coupons/templates')
    return (res.data ?? []).map(mapTpl)
  }
  async function claim(templateId: number) {
    return apiFetch('/v1/userop/coupons/claim', { method: 'POST', body: { template_id: templateId } })
  }
  async function listMine(status = 0): Promise<MyCoupon[]> {
    const res = await apiFetch<{ data?: RawMine[] | null }>('/v1/userop/coupons/mine', { params: { status } })
    return (res.data ?? []).map(mapMine)
  }

  return { listTemplates, claim, listMine, calcDiscountCents: calcCouponDiscountCents }
}
