export function useTenant() {
  const config = useRuntimeConfig()
  const tenantCode = config.public.tenantCode as string
  const tenantId = Number(config.public.tenantId)

  return { tenantCode, tenantId }
}
