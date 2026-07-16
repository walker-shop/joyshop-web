export function orderStatusLabel(status: string): string {
  switch (status) {
    case 'PAYING':
    case 'WAIT_BUYER_PAY': return '待付款'
    case 'TRADE_SUCCESS': return '已支付'
    case 'TRADE_CLOSED': return '已关闭'
    case 'TRADE_FINISHED': return '已完成'
    default: return status || '未知'
  }
}
