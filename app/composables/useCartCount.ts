// 加购反馈用的目标图标，按优先级找当前实际可见的那个：
// 桌面顶栏购物车 > 商品详情页顶栏购物车（blank layout 没有 tabbar）> 移动端底部 tabbar 购物车
const CART_ICON_SELECTORS = ['.desktop-action[href="/cart"]', '.nav-cart', '.van-tabbar .van-tabbar-item:nth-child(3)']

function findVisibleCartIcon(): HTMLElement | null {
  for (const sel of CART_ICON_SELECTORS) {
    const el = document.querySelector<HTMLElement>(sel)
    if (el && el.getClientRects().length > 0) return el
  }
  return null
}

export function useCartCount() {
  const { apiFetch } = useApi()
  const { isLoggedIn } = useAuth()
  const count = useState<number>('cart-count', () => 0)

  async function refresh() {
    if (!isLoggedIn.value) { count.value = 0; return }
    try {
      const res = await apiFetch<{ total: number }>('/v1/cart')
      count.value = res.total || 0
    } catch { count.value = 0 }
  }

  // 从点击位置飞一个小球到购物车图标 + 图标弹一下；同一件商品点几次都会重新触发，不看提示文字也能确认加成功
  function flyToCart(sx: number, sy: number, img?: string) {
    if (!import.meta.client) return
    const target = findVisibleCartIcon()
    if (!target) return
    const cart = target.getBoundingClientRect()
    const dx = (cart.left + cart.width / 2) - sx
    const dy = (cart.top + cart.height / 2 - 8) - sy
    const ball = document.createElement('div')
    ball.style.cssText = `position:fixed;left:${sx}px;top:${sy}px;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;z-index:9999;pointer-events:none;overflow:hidden;box-shadow:0 5px 16px color-mix(in oklch,var(--color-primary) 48%,transparent);${img ? `background:#000 center/cover url('${img}')` : 'background:var(--color-primary)'};border:2px solid var(--color-primary-light);`
    document.body.appendChild(ball)
    const anim = ball.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0 },
      { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 100}px) scale(.9)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px,${dy}px) scale(.2)`, opacity: .3, offset: 1 },
    ], { duration: 520, easing: 'cubic-bezier(.22,.72,.24,1)' })
    anim.onfinish = () => {
      ball.remove()
      target.classList.add('cart-bumped')
      setTimeout(() => target.classList.remove('cart-bumped'), 450)
    }
  }

  return { count, refresh, flyToCart }
}
