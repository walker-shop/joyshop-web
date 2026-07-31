// 订单状态 → i18n key（调用方用 $t 翻译；未知状态返回空串，调用方回落原始 status）
export function orderStatusKey(status: string): string {
  switch (status) {
    case 'PAYING':
    case 'WAIT_BUYER_PAY': return 'order.statusPaying'
    case 'TRADE_SUCCESS': return 'order.statusPaid'
    case 'SHIPPED': return 'order.statusShipped'
    case 'TRADE_CLOSED': return 'order.statusClosed'
    case 'TRADE_FINISHED': return 'order.statusFinished'
    case 'RETURN_REQUESTED': return 'order.statusReturnRequested'
    case 'RETURN_APPROVED': return 'order.statusReturnApproved'
    case 'RETURN_SHIPPED': return 'order.statusReturnShipped'
    default: return ''
  }
}

// 订单状态 → 样式色调（用于状态标签着色，与语言无关）
export function orderStatusTone(status: string): 'amber' | 'muted' | 'dim' | '' {
  switch (status) {
    case 'PAYING':
    case 'WAIT_BUYER_PAY': return 'amber'
    case 'TRADE_SUCCESS':
    case 'TRADE_FINISHED': return 'muted'
    case 'SHIPPED': return 'amber'
    case 'TRADE_CLOSED': return 'dim'
    case 'RETURN_REQUESTED':
    case 'RETURN_APPROVED':
    case 'RETURN_SHIPPED': return 'amber'
    default: return ''
  }
}
