// 支付：Stripe Checkout（后端建 session 返回收银台 URL，前端跳转付款）。
// 付款完成后 Stripe 回跳 /order/:id?paid=1，由订单详情页轮询 webhook 入账结果。
export function usePayment() {
  const { apiFetch } = useApi()

  // 返回 'redirecting'：已跳转 Stripe 收银台（页面即将离开）；'failed'：发起失败
  async function pay(p: { orderId: number }): Promise<'redirecting' | 'failed'> {
    try {
      const init = await apiFetch<{ payment_url: string }>('/v1/payment/initiate', {
        method: 'POST',
        body: { orderId: p.orderId, payType: 'stripe' },
      })
      if (init.payment_url && import.meta.client) {
        window.location.href = init.payment_url
        return 'redirecting'
      }
      return 'failed'
    } catch {
      return 'failed'
    }
  }

  return { pay }
}
