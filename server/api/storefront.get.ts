import { fetchPublicStorefront } from '../utils/publicStorefront'

export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  try {
    // No incoming authorization, cookies or query parameters are forwarded.
    // Only banners, categories and product names/links are cached; checkout data stays live.
    return await fetchPublicStorefront($fetch, config.public.apiBase, config.public.tenantId)
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Public storefront temporarily unavailable' })
  }
}, {
  maxAge: 60,
  swr: true,
  getKey: event => String(useRuntimeConfig(event).public.tenantId),
})
