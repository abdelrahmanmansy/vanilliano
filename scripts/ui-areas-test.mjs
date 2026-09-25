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
await page.waitForTimeout(800)

const opts = page.locator('select option')
const optTexts = await opts.allTextContents()
const want = ['دار السلام', 'الهرم', 'العياط', 'المنيب']
for (const w of want) {
  console.log(`${w} موجودة في قائمة المنطقة؟`, optTexts.includes(w) ? 'نعم ✅' : 'لا ❌')
}
console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()