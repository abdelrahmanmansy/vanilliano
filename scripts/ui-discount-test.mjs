import { chromium } from 'playwright-core'
import { createClient } from '@supabase/supabase-js'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SITE = 'https://abdelrahmanmansy.github.io/vanilliano/'
const url = 'https://cjhcohxkhgglxqgmuntt.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaGNvaHhraGdnbHhxZ211bnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNzg4MzQsImV4cCI6MjEwNTY1NDgzNH0.5-V0L72ypCgIB8akl8_maKNkGrovEp9gZEj4GDx4flA'
const owner = createClient(url, anonKey)
await owner.auth.signInWithPassword({ email: 'abdelrahmanahmedmansy@gmail.com', password: 'Van1d4061147!' })

const EMAIL = `member-test-${Date.now()}@example.com`
await owner.from('orders').delete().eq('email', EMAIL)

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))
await page.addInitScript(() => {
  window.__openUrls = []
  window.open = (u) => { window.__openUrls.push(u); return null }
})

// 1) تسجيل/دخول مستخدم جديد من صفحة إنشاء حساب
await page.goto(SITE + 'register', { waitUntil: 'networkidle' })
await page.locator('input[placeholder="اسمك الكريم"]').fill('تست عضو جديد')
await page.locator('input[placeholder="you@email.com"]').fill(EMAIL)
await page.fill('input[type="password"]', 'test-pass-123')
await page.locator('button[type="submit"]').first().click()
await page.waitForTimeout(1200)

// 2) سلة محلية ثم الذهاب للشيك أوت
await page.evaluate(() => {
  localStorage.setItem('vanilliano_cart', JSON.stringify([{
    id: 'balloon-set-gold', variant: null, quantity: 1,
    product: { id: 'balloon-set-gold', name: 'بالونات ذهبية', price: 89, oldPrice: null, image: null, category: 'منتجات', stock: 'in' },
  }]))
})
await page.goto(SITE + 'checkout', { waitUntil: 'networkidle' })
await page.waitForTimeout(1800)

const memberAmount = Math.round((89 * 26) / 100)
const banner = await page.locator('text=خصم أول طلب 26%').count()
const sumLine = await page.locator('text=خصم أول طلب (26%)').count()
console.log('1) بانر الخصم ظاهر؟', banner > 0 ? 'نعم ✅' : 'لا ❌')
console.log('2) سطر الخصم في الملخص؟', sumLine > 0 ? 'نعم ✅' : 'لا ❌')
const dashLine = await page.locator(`text=-${memberAmount} ج.م`).count()
console.log(`3) قيمة الخصم (89ج × 26% = ${memberAmount}ج)?`, dashLine > 0 ? 'نعم ✅' : 'لا ❌')

// 3) إتمام الطلب برسالة واتساب
await page.locator('input[placeholder="you@email.com"]').fill(EMAIL)
await page.locator('input[placeholder="01xxxxxxxxx"]').fill('01012345678')
await page.locator('input[placeholder="اسمك الكريم"]').fill('تست عضو جديد')
await page.locator('input[placeholder="الحي، الشارع، رقم المبنى"]').fill('الحي ١ شارع test مبنى ٢')
await page.locator('select').first().selectOption({ index: 1 }).catch(() => {})
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.locator('button:has-text("إرسال الطلب عبر واتساب")').first().click()
await page.waitForTimeout(1600)
const wa = decodeURIComponent(await page.evaluate(() => window.__openUrls[0] || ''))
console.log('4) رسالة الواتساب فيها سطر خصم أول طلب؟', wa.includes('خصم أول طلب لعضو جديد') ? 'نعم ✅' : 'لا ❌')

// 4) الطلب اتسجل في القاعدة مع ملاحظة الخصم
const orders = await owner.from('orders').eq('email', EMAIL).select('id, note, items')
const saved = orders.data[0]
console.log('5) الطلب اتسجل ومعاه ملاحظة الخصم؟', saved?.note?.includes('خصم أول طلب') ? 'نعم ✅' : 'لا ❌ (' + JSON.stringify(saved) + ')')

// 5) طلب تاني بنفس العضو → الخصم لازم يختفي (0%)
await page.goto(SITE + 'register', { waitUntil: 'networkidle' })
await page.locator('input[placeholder="اسمك الكريم"]').fill('تست عضو جديد')
await page.locator('input[placeholder="you@email.com"]').fill(EMAIL)
await page.fill('input[type="password"]', 'test-pass-123')
await page.locator('button[type="submit"]').first().click()
await page.waitForTimeout(1200)
await page.goto(SITE + 'checkout', { waitUntil: 'networkidle' })
await page.waitForTimeout(1800)
const banner2 = await page.locator('text=خصم أول طلب 26%').count()
const sumLine2 = await page.locator('text=خصم أول طلب (26%)').count()
console.log('6) الطلب التاني (نفس العضو) من غير خصم؟', banner2 === 0 && sumLine2 === 0 ? 'نعم ✅' : 'لا ❌')

// 6) تنظيف
await owner.from('orders').eq('email', EMAIL).delete()
console.log('7) تنظيف طلبات الاختبار ✅')
console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()