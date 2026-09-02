import { normalizeProduct, positiveInteger, searchTerm } from '~/utils/webmcp'

type JsonRecord = Record<string, any>

export default defineNuxtPlugin(async () => {
  const context = document.modelContext
  const state = useWebMcp()
  state.supported.value = typeof context?.registerTool === 'function'
  if (!state.supported.value || !context) return

  const config = useRuntimeConfig()
  const { token } = useAuth()
  const { refresh: refreshCart } = useCartCount()
  const apiBase = config.public.apiBase as string
  const tenantId = String(config.public.tenantId)
  const origin = window.location.origin

  const request = <T>(path: string, options: Record<string, any> = {}) => {
    const headers = new Headers(options.headers || {})
    if (token.value) headers.set('Authorization', `Bearer ${token.value}`)
    return $fetch<T>(`${apiBase}${path}`, { timeout: 10_000, ...options, headers })
  }

  const tools: WebMcpTool[] = [
    {
      name: 'set_shopping_goal',
      description: 'Set the shopping goal visible to both the shopper and agent on the current ZShop page.',
      inputSchema: {
        type: 'object',
        properties: {
          goal: { type: 'string', minLength: 1, maxLength: 240, description: 'A concise shopping goal, constraints, or recipient.' },
        },
        required: ['goal'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      execute: ({ goal }) => {
        const next = String(goal || '').trim()
        if (!next || next.length > 240) throw new Error('goal must contain 1 to 240 characters')
        state.shoppingGoal.value = next
        state.record('set_shopping_goal', next)
        return { goal: next, visibleToShopper: true }
      },
    },
    {
      name: 'search_products',
      description: 'Search the live ZShop catalog by shopper intent and return concise, comparable product facts.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', minLength: 1, maxLength: 100, description: 'Product name, category, or use-case keywords.' },
          maxResults: { type: 'integer', minimum: 1, maximum: 10, default: 6 },
        },
        required: ['query'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
      execute: async ({ query, maxResults = 6 }) => {
        const term = searchTerm(query)
        const limit = Math.min(10, positiveInteger(maxResults, 'maxResults'))
        const response = await request<{ code: number; data?: { data?: JsonRecord[]; total?: number } }>('/v1/goods', {
          params: { page: 1, pageSize: limit, keywords: term, tenant_id: tenantId },
        })
        const products = (response.data?.data || []).slice(0, limit).map(item => normalizeProduct(item, origin))
        state.record('search_products', `${term} · ${products.length} found`)
        return { query: term, total: response.data?.total ?? products.length, products }
      },
    },
    {
      name: 'inspect_product',
      description: 'Read current price, fulfilment, description, and option requirements for one ZShop product.',
      inputSchema: {
        type: 'object',
        properties: { productId: { type: 'integer', minimum: 1 } },
        required: ['productId'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
      execute: async ({ productId }) => {
        const id = positiveInteger(productId, 'productId')
        const response = await request<{ code: number; data?: JsonRecord }>(`/v1/goods/${id}`, { params: { tenant_id: tenantId } })
        if (!response.data) throw new Error('Product is unavailable')
        const product = normalizeProduct(response.data, origin)
        const details = {
          ...product,
          description: response.data.goodsDesc || response.data.goodsBrief || null,
          inStock: response.data.goodsStock == null ? null : Number(response.data.goodsStock) > 0,
          fulfilment: response.data.shipFree ? 'free shipping' : 'shipping calculated by store rules',
        }
        state.record('inspect_product', `${details.name} · ¥${details.price.toFixed(2)}`)
        return details
      },
    },
    {
      name: 'view_cart',
      description: 'Read the signed-in shopper cart and return selected quantities and a verifiable total.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
      execute: async () => {
        if (!token.value) return { authenticated: false, loginUrl: `${origin}/login?redirect=/cart`, items: [] }
        const response = await request<{ total: number; data?: JsonRecord[] | null }>('/v1/cart')
        const items = (response.data || []).map(item => ({
          cartItemId: Number(item.id), productId: Number(item.goods_id), name: item.goods_name,
          unitPrice: Number(item.goods_price), quantity: Number(item.nums), selected: Boolean(item.checked),
        }))
        const selectedTotal = items.filter(item => item.selected).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
        state.record('view_cart', `${items.length} items · ¥${selectedTotal.toFixed(2)} selected`)
        return { authenticated: true, itemCount: response.total || items.length, selectedTotal, cartUrl: `${origin}/cart`, items }
      },
    },
    {
      name: 'add_product_to_cart',
      description: 'Add one simple product to the signed-in shopper cart. Products with options are not guessed and return a selection URL instead.',
      inputSchema: {
        type: 'object',
        properties: {
          productId: { type: 'integer', minimum: 1 },
          quantity: { type: 'integer', minimum: 1, maximum: 20, default: 1 },
        },
        required: ['productId'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
      execute: async ({ productId, quantity = 1 }) => {
        const id = positiveInteger(productId, 'productId')
        const count = Math.min(20, positiveInteger(quantity, 'quantity'))
        if (!token.value) return { added: false, reason: 'sign-in-required', loginUrl: `${origin}/login?redirect=/goods/${id}` }
        const productResponse = await request<{ code: number; data?: JsonRecord }>(`/v1/goods/${id}`, { params: { tenant_id: tenantId } })
        if (!productResponse.data) throw new Error('Product is unavailable')
        if (productResponse.data.hasSku) {
          state.record('add_product_to_cart', `${productResponse.data.name} needs option selection`)
          return { added: false, reason: 'option-selection-required', productUrl: `${origin}/goods/${id}` }
        }
        const response = await request<{ id: number; msg: string }>('/v1/cart', {
          method: 'POST', body: { goodsId: id, nums: count, checked: true },
        })
        await refreshCart()
        state.record('add_product_to_cart', `${productResponse.data.name} × ${count}`)
        return { added: true, cartItemId: response.id, productId: id, quantity: count, cartUrl: `${origin}/cart` }
      },
    },
  ]

  for (const tool of tools) {
    try {
      await context.registerTool(tool)
      state.registered.value += 1
    } catch (error) {
      console.warn(`[WebMCP] Could not register ${tool.name}`, error)
    }
  }
})
