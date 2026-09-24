import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SITE = 'https://abdelrahmanmansy.github.io/vanilliano/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

await page.goto(SITE, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => {
  localStorage.setItem('vanilliano_cart', JSON.stringify([{
    id: 'balloon-set-gold', variant: null, quantity: 1,
    product: { id: 'balloon-set-gold', name: 'بالونات ذهبية', price: 89, oldPrice: null, image: null, category: 'منتجات', stock: 'in' },
  }]))
})
await page.goto(SITE + 'checkout', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

const qr = page.locator('img[alt="كود QR لانستا باي"]')
console.log('1) كود QR موجود في صفحة الشيك-اوت؟', (await qr.count()) > 0 ? 'نعم ✅' : 'لا ❌')
const loaded = await qr.evaluate((img) => img.complete && img.naturalWidth > 0).catch(() => false)
console.log('2) الصورة اتحملت فعلاً؟', loaded ? 'نعم ✅' : 'لا ❌')

// اختيار فودافون كاش يخفي الكود
const voda = page.locator('button:has-text("فودافون كاش Vodafone Cash")').first()
await voda.click()
await page.waitForTimeout(400)
console.log('3) الكود يختفي مع اختيار فودافون كاش؟', (await qr.count()) === 0 ? 'نعم ✅' : 'لا ❌')
console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()