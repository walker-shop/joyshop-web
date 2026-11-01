export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const origin = 'https://zshop.zwlab.app'
  const urls = new Set([origin + '/', origin + '/category'])
  // No silent partial sitemap: a failed upstream returns 503 and can be retried.
  try {
    for (let page = 1; page <= 500; page++) {
      const res = await $fetch<any>(`${config.public.apiBase}/v1/goods`, { params: { page, pageSize: 100, tenant_id: config.public.tenantId }, timeout: 10000 })
      if (res.code !== 200 || !Array.isArray(res.data?.data)) throw new Error('Catalog unavailable')
      const rows = res.data.data
      for (const row of rows) if (/^\d+$/.test(String(row.id)) && row.name) urls.add(`${origin}/goods/${row.id}`)
      if (!rows.length || page * 100 >= Number(res.data.total || 0)) break
    }
  } catch { throw createError({ statusCode: 503, statusMessage: 'Sitemap temporarily unavailable' }) }
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=300')
  return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + [...urls].map(url => `<url><loc>${url}</loc></url>`).join('') + '</urlset>'
}, { maxAge: 3600, swr: true })
