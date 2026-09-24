import { chromium } from 'playwright-core'
import { createClient } from '@supabase/supabase-js'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SITE = 'https://abdelrahmanmansy.github.io/vanilliano/'
const url = 'https://cjhcohxkhgglxqgmuntt.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaGNvaHhraGdnbHhxZ211bnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNzg4MzQsImV4cCI6MjEwNTY1NDgzNH0.5-V0L72ypCgIB8akl8_maKNkGrovEp9gZEj4GDx4flA'

const owner = createClient(url, anonKey)
await owner.auth.signInWithPassword({ email: 'abdelrahmanahmedmansy@gmail.com', password: 'Van1d4061147!' })

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))
await page.addInitScript(() => {
  window.__openUrls = []
  window.open = (u) => { window.__openUrls.push(u); return null }
})

// سلة محلية بمنتج واحد حتي نصل checkout
await page.goto(SITE, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => {
  localStorage.setItem('vanilliano_cart', JSON.stringify([{
    id: 'balloon-set-gold', variant: null, quantity: 1,
    product: { id: 'balloon-set-gold', name: 'بالونات ذهبية', price: 89, oldPrice: null, image: null, category: 'منتجات', stock: 'in' },
  }]))
})
await page.goto(SITE + 'checkout', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)

// محاولة الأمر بدون بريد الكتروني
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(300)
const submitSel = 'button:has-text("إتمام الطلب"), button:has-text("اطلب الآن"), button[type="submit"]'
await page.locator(submitSel).first().click()
await page.waitForTimeout(700)
const emailErr = await page.locator('text=يرجى إدخال البريد الإلكتروني').count()
console.log('1) بلا بريد → رسالة إجبارية تظهر؟', emailErr > 0 ? 'نعم ✅' : 'لا ❌')

// تعبئة كل الحقول (اسم، بريد، جوال، مدينة، عنوان)
await page.fill('input[placeholder="you@email.com"]', 'customer-test@example.com')
await page.locator('input[placeholder="01xxxxxxxxx"]').fill('01012345678')
const nameSel = 'input[placeholder*="اسم"], input[name="name"]'
await page.locator(nameSel).first().fill('تست الزبون')
const addrSel = 'textarea, input[placeholder*="عنوان"]'
await page.locator(addrSel).first().fill('شارع الاختبار ١٢، قسم كذا')
await page.locator('select').first().selectOption({ index: 1 }).catch(() => {})
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(200)
await page.locator(submitSel).first().click()
await page.waitForTimeout(1500)

const wa = await page.evaluate(() => window.__openUrls[0] || '')
const emailInMsg = wa.includes('customer-test@example.com')
console.log('2) رسالة الواتساب فيها بريد العميل؟', emailInMsg ? 'نعم ✅' : 'لا ❌ (' + wa.slice(0, 120) + ')')

// تنظيف الطلب التجريبي من القاعدة
try {
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('vanilliano_orders') || '[]'))
  const id = stored[0]?.id
  if (id) { await owner.from('orders').delete().eq('id', id); console.log('3) تنظيف طلب الاختبار:', id, '✅') }
} catch { console.log('3) لم يوجد طلب للتنظيف') }

console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()