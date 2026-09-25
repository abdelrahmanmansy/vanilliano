import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SITE = 'https://abdelrahmanmansy.github.io/vanilliano/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

await page.goto(SITE, { waitUntil: 'domcontentloaded' })
// تسجيل دخول تجريبي → المراد ما كانش يتكتب "مستخدم فانيليانو" تلقائياً
await page.evaluate(() => {
  localStorage.setItem('vanilliano_user', JSON.stringify({
    id: 'd1', name: 'مستخدم فانيليانو', email: 'demo@vanilliano.com',
    role: 'user', joinedAt: new Date().toISOString(),
  }))
})
await page.goto(SITE + 'checkout', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)

const nameInput = page.locator('input[placeholder="اسمك الكريم"]')
console.log('1) خانة الاسم فاضية (مفيش مستخدم فانيليانو)؟', ((await nameInput.inputValue()).trim() === '') ? 'نعم ✅' : 'لا ❌ مكتوب: "' + await nameInput.inputValue() + '"')

// محاولة إتمام بدون اسم → لازم يمنع
await page.evaluate(() => {
  localStorage.setItem('vanilliano_cart', JSON.stringify([{
    id: 'balloon-set-gold', variant: null, quantity: 1,
    product: { id: 'balloon-set-gold', name: 'بالونات ذهبية', price: 89, oldPrice: null, image: null, category: 'منتجات', stock: 'in' },
  }]))
})
await page.goto(SITE + 'checkout', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)
const inputs = page.locator('input, textarea')
const editableCount = await inputs.count()
for (let i = 0; i < editableCount; i++) {
  const el = inputs.nth(i)
  const tag = await el.evaluate((n) => n.tagName)
  if (tag === 'INPUT') {
    const type = (await el.getAttribute('type') || '').toLowerCase()
    const name = (await el.getAttribute('name') || '').toLowerCase()
    if (['email', 'password', 'submit', 'button', 'checkbox', 'hidden', 'search'].includes(type)) continue
    if (type.includes('select')) continue
  }
  // امسح أي قيمة مسرّبة (خصوصاً خانة الاسم) عشان نختبر الإجبار
  await el.fill('')
}
const submit = page.locator('button:has-text("أكمل الطلب"), button:has-text("إتمام الطلب"), button:has-text("تأكيد"), button:has-text("اطلب")')
const btnCount = await submit.count()
console.log('2) زرار الإتمام موجود؟', btnCount > 0 ? 'نعم ✅' : 'لا ❌')
if (btnCount > 0) {
  await submit.first().click()
  await page.waitForTimeout(900)
  const err = page.locator('text=يرجى إدخال اسمك الكامل لتتمكن من إتمام الطلب')
  console.log('3) بيظهر منع إتمام الطلب من غير اسم؟', (await err.count()) > 0 ? 'نعم ✅' : 'لا ❌')
}
console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()