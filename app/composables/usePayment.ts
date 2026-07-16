// 支付 seam：mock=前端自调 callback 模拟；real=跳 payment_url + 轮询订单状态
const PAY_MODE: 'mock' | 'real' = 'mock'

export function usePayment() {
  const { apiFetch } = useApi()

  async function pollOrderStatus(orderId: number, want = 'TRADE_SUCCESS', tries = 10): Promise<string> {
    for (let i = 0; i < tries; i++) {
      const res = await apiFetch<{ data: { order_info: { status: string } } }>(`/v1/orders/${orderId}`)
      const st = res.data?.order_info?.status
      if (st === want || st === 'TRADE_CLOSED') return st
      await new Promise(r => setTimeout(r, 1000))
    }
    return 'TIMEOUT'
  }

  async function pay(p: { orderId: number; orderSn: string; amount: number; payType?: 'alipay' | 'wechat' }): Promise<'paid' | 'failed'> {
    const payType = p.payType || 'alipay'
    const init = await apiFetch<{ trade_no: string; payment_url: string }>('/v1/payment/initiate', {
      method: 'POST', body: { orderId: p.orderId, payType },
    })
    if (PAY_MODE === 'mock') {
      await apiFetch<{ msg: string; status: string }>('/v1/payment/callback', {
        method: 'POST',
        body: { orderSn: p.orderSn, tradeNo: init.trade_no, amount: p.amount, payType, status: 'success' },
      })
      const st = await pollOrderStatus(p.orderId)
      return st === 'TRADE_SUCCESS' ? 'paid' : 'failed'
    }
    // real: 跳转收银台，回来后轮询（后端收真实回调）
    if (import.meta.client) window.location.href = init.payment_url
    const st = await pollOrderStatus(p.orderId)
    return st === 'TRADE_SUCCESS' ? 'paid' : 'failed'
  }

  return { pay }
}
