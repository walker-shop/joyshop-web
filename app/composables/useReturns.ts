// 退货：买家发起申请 + 提交寄回物流信息（order-web /v1/orders/:id/return/*）
export function useReturns() {
  const { apiFetch } = useApi()

  async function requestReturn(orderId: number, reason: string, reasonNote: string) {
    return apiFetch(`/v1/orders/${orderId}/return/request`, {
      method: 'POST',
      body: { return_reason: reason, return_reason_note: reasonNote },
    })
  }

  async function submitReturnShipping(orderId: number, expressCompany: string, trackingNo: string) {
    return apiFetch(`/v1/orders/${orderId}/return/ship`, {
      method: 'POST',
      body: { return_express_company: expressCompany, return_tracking_no: trackingNo },
    })
  }

  return { requestReturn, submitReturnShipping }
}
