import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:fs/promises', () => ({ readFile: vi.fn() }))
import { readFile } from 'node:fs/promises'

async function render(head: string[]) {
  vi.stubGlobal('defineNitroPlugin', (plugin: unknown) => plugin)
  const { default: plugin } = await import('../server/plugins/inline-small-styles')
  let hook: (html: { head: string[] }) => Promise<void>
  ;(plugin as any)({ hooks: { hook: (_name: string, fn: typeof hook) => { hook = fn } } })
  const html = { head }
  await hook!(html)
  return html.head
}
afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals() })

describe('small local SSR styles', () => {
  it('preserves head order while replacing a local stylesheet', async () => {
    vi.mocked(readFile).mockResolvedValue('.van-image{display:block}')
    expect(await render(['<meta name="x"><link rel="stylesheet" href="/_nuxt/style.hash.css" crossorigin><script></script>']))
      .toEqual(['<meta name="x"><style>.van-image{display:block}</style><script></script>'])
  })
  it('leaves missing, oversized and unsafe styles on the original link', async () => {
    const link = '<link rel="stylesheet" href="/_nuxt/a.hash.css">'
    vi.mocked(readFile).mockRejectedValueOnce(new Error('missing'))
    expect(await render([link])).toEqual([link])
    vi.mocked(readFile).mockResolvedValueOnce('x'.repeat(24_001))
    expect(await render([link])).toEqual([link])
    vi.mocked(readFile).mockResolvedValueOnce('</style><script>')
    expect(await render([link])).toEqual([link])
  })
  it('does not read external, traversal or attribute-sensitive styles', async () => {
    const links = [
      '<link rel="stylesheet" href="https://other.test/a.css">',
      '<link rel="stylesheet" href="/_nuxt/../secret.css">',
      '<link rel="stylesheet" href="/_nuxt/a.css" media="print">',
      '<link rel="stylesheet" href="/_nuxt/a.css" integrity="hash">',
      '<link rel="preload" href="/_nuxt/a.css">',
    ]
    expect(await render(links)).toEqual(links)
    expect(readFile).not.toHaveBeenCalled()
  })
})
