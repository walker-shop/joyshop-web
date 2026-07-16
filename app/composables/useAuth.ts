import type { Ref, ComputedRef } from 'vue'

export interface AuthUser {
  id: number
  username: string
  nickname: string
  avatar: string
  role: string
}

interface IamLoginData {
  access_token: string
  refresh_token: string
  expires_in: number
  user: AuthUser
}
interface IamEnvelope<T> { code: number; message: string; data?: T }

export function useAuth() {
  const config = useRuntimeConfig()
  const { tenantCode } = useTenant()
  const iamBase = config.public.iamBase as string

  // cookie：SSR 安全、刷新不丢；7 天
  const token = useCookie<string | null>('js_token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    default: () => null,
  })
  const user = useState<AuthUser | null>('auth-user', () => null)
  const isLoggedIn = computed(() => !!token.value)

  // 从 JWT 恢复 user（刷新后 useState 重置但 cookie 仍在 → 用户名不丢）
  function userFromToken(tok: string): AuthUser | null {
    try {
      const seg = tok.split('.')[1]
      if (!seg) return null
      const json = atob(seg.replace(/-/g, '+').replace(/_/g, '/'))
      const p = JSON.parse(decodeURIComponent(escape(json)))
      return { id: p.user_id, username: p.username, nickname: p.nickname || p.username, avatar: p.avatar || '', role: p.role }
    } catch { return null }
  }
  if (token.value && !user.value) user.value = userFromToken(token.value)

  function persist(data: IamLoginData) {
    token.value = data.access_token
    user.value = data.user
  }

  async function login(account: string, password: string) {
    const res = await $fetch<IamEnvelope<IamLoginData>>(`${iamBase}/api/auth/login`, {
      method: 'POST',
      body: { account, password, tenant_code: tenantCode },
    })
    if (res.code !== 0 || !res.data?.access_token) {
      throw new Error(res.message || '登录失败')
    }
    persist(res.data)
  }

  async function register(email: string, username: string, password: string) {
    const res = await $fetch<IamEnvelope<IamLoginData>>(`${iamBase}/api/auth/register`, {
      method: 'POST',
      body: { email, username, password, tenant_code: tenantCode },
    })
    if (res.code !== 0 || !res.data?.access_token) {
      throw new Error(res.message || '注册失败')
    }
    persist(res.data) // 注册即自动登录
  }

  function logout() {
    token.value = null
    user.value = null
  }

  return { token, user, isLoggedIn, login, register, logout } as {
    token: Ref<string | null>
    user: Ref<AuthUser | null>
    isLoggedIn: ComputedRef<boolean>
    login: (a: string, p: string) => Promise<void>
    register: (e: string, u: string, p: string) => Promise<void>
    logout: () => void
  }
}
