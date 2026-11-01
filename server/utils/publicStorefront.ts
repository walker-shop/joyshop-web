export async function fetchPublicStorefront(fetcher: typeof $fetch, base: string, tenantId: string | number) {
  const [banners, catalog] = await Promise.all([
    fetcher<any>(`${base}/v1/banners`, { params: { tenant_id: tenantId }, timeout: 8000 }),
    fetcher<any>(`${base}/v1/goods`, { params: { page: 1, pageSize: 12, tenant_id: tenantId }, timeout: 8000 }),
  ])
  if (banners.code !== 200 || catalog.code !== 200 || !Array.isArray(banners.data?.data) || !Array.isArray(catalog.data?.data)) {
    throw new Error('Public storefront data unavailable')
  }
  return {
    banners: banners.data.data.map(({ id, image, url, index }: any) => ({ id, image, url, index })),
    catalog: catalog.data.data.map(({ id, name }: any) => ({ id, name })),
  }
}
