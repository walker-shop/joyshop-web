import { showConfirmDialog, showToast } from 'vant'

// 订单三动作：确认弹框 → 调接口 → toast。返回是否成功，供调用页决定刷新/跳转。
export function useOrderActions() {
  const { apiFetch } = useApi()
  const { t } = useI18n()
  const busy = ref(false)

  async function run(
    action: () => Promise<unknown>,
    message: string,
    successMsg: string,
  ): Promise<boolean> {
    try {
      await showConfirmDialog({
        message,
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
      })
    } catch {
      return false // 用户在弹框点了取消
    }
    busy.value = true
    try {
      await action()
      showToast(successMsg)
      return true
    } catch (e: any) {
      showToast(e?.data?.msg || e?.message || t('order.actionFailed'))
      return false
    } finally {
      busy.value = false
    }
  }

  const cancel = (id: number) =>
    run(
      () => apiFetch(`/v1/orders/${id}`, { method: 'PUT', body: { status: 'TRADE_CLOSED' } }),
      t('order.cancelConfirm'),
      t('order.cancelSuccess'),
    )

  const confirmReceipt = (id: number) =>
    run(
      () => apiFetch(`/v1/orders/${id}`, { method: 'PUT', body: { status: 'TRADE_FINISHED' } }),
      t('order.receiptConfirm'),
      t('order.receiptSuccess'),
    )

  const remove = (id: number) =>
    run(
      () => apiFetch(`/v1/orders/${id}`, { method: 'DELETE' }),
      t('order.deleteConfirm'),
      t('order.deleteSuccess'),
    )

  return { busy, cancel, confirmReceipt, remove }
}
