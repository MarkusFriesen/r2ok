// Renders the app icons from scripts/icon.svg:
// - public/icon-512.png        manifest icon, full bleed
// - public/apple-touch-icon.png iOS home screen, full bleed (iOS rounds the corners itself)
// - public/favicon.ico          browser tab, 16/32/48px
// Run with `npm run icons`, then `npm run splash` so the launch images pick up the new icon.
import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const source = await readFile('scripts/icon.svg', 'utf8')
const sourceSize = 512

// A tab is tiny and often light: drop the pale square so the sun circle fills
// the whole icon, drop the hairline ring and draw the cup with a thicker line
const faviconSource = source
  .replace(/<rect id="background"[^>]*\/>/, '')
  .replace(/<circle id="ring"[^>]*\/>/, '')
  .replace('viewBox="0 0 512 512"', 'viewBox="76 76 360 360"')
  .replace(/(<g id="cup"[^>]*stroke-width=")26"/, '$140"')

function render(svg, size) {
  return sharp(Buffer.from(svg), { density: (72 * size) / sourceSize })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer()
}

// ICO container with embedded PNGs, supported by every current browser
function ico(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)

  const directory = Buffer.alloc(16 * images.length)
  let offset = header.length + directory.length
  images.forEach(({ size, data }, i) => {
    const entry = i * 16
    directory.writeUInt8(size >= 256 ? 0 : size, entry) // width, 0 means 256
    directory.writeUInt8(size >= 256 ? 0 : size, entry + 1) // height
    directory.writeUInt8(0, entry + 2) // no palette
    directory.writeUInt8(0, entry + 3) // reserved
    directory.writeUInt16LE(1, entry + 4) // color planes
    directory.writeUInt16LE(32, entry + 6) // bits per pixel
    directory.writeUInt32LE(data.length, entry + 8)
    directory.writeUInt32LE(offset, entry + 12)
    offset += data.length
  })
  return Buffer.concat([header, directory, ...images.map(image => image.data)])
}

await writeFile('public/icon-512.png', await render(source, 512))
await writeFile('public/apple-touch-icon.png', await render(source, 180))

const faviconSizes = [16, 32, 48]
const favicons = await Promise.all(faviconSizes.map(async size => ({ size, data: await render(faviconSource, size) })))
await writeFile('public/favicon.ico', ico(favicons))

console.log('Generated icon-512.png, apple-touch-icon.png and favicon.ico')
