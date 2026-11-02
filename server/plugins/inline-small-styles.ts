import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

// Nuxt can retain shared-component stylesheet links even with inlineStyles enabled.
// Serve small, local build assets in their original head position to avoid extra RTTs.
export default defineNitroPlugin((nitroApp) => {
  const publicDir = resolve(dirname(resolve(process.argv[1] || '.output/server/index.mjs')), '../public')
  const cache = new Map<string, Promise<string | null>>()
  const loadStyle = (asset: string) => {
    let pending = cache.get(asset)
    if (!pending) {
      pending = readFile(resolve(publicDir, '_nuxt', asset), 'utf8')
        .then(css => Buffer.byteLength(css) <= 24_000 && !/<\/style/i.test(css) ? css : null)
        .catch(() => null)
      if (cache.size < 128) cache.set(asset, pending)
    }
    return pending
  }
  nitroApp.hooks.hook('render:html', async (html) => {
    html.head = await Promise.all(html.head.map(async (part) => {
      const links = [...part.matchAll(/<link\b[^>]*>/g)]
      for (const [link] of links) {
        if (!/\brel="stylesheet"/.test(link) || /\b(?:media|integrity|nonce)=/.test(link)) continue
        const asset = link.match(/\bhref="\/_nuxt\/([\w.-]+\.css)"/)?.[1]
        if (!asset) continue
        const css = await loadStyle(asset)
        if (css) part = part.replace(link, `<style>${css}</style>`)
      }
      return part
    }))
  })
})
