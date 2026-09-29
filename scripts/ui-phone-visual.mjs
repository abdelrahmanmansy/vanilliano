import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SITE = 'https://abdelrahmanmansy.github.io/vanilliano/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

const visuals = async (el) => el.evaluate((node) => {
  const digits = []
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
  let t
  while ((t = walker.nextNode())) {
    for (const ch of (t.textContent || '')) {
      if (/\d/.test(ch)) {
        const sp = node.ownerDocument.createElement('span')
        sp.textContent = ch
        node.appendChild(sp)
        const r = sp.getBoundingClientRect()
        node.removeChild(sp)
        digits.push({ ch, x: r.left })
      }
    }
  }
  return digits
})

await page.goto(SITE, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => {
  localStorage.setItem('vanilliano_cart', JSON.stringify([{
    id: 'balloon-set-gold', variant: null, quantity: 1,
    product: { id: 'balloon-set-gold', name: 'بالونات ذهبية', price: 89, oldPrice: null, image: null, category: 'منتجات', stock: 'in' },
  }]))
})
await page.goto(SITE + 'checkout', { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await page.fill('input[placeholder="اسمك الكريم"]', 'قياس الارقام')
await page.fill('input[placeholder="you@email.com"]', 'phones2@p.example.com')
await page.fill('input[placeholder="01xxxxxxxxx"]', '01111846842')
await page.selectOption('select', { label: 'الهرم' }).catch(() => {})
await page.fill('input[placeholder="الحي، الشارع، رقم المبنى"]', 'شارع القياس مبنى ٢')
await page.locator('button:has-text("تأكيد الطلب مباشرة في الموقع")').click()
await page.waitForTimeout(2200)

const p = page.locator('p[dir="ltr"]').first()
const digits = await visuals(p)
const seq = digits.map((d) => d.ch).join('')
console.log('سطر الأرقام (شاشة النجاح) بترتيب المظهر:', seq)
console.log('1) الرقم الأول 01009942440؟', seq.startsWith('01009942440') ? 'نعم ✅' : 'لا ❌')
console.log('2) الرقم التاني 01118215741؟', seq.includes('01118215741') ? 'نعم ✅' : 'لا ❌')
console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()