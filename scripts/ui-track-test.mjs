import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SITE = 'https://abdelrahmanmansy.github.io/vanilliano/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

// 1) الفوتر فيه رابط تتبع الطلب
await page.goto(SITE, { waitUntil: 'domcontentloaded' })
const footerTrack = await page.locator('a:has-text("تتبع طلبك")').count()
console.log('1) رابط تتبع الطلب في الفوتر؟', footerTrack > 0 ? 'نعم ✅' : 'لا ❌')

// 2) اطلب طلب و افتح التتبع من زرار شاشة النجاح
await page.evaluate(() => {
  localStorage.setItem('vanilliano_cart', JSON.stringify([{
    id: 'balloon-set-gold', variant: null, quantity: 1,
    product: { id: 'balloon-set-gold', name: 'بالونات ذهبية', price: 89, oldPrice: null, image: null, category: 'منتجات', stock: 'in' },
  }]))
})
await page.goto(SITE + 'checkout', { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
await page.fill('input[placeholder="اسمك الكريم"]', 'متابع التتبع')
await page.fill('input[placeholder="01xxxxxxxxx"]', '01111846842')
await page.selectOption('select', { label: 'الهرم' }).catch(() => {})
await page.fill('input[placeholder="الحي، الشارع، رقم المبنى"]', 'شارع التتبع')
await page.locator('button:has-text("تأكيد الطلب مباشرة في الموقع")').click()
await page.waitForTimeout(2200)

const trackBtn = page.locator('a:has-text("تابع طلبك وصل لفين")')
console.log('2) زرار تابع طلبك موجود في شاشة النجاح؟', (await trackBtn.count()) > 0 ? 'نعم ✅' : 'لا ❌')

await trackBtn.first().click()
await page.waitForTimeout(1800)

// 3) صفحة التتبع
const pageText = await page.locator('body').innerText()
console.log('3) صفحة التتبع اتفتحت برقم الطلب؟', await page.locator('text=تتبع طلبك').count() > 0 ? 'نعم ✅' : 'لا ❌')
console.log('4) أول مرحلة «تم استلام الطلب» ظاهرة؟', pageText.includes('تم استلام الطلب') ? 'نعم ✅' : 'لا ❌')
console.log('5) رسالة الحالة فيها اسم المنتج؟', pageText.includes('بالونات ذهبية') ? 'نعم ✅' : 'لا ❌')
console.log('6) مفيش كلمة «داشبورد»؟', !pageText.includes('داشبورد') && !pageText.toLowerCase().includes('dashboard') ? 'نعم ✅' : 'لا ❌')

// 4) رقم غلط
await page.goto(SITE + 'track?order=VNL-000000', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
const missTxt = await page.locator('body').innerText()
console.log('7) رقم غلط بيظهر رسالة ملقيناش؟', missTxt.includes('ملقيناش طلب') ? 'نعم ✅' : 'لا ❌')

console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()