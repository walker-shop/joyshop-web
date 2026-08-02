/**
 * ZShop 购物全流程回归脚本（prod, Stripe 测试模式）
 *
 * 覆盖：登录 → 收货地址 → 加购 → 下单 → Stripe 收银台付款(4242) → webhook 入账
 *       → TRADE_SUCCESS → 确认收货 → TRADE_FINISHED → 评价 → 商家回复/审核 → 退货申请 → admin同意
 *       → 寄回物流 → admin确认收货并退款 → REFUNDED，逐步 ✅/❌，最后自动清理。
 *
 * 订单生命周期用 API 驱动（稳定）；Stripe 收银台必须真浏览器，用 CDP 驱动 walker Chrome(9222)。
 *
 * 前置：
 *   1. walker Chrome 调试口开着：`chrome-debug`（端口 9222，见 ~/.zshrc）
 *   2. 依赖已装：`cd e2e && npm i`（或仓库根 `pnpm i`，chrome-remote-interface 在 devDeps）
 * 运行：
 *   node e2e/purchase-regression.mjs           # 跑完自动清理测试订单
 *   node e2e/purchase-regression.mjs --keep     # 保留订单不清理（排查用）
 *
 * Stripe 为 sk_test 沙盒，4242 卡零真实扣款。
 */
import CDP from 'chrome-remote-interface'

// ── 配置 ──
const IAM = 'https://iam-api.walker-learn.xyz'
const API = 'https://zshop-admin.zwlab.app/api'
const CDP_PORT = 9222
const KEEP = process.argv.includes('--keep')
const CREDS = { account: 'zshopbuyer', password: 'ZshopBuyer2026!@#', tenant_code: 'joyshop' }
const ADMIN_CREDS = { account: 'joyadmin', password: 'JoyadminSuperz1981!@#', tenant_code: 'joyshop' }
const GOODS_ID = 1
const CARD = { number: '4242424242424242', exp: '1234', cvc: '123', email: 'zshopbuyer@zwlab.app', name: 'Test Buyer' }
const ADDR = { signerName: '回归测试', signerMobile: '13800138000', province: '广东省', city: '深圳市', district: '南山区', address: '回归测试大厦1栋101' }

const sleep = ms => new Promise(r => setTimeout(r, ms))
let TOKEN = ''
let TENANT_ID = 0
const results = []
function ok(name, extra = '') { results.push({ name, pass: true }); console.log(`✅ ${name}${extra ? '  ' + extra : ''}`) }
function fail(name, err) { results.push({ name, pass: false }); console.log(`❌ ${name}  ${err}`); }

async function api(path, { method = 'GET', body, base = API, auth = true, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth && (token || TOKEN)) headers.Authorization = `Bearer ${token || TOKEN}`
  const res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  let data = null
  try { data = await res.json() } catch { /* empty */ }
  return { status: res.status, data }
}

// ── Stripe 收银台付款（CDP 驱动 walker Chrome）──
async function payOnStripe(payUrl) {
  const t = await CDP.New({ port: CDP_PORT, url: 'about:blank' })
  const client = await CDP({ port: CDP_PORT, target: t.id })
  const { Page, Runtime } = client
  await Page.enable(); await Runtime.enable()
  await Page.navigate({ url: payUrl }); await Page.loadEventFired(); await sleep(3500)
  const fill = async (id, text) => {
    await Runtime.evaluate({ expression: `(()=>{const e=document.getElementById('${id}');if(e){e.focus();e.select&&e.select();}})()` })
    await client.Input.insertText({ text }); await sleep(250)
  }
  await fill('email', CARD.email)
  await fill('cardNumber', CARD.number)
  await fill('cardExpiry', CARD.exp)
  await fill('cardCvc', CARD.cvc)
  await fill('billingName', CARD.name)
  await Runtime.evaluate({ expression: `(()=>{const b=[...document.querySelectorAll('button')].find(x=>/支付|Pay|付款/.test(x.innerText)&&x.type==='submit')||document.querySelector('button[type=submit]');b&&b.click();})()` })
  // 等回跳到 /order/:id?paid=1
  let url = ''
  for (let i = 0; i < 15; i++) {
    await sleep(1500)
    const r = await Runtime.evaluate({ returnByValue: true, expression: 'location.href' })
    url = r.result.value
    if (url.includes('zshop.zwlab.app/order/')) break
  }
  await client.close()
  return url
}

