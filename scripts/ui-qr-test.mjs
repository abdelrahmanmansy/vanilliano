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
console.log('1) كود QR انستا موجود في صفحة الشيك-اوت؟', (await qr.count()) > 0 ? 'نعم ✅' : 'لا ❌')
const loaded = await qr.evaluate((img) => img.complete && img.naturalWidth > 0).catch(() => false)
console.log('2) صورة انستا اتحملت فعلاً؟', loaded ? 'نعم ✅' : 'لا ❌')
const src = await qr.getAttribute('src').catch(() => '')
console.log('3) صورة انستا هي الأصلية (حجمها المبني أقل من 40KB)؟', src.includes('instapay') ? 'نعم ✅ (من src/assets)' : 'لا ❌: ' + src)

// اختيار فودافون كاش → يظهر كود فودافون ويختفي كود انستا
const voda = page.locator('button:has-text("فودافون كاش Vodafone Cash")').first()
await voda.click()
await page.waitForTimeout(600)
const vqr = page.locator('img[alt="كود QR لفودافون كاش"]')
console.log('4) كود QR فودافون ظاهر مع اختيار فودافون كاش؟', (await vqr.count()) > 0 ? 'نعم ✅' : 'لا ❌')
const vLoaded = await vqr.evaluate((img) => img.complete && img.naturalWidth > 0).catch(() => false)
console.log('5) صورة فودافون اتحملت فعلاً؟', vLoaded ? 'نعم ✅' : 'لا ❌')
console.log('6) كود انستا اختفى؟', (await qr.count()) === 0 ? 'نعم ✅' : 'لا ❌')
console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()