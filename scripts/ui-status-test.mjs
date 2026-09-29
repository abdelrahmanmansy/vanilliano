import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SITE = 'https://abdelrahmanmansy.github.io/vanilliano/'
const BADMIN = SITE + 'admin/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

const EMAIL = 'status-test-' + (Date.now() % 100000) + '@example.com'

// ===== الجزء الأول: طلب جديد من العميل =====
await page.goto(SITE, { waitUntil: 'domcontentloaded' })
await page.evaluate((email) => {
  localStorage.setItem('vanilliano_cart', JSON.stringify([{
    id: 'balloon-set-gold', variant: null, quantity: 1,
    product: { id: 'balloon-set-gold', name: 'بالونات ذهبية', price: 89, oldPrice: null, image: null, category: 'منتجات', stock: 'in' },
  }]))
  localStorage.setItem('vanilliano_user', JSON.stringify({ id: 'u_st', name: 'عميل حالة', email, role: 'user', joinedAt: new Date().toISOString() }))
}, EMAIL)
await page.goto(SITE + 'checkout', { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await page.fill('input[placeholder="اسمك الكريم"]', 'عميل حالة ستاتوس')
await page.fill('input[placeholder="you@email.com"]', EMAIL)
await page.fill('input[placeholder="01xxxxxxxxx"]', '01111846842')
await page.selectOption('select', { label: 'الهرم' }).catch(() => {})
await page.fill('input[placeholder="الحي، الشارع، رقم المبنى"]', 'شارع ستاتوس، مبنى ٩')

await page.locator('button:has-text("تأكيد الطلب مباشرة في الموقع")').click()
await page.waitForTimeout(2200)

let body = await page.locator('body').innerText()
console.log('1) شاشة النجاح فيه «داشبورد»؟', body.includes('داشبورد') ? 'لا ❌ (الكلمة موجودة!)' : 'نعم ✅ (مفيش الكلمة)')
console.log('2) الرسالة طبيعية («سجّلنا طلبك بعناية»)?', body.includes('سجّلنا طلبك بعناية') ? 'نعم ✅' : 'لا ❌')

// ===== حساب العميل: الطلب الجديد يظهر بصيغة ودّية =====
await page.goto(SITE + 'dashboard', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await page.locator('button:has-text("الطلبات")').first().click()
await page.waitForTimeout(800)
body = await page.locator('body').innerText()
console.log('3) الطلب الجديد ظاهر في «حسابي»؟', body.includes('قيد المراجعة') ? 'نعم ✅' : 'لا ❌')
console.log('4) مفيش «داشبورد» في حساب العميل؟', body.includes('داشبورد') ? 'لا ❌' : 'نعم ✅')

// ===== لما المالك يعلّم «تم استلام الدفع» =====
await page.evaluate(() => {
  const stored = JSON.parse(localStorage.getItem('vanilliano_orders') || '[]')
  const merged = stored.map((o) => o.status === 'بانتظار التأكيد' ? { ...o, status: 'تم استلام الدفع' } : o)
  if (merged.length === 0) {
    merged.push({
      id: 'VNL-990001', status: 'تم استلام الدفع', total: 273,
      created_at: new Date().toISOString(), payment_method: 'instapay',
      shippingInfo: { name: 'عميل حالة', city: 'الهرم', address: 'شارع ستاتوس' },
      items: [{ id: 'balloon-set-gold', name: 'بالونات ذهبية', quantity: 1, price: 89 }],
    })
  }
  localStorage.setItem('vanilliano_orders', JSON.stringify(merged))
})
await page.goto(SITE + 'dashboard', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await page.locator('button:has-text("الطلبات")').first().click()
await page.waitForTimeout(800)
body = await page.locator('body').innerText()
console.log('5) العميل يلاقي «تم استلام الدفعة ✅»؟', body.includes('تم استلام الدفعة ✅') ? 'نعم ✅' : 'لا ❌')
console.log('6) رسالة الشكر «وصلتنا دفعتك» ظهرت؟', body.includes('وصلتنا دفعتك') ? 'نعم ✅' : 'لا ❌')

// ===== لوحة المالك: الحالة الجديدة موجودة =====
await page.goto(BADMIN, { waitUntil: 'networkidle' })
await page.fill('input[type="email"]', 'abdelrahmanahmedmansy@gmail.com')
await page.fill('input[type="password"]', 'Van1d4061147!')
await page.click('button[type="submit"], .login .btn')
await page.waitForTimeout(2500)
await page.locator('button:has-text("الطلبات")').first().click()
await page.waitForTimeout(900)
const options = await page.locator('select option').allTextContents()
console.log('7) حالة «تم استلام الدفع» في قائمة المالك؟', options.includes('تم استلام الدفع') ? 'نعم ✅' : 'لا ❌')

console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()