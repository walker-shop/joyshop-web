import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Vant embeds its complete icon font in blocking CSS. Keep the glyph rules, but
// let the browser fetch the font separately without delaying the first paint.
export function externalizeVantFont(root: string) {
  const css = readFileSync(join(root, 'node_modules/vant/es/icon/index.css'), 'utf8')
  const match = css.match(/data:font\/woff2;[^,]*;base64,([A-Za-z0-9+/=]+)/)
  if (!match) throw new Error('Vant icon font format changed; review the CSS optimization')
  const font = Buffer.from(match[1]!, 'base64')
  const hash = createHash('sha256').update(font).digest('hex').slice(0, 12)
  const directory = join(root, 'public/_fonts')
  mkdirSync(directory, { recursive: true })
  const filename = `vant-icons-${hash}.woff2`
  writeFileSync(join(directory, filename), font)
  return {
    name: 'externalize-vant-icon-font',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (!id.split('?')[0]?.replaceAll('\\', '/').endsWith('/vant/es/icon/index.css')) return
      return { code: code.replace(match[0], `/_fonts/${filename}`), map: null }
    },
  }
}
