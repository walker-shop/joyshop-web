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
  return { count, refresh }
}
