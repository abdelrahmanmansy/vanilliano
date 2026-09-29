import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SITE = 'https://abdelrahmanmansy.github.io/vanilliano/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

const EMAIL = 'flow-test-' + Date.now() % 100000 + '@example.com'

async function checkout({ viaWhatsApp }) {
  await page.goto(SITE, { waitUntil: 'domcontentloaded' })
  await page.evaluate((email) => {
    localStorage.setItem('vanilliano_cart', JSON.stringify([{
      id: 'balloon-set-gold', variant: null, quantity: 1,
      product: { id: 'balloon-set-gold', name: 'بالونات ذهبية', price: 89, oldPrice: null, image: null, category: 'منتجات', stock: 'in' },
    }]))
    localStorage.setItem('vanilliano_user', JSON.stringify({ id: 'u_f' + Date.now(), name: 'عميل اختبار', email, role: 'user', joinedAt: new Date().toISOString() }))
  }, EMAIL)
  await page.goto(SITE + 'checkout', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  await page.fill('input[placeholder="اسمك الكريم"]', 'عميل اختبار فلو')
  const email = page.locator('input[type="email"]').first()
  await email.fill(EMAIL)
  await page.fill('input[placeholder*="موبايل"], input[placeholder*="رقم"]', '01111846842')
  await page.selectOption('select option[value="الهرم"]', 'الهرم').catch(() => {})
  // العنوان التفصيلي
  await page.fill('input[placeholder="الحي، الشارع، رقم المبنى"]', 'شارع اختبار 1')

  const btn = viaWhatsApp
    ? page.locator('button:has-text("أو أرسل الطلب عبر واتساب")')
    : page.locator('button:has-text("تأكيد الطلب مباشرة في الموقع")')
  await btn.click()
  await page.waitForTimeout(2500)
  // رجع لشاشة النجاح على نفس الصفحة
  const ok = await page.locator('text=رقم الطلب').count()
  let orderId = ''
  try {
    orderId = (await page.locator('span[dir="ltr"]').first().innerText()).trim()
  } catch {}
  return { ok, orderId }
}

console.log('--- المسار الأول: تأكيد مباشرة ---')
const direct = await checkout({ viaWhatsApp: false })
console.log('1) الطلب اتسجل وظهرت شاشة النجاح؟', direct.ok > 0 ? 'نعم ✅' : 'لا ❌')
console.log('2) رقم طلب اتعمل؟', direct.orderId.startsWith('ORD') ? 'نعم ✅ (' + direct.orderId + ')' : 'لا ❌')

console.log('--- المسار التاني: عبر واتساب ---')
const wa = await checkout({ viaWhatsApp: true })
console.log('3) الطلب اتسجل وظهرت شاشة النجاح؟', wa.ok > 0 ? 'نعم ✅' : 'لا ❌')
console.log('4) رقم طلب اتعمل؟', wa.orderId.startsWith('ORD') ? 'نعم ✅ (' + wa.orderId + ')' : 'لا ❌')

console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()