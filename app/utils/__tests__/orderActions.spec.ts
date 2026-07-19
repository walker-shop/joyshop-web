import { describe, it, expect } from 'vitest'
import { availableActions } from '../orderActions'

describe('availableActions', () => {
  it('未付款 → 去支付 + 取消', () => {
    expect(availableActions('PAYING')).toEqual(['pay', 'cancel'])
    expect(availableActions('WAIT_BUYER_PAY')).toEqual(['pay', 'cancel'])
  })
  it('已付款 → 确认收货', () => {
    expect(availableActions('TRADE_SUCCESS')).toEqual(['confirmReceipt'])
  })
  it('终态 → 删除', () => {
    expect(availableActions('TRADE_CLOSED')).toEqual(['delete'])
    expect(availableActions('TRADE_FINISHED')).toEqual(['delete'])
  })
  it('未知/空状态 → 无动作', () => {
    expect(availableActions('')).toEqual([])
    expect(availableActions('FOO')).toEqual([])
  })
})
