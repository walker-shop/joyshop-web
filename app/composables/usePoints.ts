// 积分：对接 userop-web /v1/userop/points（纯累积+展示）。
export interface PointRecord {
  points: number
  orderSn: string
  reason: string
  createdAt: string
}

// 后端 proto json 为 snake_case（且 omitempty）；映射回前端 camelCase 并兜底。
interface RawPointRecord {
  points?: number
  order_sn?: string
  reason?: string
  created_at?: string
}
interface RawPointsResp {
  balance?: number
  total?: number
  data?: RawPointRecord[] | null
}

export function usePoints() {
  const { apiFetch } = useApi()
  const { isLoggedIn } = useAuth()
  const balance = useState<number>('points-balance', () => 0)

  // 我的页 stat 用：只取余额
  async function refreshBalance() {
    if (!isLoggedIn.value) { balance.value = 0; return }
    try {
      const res = await apiFetch<RawPointsResp>('/v1/userop/points', { params: { p: 1, psize: 1 } })
      balance.value = res.balance ?? 0
    } catch {
      balance.value = 0
    }
  }

  // 积分明细页用：分页流水 + 余额 + 总数
  async function fetchRecords(page = 1, pageSize = 20) {
    const res = await apiFetch<RawPointsResp>('/v1/userop/points', { params: { p: page, psize: pageSize } })
    balance.value = res.balance ?? 0
    return {
      balance: res.balance ?? 0,
      total: res.total ?? 0,
      records: (res.data ?? []).map((r): PointRecord => ({
        points: r.points ?? 0,
        orderSn: r.order_sn ?? '',
        reason: r.reason ?? '',
        createdAt: r.created_at ?? '',
      })),
    }
  }

  return { balance, refreshBalance, fetchRecords }
}
