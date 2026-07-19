// 订单状态 → 可用动作（与 order_srv 的 isValidStatusTransition 对齐）
// 'pay' 仅用于统一派生按钮可见性，具体支付逻辑由页面各自处理。
export type OrderAction = 'pay' | 'cancel' | 'confirmReceipt' | 'delete'

export function availableActions(status: string): OrderAction[] {
  switch (status) {
    case 'PAYING':
    case 'WAIT_BUYER_PAY': return ['pay', 'cancel']
    case 'TRADE_SUCCESS': return ['confirmReceipt']
    case 'TRADE_CLOSED':
    case 'TRADE_FINISHED': return ['delete']
    default: return []
  }
}