async function main() {
  console.log(`\n=== ZShop 购物全流程回归 (${new Date().toISOString()}) ===\n`)
  let orderId = null, cartId = null, reviewId = null

  // 1. 登录
  try {
    const r = await api('/api/auth/login', { base: IAM, auth: false, method: 'POST', body: CREDS })
    if (r.data?.code === 0 && r.data.data?.access_token) {
      TOKEN = r.data.data.access_token
      const claims = JSON.parse(Buffer.from(TOKEN.split('.')[1], 'base64url').toString())
      TENANT_ID = Number(claims.tenant_id ?? claims.tenantId ?? r.data.data.user?.tenant_id ?? 0)
      if (!TENANT_ID) throw new Error('JWT 缺少 tenant_id')
      ok('登录 zshopbuyer', `user_id=${r.data.data.user?.id} tenant_id=${TENANT_ID}`)
    }
    else { fail('登录 zshopbuyer', JSON.stringify(r.data)); return summary() }
  } catch (e) { fail('登录 zshopbuyer', e.message); return summary() }

  // 2. 确保收货地址（无则建）
  try {
    let r = await api('/v1/userop/address')
    if (!r.data?.data?.length) { await api('/v1/userop/address', { method: 'POST', body: ADDR }); r = await api('/v1/userop/address') }
    const a = r.data?.data?.[0]
    if (a) ok('收货地址就绪', `id=${a.id}`); else { fail('收货地址就绪', '创建后仍为空'); return summary() }
  } catch (e) { fail('收货地址就绪', e.message); return summary() }

  // 3. 清空旧购物车 + 加购 goods 1（并勾选）
  try {
    const list = await api('/v1/cart')
    for (const it of (list.data?.data || [])) await api(`/v1/cart/${it.id}`, { method: 'DELETE' })
    const add = await api('/v1/cart', { method: 'POST', body: { goodsId: GOODS_ID, nums: 1 } })
    cartId = add.data?.id
    if (!cartId) { fail('加购', JSON.stringify(add.data)); return summary() }
    await api(`/v1/cart/${cartId}`, { method: 'PUT', body: { nums: 1, checked: true } })
    ok('加购 + 勾选', `cartId=${cartId}`)
  } catch (e) { fail('加购', e.message); return summary() }

  // 4. 下单（结算）
  try {
    const addr = (await api('/v1/userop/address')).data.data[0]
    const full = `${addr.province}${addr.city}${addr.district}${addr.address}`
    const r = await api('/v1/orders', { method: 'POST', body: { address: full, name: addr.signerName, mobile: addr.signerMobile, post: '' } })
    orderId = r.data?.id
    if (orderId) ok('下单建单', `orderId=${orderId} sn=${r.data.order_sn}`); else { fail('下单建单', JSON.stringify(r.data)); return summary() }
  } catch (e) { fail('下单建单', e.message); return summary() }

  // 5. 发起支付 → Stripe cs_test 收银台 URL
  let payUrl = ''
  try {
    const r = await api('/v1/payment/initiate', { method: 'POST', body: { orderId, payType: 'stripe' } })
    payUrl = r.data?.payment_url || ''
    if (payUrl.includes('checkout.stripe.com') && payUrl.includes('cs_test')) ok('发起支付(真出 Stripe cs_test 收银台)')
    else { fail('发起支付', 'payment_url 非预期: ' + payUrl.slice(0, 60)); return summary() }
  } catch (e) { fail('发起支付', e.message); return summary() }

  // 6. Stripe 收银台 4242 付款 → 回跳
  try {
    const back = await payOnStripe(payUrl)
    if (back.includes(`/order/${orderId}`)) ok('4242 付款 + 回跳', back.replace(/\?.*/, '') + '?paid=1')
    else { fail('4242 付款 + 回跳', '未回跳，停在: ' + back.slice(0, 60)) }
  } catch (e) { fail('4242 付款 + 回跳', e.message) }

  // 7. 轮询 webhook 入账 → TRADE_SUCCESS
  try {
    let st = ''
    for (let i = 0; i < 12; i++) {
      const r = await api(`/v1/orders/${orderId}`)
      st = r.data?.data?.order_info?.status
      if (st === 'TRADE_SUCCESS') break
      await sleep(2000)
    }
    if (st === 'TRADE_SUCCESS') ok('webhook 入账 → TRADE_SUCCESS'); else fail('webhook 入账', '最终状态: ' + st)
  } catch (e) { fail('webhook 入账', e.message) }

  // 7b. admin 登录（发货/退货审核/退款都需要 admin 权限）
  let ADMIN_TOKEN = ''
  try {
    const r = await api('/api/auth/login', { base: IAM, auth: false, method: 'POST', body: ADMIN_CREDS })
    if (r.data?.code === 0 && r.data.data?.access_token) { ADMIN_TOKEN = r.data.data.access_token; ok('登录 joyadmin') }
    else { fail('登录 joyadmin', JSON.stringify(r.data)); return summary() }
  } catch (e) { fail('登录 joyadmin', e.message); return summary() }

  // 清理上次异常中断残留的 E2E 评价，保证回归幂等。
  try {
    const old = await api(`/v1/goods/reviews?tenant_id=${TENANT_ID}&pageSize=100`, { token: ADMIN_TOKEN })
    for (const row of (old.data?.data?.data || []).filter(item => item.content?.startsWith('E2E评价-'))) {
      await api(`/v1/goods/reviews/${row.id}/status?tenant_id=${TENANT_ID}`, { method: 'PUT', token: ADMIN_TOKEN, body: { status: 'HIDDEN' } })
    }
  } catch { /* 不影响主流程 */ }

  // 7c. admin 发货（实体商品必须先发货才能确认收货，见 2026-07-30 发货物流设计）
  try {
    await api(`/v1/orders/${orderId}/ship`, { method: 'POST', token: ADMIN_TOKEN, body: { express_company: '顺丰速运', tracking_no: 'SF' + Date.now() } })
    const st = (await api(`/v1/orders/${orderId}`)).data?.data?.order_info?.status
    if (st === 'SHIPPED') ok('admin 发货 → SHIPPED'); else fail('admin 发货', '状态: ' + st)
  } catch (e) { fail('admin 发货', e.message) }

  // 8. 确认收货 → TRADE_FINISHED
  try {
    await api(`/v1/orders/${orderId}`, { method: 'PUT', body: { status: 'TRADE_FINISHED' } })
    const st = (await api(`/v1/orders/${orderId}`)).data?.data?.order_info?.status
    if (st === 'TRADE_FINISHED') ok('确认收货 → TRADE_FINISHED'); else fail('确认收货', '状态: ' + st)
  } catch (e) { fail('确认收货', e.message) }

  // 8a. 完成订单后评价（带图）→ PDP 可见
  const reviewMarker = `E2E评价-${Date.now()}`
  try {
    const detail = await api(`/v1/orders/${orderId}`)
    const image = detail.data?.data?.goods?.[0]?.goods_image
    const body = { orderId, goodsId: GOODS_ID, rating: 5, content: reviewMarker, images: image ? [image] : [] }
    const created = await api('/v1/goods/review', { method: 'POST', body })
    if (created.status !== 200) throw new Error(JSON.stringify(created.data))
    const list = await api(`/v1/goods/${GOODS_ID}/reviews?tenant_id=${TENANT_ID}`, { auth: false })
    const row = list.data?.data?.data?.find?.(item => item.content === reviewMarker)
    reviewId = row?.id
    if (reviewId) ok('完成订单后评价 → PDP 可见', `reviewId=${reviewId}`)
    else fail('完成订单后评价', 'PDP 未找到新评价')
  } catch (e) { fail('完成订单后评价', e.message) }

  // 8b. admin 回复，并验证隐藏/恢复审核闭环
  if (reviewId) {
    try {
      const reply = await api(`/v1/goods/reviews/${reviewId}/reply?tenant_id=${TENANT_ID}`, { method: 'POST', token: ADMIN_TOKEN, body: { reply: '感谢你的真实反馈。' } })
      if (reply.status !== 200) throw new Error(JSON.stringify(reply.data))
      let list = await api(`/v1/goods/${GOODS_ID}/reviews?tenant_id=${TENANT_ID}`, { auth: false })
      let row = list.data?.data?.data?.find?.(item => item.id === reviewId)
      if (row?.merchantReply) ok('商家回复评价 → PDP 可见'); else throw new Error('PDP 未显示商家回复')

      await api(`/v1/goods/reviews/${reviewId}/status?tenant_id=${TENANT_ID}`, { method: 'PUT', token: ADMIN_TOKEN, body: { status: 'HIDDEN' } })
      list = await api(`/v1/goods/${GOODS_ID}/reviews?tenant_id=${TENANT_ID}`, { auth: false })
      row = list.data?.data?.data?.find?.(item => item.id === reviewId)
      if (!row) ok('隐藏评价 → PDP 不可见'); else throw new Error('隐藏评价仍公开')

      await api(`/v1/goods/reviews/${reviewId}/status?tenant_id=${TENANT_ID}`, { method: 'PUT', token: ADMIN_TOKEN, body: { status: 'PUBLISHED' } })
      list = await api(`/v1/goods/${GOODS_ID}/reviews?tenant_id=${TENANT_ID}`, { auth: false })
      row = list.data?.data?.data?.find?.(item => item.id === reviewId)
      if (row) ok('恢复评价 → PDP 重新可见'); else throw new Error('恢复后评价仍不可见')
    } catch (e) { fail('评价回复/审核', e.message) }
  }

  // 8c. 买家发起退货申请 → RETURN_REQUESTED
  try {
    await api(`/v1/orders/${orderId}/return/request`, { method: 'POST', body: { return_reason: 'OTHER', return_reason_note: '回归测试退货' } })
    const st = (await api(`/v1/orders/${orderId}`)).data?.data?.order_info?.status
    if (st === 'RETURN_REQUESTED') ok('申请退货 → RETURN_REQUESTED'); else fail('申请退货', '状态: ' + st)
  } catch (e) { fail('申请退货', e.message) }

  // 8d. admin 同意退货 → RETURN_APPROVED
  try {
    await api(`/v1/orders/${orderId}/return/review`, { method: 'POST', token: ADMIN_TOKEN, body: { approve: true } })
    const st = (await api(`/v1/orders/${orderId}`)).data?.data?.order_info?.status
    if (st === 'RETURN_APPROVED') ok('admin 同意退货 → RETURN_APPROVED'); else fail('admin 同意退货', '状态: ' + st)
  } catch (e) { fail('admin 同意退货', e.message) }

  // 8e. 买家提交寄回物流 → RETURN_SHIPPED
  try {
    await api(`/v1/orders/${orderId}/return/ship`, { method: 'POST', body: { return_express_company: '顺丰速运', return_tracking_no: 'SF' + Date.now() } })
    const st = (await api(`/v1/orders/${orderId}`)).data?.data?.order_info?.status
    if (st === 'RETURN_SHIPPED') ok('提交寄回物流 → RETURN_SHIPPED'); else fail('提交寄回物流', '状态: ' + st)
  } catch (e) { fail('提交寄回物流', e.message) }

  // 8f. admin 确认收货并退款（复用现有 /refund）→ REFUNDED
  try {
    const r = await api(`/v1/orders/${orderId}/refund`, { method: 'POST', token: ADMIN_TOKEN })
    const st = (await api(`/v1/orders/${orderId}`)).data?.data?.order_info?.status
    if (st === 'REFUNDED') ok('确认收货并退款 → REFUNDED'); else fail('确认收货并退款', '状态: ' + st + ' resp=' + JSON.stringify(r.data))
  } catch (e) { fail('确认收货并退款', e.message) }

  // 9. 清理（--keep 跳过）
  if (!KEEP && orderId) {
    try {
	  if (reviewId) await api(`/v1/goods/reviews/${reviewId}/status?tenant_id=${TENANT_ID}`, { method: 'PUT', token: ADMIN_TOKEN, body: { status: 'HIDDEN' } })
      await api(`/v1/orders/${orderId}`, { method: 'DELETE' })
      const list = await api('/v1/cart')
      for (const it of (list.data?.data || [])) await api(`/v1/cart/${it.id}`, { method: 'DELETE' })
      ok('清理测试订单+购物车')
    } catch (e) { fail('清理', e.message) }
  } else if (KEEP) {
    console.log(`\n(--keep) 保留订单 ${orderId} 未清理`)
  }

  summary()
}

function summary() {
  const pass = results.filter(r => r.pass).length, total = results.length
  console.log(`\n=== 结果: ${pass}/${total} 通过 ===`)
  const allPass = pass === total && total > 0
  console.log(allPass ? '🎉 全流程回归 PASS' : '⚠️  有步骤失败，见上方 ❌')
  process.exit(allPass ? 0 : 1)
}

main().catch(e => { console.error('FATAL', e.message); process.exit(1) })
