import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SITE = 'https://abdelrahmanmansy.github.io/vanilliano/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

const orderVisual = async (selectorTxt) => {
  const el = page.locator(selectorTxt).first()
  const digits = await el.evaluate((node) => {
    const digits = []
    for (const el of node.querySelectorAll('*')) {
      const r = el.childNodes
      for (const n of r) {
        if (n.nodeType !== Node.TEXT_NODE) continue
        const s = (n.textContent || '')
        for (const ch of s) {
          if (/\d/.test(ch)) {
            const sp = node.ownerDocument.createElement('span')
            sp.textContent = ch
            node.appendChild(sp)
            const rect = sp.getBoundingClientRect()
            node.removeChild(sp)
            digits.push({ ch, x: rect.left })
          }
        }
      }
    }
    return digits
  }, []).catch(() => [])
  return digits.map((d) => d.ch).join('')
}

// إنشاء طلب للوصول لشاشة النجاح
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
await page.fill('input[placeholder="you@email.com"]', 'phones@p.example.com')
await page.fill('input[placeholder="01xxxxxxxxx"]', '01111846842')
await page.selectOption('select', { label: 'الهرم' }).catch(() => {})
await page.fill('input[placeholder="الحي، الشارع، رقم المبنى"]', 'شارع القياس مبنى ٢')
await page.locator('button:has-text("تأكيد الطلب مباشرة في الموقع")').click()
await page.waitForTimeout(2200)

const digits = await orderVisual('p[dir="ltr"]')
console.log('سطر الأرقام (شاشة النجاح) بترتيب المظهر:', digits)
console.log('1) الرقم الأول بالظبط 01009942440؟', digits.startsWith('01009942440') ? 'نعم ✅' : 'لا ❌')
console.log('2) الرقم التاني 01118215741؟', digits.includes('01118215741') ? 'نعم ✅' : 'لا ❌')

// الفوتر: الرقمين بأمر 010 ثم 011
await page.goto(SITE, { waitUntil: 'domcontentloaded' })
const telnums = await page.locator('ul a[href^="tel:"]').all()
const texts = []
for (const t of telnums) texts.push(await t.innerText())
console.log('3) الفوتر: أول رقم 01009942440؟', (texts[0] || '').includes('010 0994 2440') ? 'نعم ✅' : 'لا ❌ ' + JSON.stringify(texts))
console.log('4) الفوتر: التاني 01118215741؟', (texts[1] || '').includes('011 1821 5741') ? 'نعم ✅' : 'لا ❌ ' + JSON.stringify(texts))
console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()