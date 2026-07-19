// 收藏：对接 userop-web /v1/userop/fav（全部按 goodsId 键）。
// check 吞错返回 false；add/remove 抛错交调用页 toast。共享 count 供「我的」页/角标用。
export function useFav() {
  const { apiFetch } = useApi()
  const { isLoggedIn } = useAuth()
  const count = useState<number>('fav-count', () => 0)

  async function refreshCount() {
    if (!isLoggedIn.value) { count.value = 0; return }
    try {
      const res = await apiFetch<{ total: number }>('/v1/userop/fav')
      count.value = res.total || 0
    } catch { count.value = 0 }
  }

  async function check(goodsId: number): Promise<boolean> {
    if (!isLoggedIn.value) return false
    try {
      const res = await apiFetch<{ isFav: boolean }>(`/v1/userop/fav/check/${goodsId}`)
      return !!res.isFav
    } catch { return false }
  }

  async function add(goodsId: number): Promise<void> {
    await apiFetch('/v1/userop/fav', { method: 'POST', body: { goodsId } })
    await refreshCount()
  }

  async function remove(goodsId: number): Promise<void> {
    await apiFetch(`/v1/userop/fav/${goodsId}`, { method: 'DELETE' })
    await refreshCount()
  }

  return { count, refreshCount, check, add, remove }
}
