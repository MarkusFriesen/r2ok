// Generates the iOS launch images (iOS ignores the manifest for splash screens
// and only uses an apple-touch-startup-image that matches the device exactly)
// and writes the matching <link> tags into index.html.
// Run with `npm run splash` after changing the icon or background color.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
import { appleSplashScreenSizes } from '@vite-pwa/assets-generator/config'

const background = '#eef3f7'
const icon = 'public/icon-512.png'
const outDir = 'public/splash'
const indexHtml = 'index.html'
// Icon width relative to the shorter screen side
const iconScale = 0.28

// Many devices share a resolution, only generate each one once
const sizes = new Map()
for (const size of Object.values(appleSplashScreenSizes))
  sizes.set(`${size.width}x${size.height}@${size.scaleFactor}`, size)

async function roundedIcon(size) {
  const radius = Math.round(size * 0.225)
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></svg>`)
  return sharp(icon)
    .resize(size, size)
    .composite([{ input: mask, blend: 'dest-in' }])
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

    await sharp({ create: { width: w, height: h, channels: 3, background } })
      .composite([{ input: await roundedIcon(iconSize), gravity: 'center' }])
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
