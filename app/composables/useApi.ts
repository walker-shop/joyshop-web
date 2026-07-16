export function useApi() {
  const config = useRuntimeConfig()
  const { token, logout } = useAuth()
  const base = config.public.apiBase as string

  const client = $fetch.create({
    baseURL: base,
    onRequest({ options }) {
      if (token.value) {
        options.headers = new Headers(options.headers as HeadersInit)
        options.headers.set('Authorization', `Bearer ${token.value}`)
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        logout()
        const redirect = import.meta.client ? window.location.pathname : '/'
        navigateTo(`/login?redirect=${encodeURIComponent(redirect)}`)
      }
    },
  })

  function apiFetch<T>(path: string, opts?: Parameters<typeof client>[1]): Promise<T> {
    return client<T>(path, opts)
  }
  return { apiFetch }
}
