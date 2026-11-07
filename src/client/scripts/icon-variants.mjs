// Variants of the app icon (scripts/icon.svg) for the icon and splash generators
import { readFileSync } from 'node:fs'

export const iconSize = 512
export const iconSvg = readFileSync(new URL('./icon.svg', import.meta.url), 'utf8')

// Just the sun circle with the cup on a transparent background, for places
// where the pale square of the full icon would get lost (browser tab, splash).
// `shadow` adds a soft drop shadow and the room it needs around the circle
export function badgeSvg({ strokeWidth = 26, ring = true, shadow = false } = {}) {
  let svg = iconSvg
    .replace(/<rect id="background"[^>]*\/>/, '')
    .replace(/(<g id="cup"[^>]*stroke-width=")26"/, `$1${strokeWidth}"`)
  if (!ring)
    svg = svg.replace(/<circle id="ring"[^>]*\/>/, '')

  if (!shadow)
    return svg.replace('viewBox="0 0 512 512"', 'viewBox="76 76 360 360"')

  return svg
    .replace('viewBox="0 0 512 512"', 'viewBox="36 36 440 440"')
    .replace('</defs>', '  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>\n  </defs>')
    .replace('<circle cx="256" cy="256" r="180"',
      '<circle cx="256" cy="272" r="172" fill="#28466e" fill-opacity="0.22" filter="url(#shadow)"/>\n  <circle cx="256" cy="256" r="180"')
}
