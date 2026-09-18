import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = resolve(process.cwd())
const toFileUrl = (p) => pathToFileURL(resolve(p)).href
const PRODUCTS_DIR = resolve(ROOT, 'public/images/products')
const CATEGORIES_DIR = resolve(ROOT, 'public/images/categories')

mkdirSync(PRODUCTS_DIR, { recursive: true })
mkdirSync(CATEGORIES_DIR, { recursive: true })

const PALETTES = [
  ['#fdf6f0', '#f3d8ab', '#db8c33'],
  ['#fcf5f6', '#f2cfd4', '#c64e60'],
  ['#fffdfa', '#f9e8dc', '#e4a44f'],
  ['#faf6f0', '#eaddd0', '#a35920'],
  ['#fef7ef', '#f5e3c8', '#d87784'],
  ['#f7f3ec', '#eadfc8', '#c47325'],
  ['#fdf2f2', '#efd3d6', '#a93349'],
]

function shade(hex, factor) {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.round(((num >> 16) & 255) * factor))
  const g = Math.min(255, Math.round(((num >> 8) & 255) * factor))
  const b = Math.min(255, Math.round((num & 255) * factor))
  return `rgb(${r},${g},${b})`
}

function decorCircles(num) {
  let circles = ''
  for (let i = 0; i < num; i++) {
    const cx = 20 + Math.random() * 760
    const cy = 30 + Math.random() * 430
    const r = 16 + Math.random() * 40
    const opacity = 0.12 + Math.random() * 0.18
    circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" opacity="${opacity}" />`
  }
  return circles
}

function makeProductSvg(id, name, paletteIdx = 0) {
  const [bg, mid, accent] = PALETTES[paletteIdx % PALETTES.length]
  const short = name.length > 38 ? name.slice(0, 38) + '…' : name

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}" />
      <stop offset="55%" stop-color="${mid}" />
      <stop offset="100%" stop-color="${shade(accent, 0.85)}" />
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg)" />
  ${decorCircles(8)}
  <circle cx="400" cy="230" r="130" fill="#ffffff" opacity="0.25" />
  <circle cx="400" cy="230" r="96" fill="#ffffff" opacity="0.35" />
  <ellipse cx="400" cy="230" rx="72" ry="52" fill="${shade(accent, 1.15)}" opacity="0.85" />
  <rect x="340" y="176" width="120" height="16" rx="8" fill="#ffffff" opacity="0.8" transform="rotate(-18 400 230)" />
  <rect x="400" y="230" width="150" height="20" rx="10" fill="#ffffff" opacity="0.9" transform="rotate(18 475 240)" />
  <rect width="800" height="180" y="320" fill="url(#shine)" />
  <text x="400" y="395" text-anchor="middle" font-family="Cairo, Arial, sans-serif" font-size="34" font-weight="700" fill="#3c2a20" textLength="560" lengthAdjust="spacingAndGlyphs">${short}</text>
  <text x="400" y="445" text-anchor="middle" font-family="Cairo, Arial, sans-serif" font-size="20" font-weight="500" fill="#6c4a33" opacity="0.8">Vanilliano</text>
  <text x="400" y="60" text-anchor="middle" font-family="Cairo, Arial, sans-serif" font-size="16" fill="#6c4a33" opacity="0.5" letter-spacing="4">vanilliano.com</text>
</svg>`
}

function makeCategorySvg(id, name, paletteIdx = 0) {
  const [bg, _mid, accent] = PALETTES[paletteIdx % PALETTES.length]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
  <defs>
    <linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}" />
      <stop offset="100%" stop-color="${shade(accent, 0.8)}" />
    </linearGradient>
  </defs>
  <rect width="600" height="420" fill="url(#cbg)" />
  ${decorCircles(6)}
  <circle cx="300" cy="180" r="90" fill="#ffffff" opacity="0.3" />
  <text x="300" y="268" text-anchor="middle" font-family="Cairo, Arial, sans-serif" font-size="38" font-weight="800" fill="#2b2118">${name}</text>
  <text x="300" y="312" text-anchor="middle" font-family="Cairo, Arial, sans-serif" font-size="18" fill="#5c4130" opacity="0.85">قسم فانيليانو</text>
</svg>`
}

// Extract product id + name from the source file with simple parsing,
// avoiding Node ESM extension resolution issues.
function extractProducts() {
  const source = readFileSync(resolve(ROOT, 'src/data/products.js'), 'utf8')
  const entries = []
  const pattern =
    /P\('([a-z0-9-]+)',\s*\{[\s\S]*?name:\s*'([^']*)'[\s\S]*?\}\)\s*,/g
  let m
  while ((m = pattern.exec(source)) !== null) {
    entries.push({ id: m[1], name: m[2] })
  }
  return entries
}

const seen = new Set()
for (const p of extractProducts()) {
  if (seen.has(p.id)) continue
  seen.add(p.id)
  const file = resolve(PRODUCTS_DIR, `${p.id}.svg`)
  if (!existsSync(file)) {
    const idx = p.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
    writeFileSync(file, makeProductSvg(p.id, p.name, idx))
  }
}

const catModule = await import(toFileUrl('src/data/categories.js')).catch(
  () => ({ categories: [] }),
)
for (const c of catModule.categories || []) {
  const file = resolve(CATEGORIES_DIR, `${c.slug}.svg`)
  if (!existsSync(file)) {
    const idx = categoriesIndex(c.id)
    writeFileSync(file, makeCategorySvg(c.slug, c.name, idx))
  }
}

function categoriesIndex(id) {
  return id.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
}

console.log('Image placeholders ready.')