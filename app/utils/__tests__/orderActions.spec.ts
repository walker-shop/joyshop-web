import { describe, it, expect } from 'vitest'
import { availableActions } from '../orderActions'

describe('availableActions', () => {
  it('未付款 → 去支付 + 取消', () => {
    expect(availableActions('PAYING')).toEqual(['pay', 'cancel'])
    expect(availableActions('WAIT_BUYER_PAY')).toEqual(['pay', 'cancel'])
  })
  it('实体已付款待发货 → 无收货按钮', () => {
    expect(availableActions('TRADE_SUCCESS', true)).toEqual([])
  })
  it('实体已发货 → 确认收货', () => {
    expect(availableActions('SHIPPED', true)).toEqual(['confirmReceipt'])
  })
  it('虚拟已付款 → 直接确认收货', () => {
    expect(availableActions('TRADE_SUCCESS', false)).toEqual(['confirmReceipt'])
  })
  it('已取消 → 仅删除', () => {
    expect(availableActions('TRADE_CLOSED')).toEqual(['delete'])
  })
  it('已完成 → 删除 + 申请退货', () => {
    expect(availableActions('TRADE_FINISHED')).toEqual(['delete', 'requestReturn'])
  })
  it('退货已同意 → 提交寄回物流', () => {
    expect(availableActions('RETURN_APPROVED')).toEqual(['submitReturnShipping'])
  })
  it('退货申请中/已寄出 → 等待 admin 处理，无动作', () => {
    expect(availableActions('RETURN_REQUESTED')).toEqual([])
    expect(availableActions('RETURN_SHIPPED')).toEqual([])
  })
  it('未知/空状态 → 无动作', () => {
    expect(availableActions('')).toEqual([])
    expect(availableActions('FOO')).toEqual([])
  })
})
