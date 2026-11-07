// Generates the iOS launch images (iOS ignores the manifest for splash screens
// and only uses an apple-touch-startup-image that matches the device exactly)
// and writes the matching <link> tags into index.html.
// Run with `npm run splash` after changing the icon or the background.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
import { appleSplashScreenSizes } from '@vite-pwa/assets-generator/config'
import { badgeSvg, iconSize as badgeSourceSize } from './icon-variants.mjs'

// Same misty sky the app shows behind its content (body::before in App.css)
const background = 'public/background.svg'
const backgroundSize = { width: 1180, height: 800 }
// The sun circle with the cup floats on the sky; the pale square of the full
// icon would almost disappear against it
const badge = badgeSvg({ shadow: true })
const outDir = 'public/splash'
const indexHtml = 'index.html'
// Badge width (circle plus shadow room) relative to the shorter screen side
const iconScale = 0.32

// Many devices share a resolution, only generate each one once
const sizes = new Map()
for (const size of Object.values(appleSplashScreenSizes))
  sizes.set(`${size.width}x${size.height}@${size.scaleFactor}`, size)

function renderBadge(size) {
  return sharp(Buffer.from(badge), { density: (72 * size) / badgeSourceSize })
    .resize(size, size)
    .png()
    .toBuffer()
}

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const links = []
for (const { width, height, scaleFactor } of sizes.values()) {
  for (const landscape of [false, true]) {
    const [w, h] = landscape ? [height, width] : [width, height]
    const iconSize = Math.round(Math.min(w, h) * iconScale)
    const name = `${landscape ? 'landscape' : 'portrait'}-${w}x${h}.png`

    // Rasterize at the target resolution, then crop like `background-size: cover` anchored at the bottom
    const scale = Math.max(w / backgroundSize.width, h / backgroundSize.height)
    await sharp(background, { density: 72 * scale })
      .resize(w, h, { fit: 'cover', position: 'bottom' })
      .composite([{ input: await renderBadge(iconSize), gravity: 'center' }])
      .png({ compressionLevel: 9, palette: true })
      .toFile(`${outDir}/${name}`)

    const media = `screen and (device-width: ${width / scaleFactor}px) and (device-height: ${height / scaleFactor}px)`
      + ` and (-webkit-device-pixel-ratio: ${scaleFactor}) and (orientation: ${landscape ? 'landscape' : 'portrait'})`
    links.push(`    <link rel="apple-touch-startup-image" media="${media}" href="/splash/${name}" />`)
  }
}

const html = await readFile(indexHtml, 'utf8')
const updated = html.replace(
  /(<!-- splash:start -->\r?\n)[\s\S]*?(\s*<!-- splash:end -->)/,
  (_, start, end) => `${start}${links.join('\n')}${end}`)
if (updated === html && !html.includes('<!-- splash:start -->'))
  throw new Error(`No splash markers found in ${indexHtml}`)
await writeFile(indexHtml, updated)

console.log(`Generated ${links.length} splash screens in ${outDir}`)
