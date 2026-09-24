import { chromium } from 'playwright-core'
import { createClient } from '@supabase/supabase-js'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SITE = 'https://abdelrahmanmansy.github.io/vanilliano/'
const url = 'https://cjhcohxkhgglxqgmuntt.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaGNvaHhraGdnbHhxZ211bnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNzg4MzQsImV4cCI6MjEwNTY1NDgzNH0.5-V0L72ypCgIB8akl8_maKNkGrovEp9gZEj4GDx4flA'
const owner = createClient(url, anonKey)
await owner.auth.signInWithPassword({ email: 'abdelrahmanahmedmansy@gmail.com', password: 'Van1d4061147!' })

const EMAIL = `member-test-${Date.now()}@example.com`
// تنظيف أي طلبات قديمة لنفس الإيميل (المخزنة قبل الخصم)
const oldOrders = await owner.from('orders').select('id')
const oldIds = (oldOrders.data || []).filter((r) => r.id === 'TESTDISCOUNT' || r.id?.startsWith?.('MEM-')).map((r) => r.id)
for (const id of oldIds) await owner.from('orders').delete().eq('id', id)

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))
await page.addInitScript(() => {
  window.__openUrls = []
  window.open = (u) => { window.__openUrls.push(u); return null }
})

// 1) محاكاة "مسجل دخول" بنفس آلية الموقع (localStorage user) + سلة
await page.goto(SITE, { waitUntil: 'domcontentloaded' })
await page.evaluate((email) => {
  localStorage.setItem('vanilliano_user', JSON.stringify({ id: 'u_test', name: 'تست عضو جديد', email, role: 'user', joinedAt: new Date().toISOString() }))
  localStorage.setItem('vanilliano_cart', JSON.stringify([{
    id: 'balloon-set-gold', variant: null, quantity: 1,
    product: { id: 'balloon-set-gold', name: 'بالونات ذهبية', price: 89, oldPrice: null, image: null, category: 'منتجات', stock: 'in' },
  }]))
}, EMAIL)
await page.goto(SITE + 'checkout', { waitUntil: 'networkidle' })
await page.waitForTimeout(1800)

const memberAmount = Math.round((89 * 26) / 100)
const arAmount = new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(memberAmount)
const banner = await page.locator('text=خصم أول طلب 26%').count()
const sumLine = await page.locator('text=خصم أول طلب (26%)').count()
console.log('1) بانر الخصم ظاهر لعضو جديد؟', banner > 0 ? 'نعم ✅' : 'لا ❌')
console.log('2) سطر الخصم في الملخص؟', sumLine > 0 ? 'نعم ✅' : 'لا ❌')
console.log('3) قيمة الخصم (89ج × 26% = ' + memberAmount + 'ج)؟ ' + ((await page.locator(`text=-${arAmount} ج.م`).count()) > 0 ? 'نعم ✅' : 'لا ❌'))

// 2) إتمام الطلب
await page.locator('input[placeholder="you@email.com"]').fill(EMAIL)
await page.locator('input[placeholder="01xxxxxxxxx"]').fill('01012345678')
await page.locator('input[placeholder="اسمك الكريم"]').fill('تست عضو جديد')
await page.locator('input[placeholder="الحي، الشارع، رقم المبنى"]').fill('الحي ١ شارع اختبار مبنى ٢')
await page.locator('select').first().selectOption({ index: 1 }).catch(() => {})
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.locator('button:has-text("إرسال الطلب عبر واتساب")').first().click()
await page.waitForTimeout(1600)
const wa = decodeURIComponent(await page.evaluate(() => window.__openUrls[0] || ''))
console.log('4) واتساب فيه سطر «خصم أول طلب لعضو جديد»؟', wa.includes('خصم أول طلب لعضو جديد') ? 'نعم ✅' : 'لا ❌')

// 3) الطلب اتسجل في القاعدة مع ملاحظة الخصم
const rows = (await owner.from('orders').select('id, note, items')).data || []
const saved = rows.find((r) => r?.note?.includes('تست عضو') || r?.note?.includes('خصم أول طلب'))
console.log('5) الطلب في القاعدة بملاحظة الخصم؟', saved?.note?.includes('خصم أول طلب') ? 'نعم ✅' : 'لا ❌ (' + JSON.stringify(saved) + ')')

// 4) طلب تاني بنفس العضو → الخصم لازم يختفي
await page.goto(SITE, { waitUntil: 'domcontentloaded' })
await page.evaluate((email) => {
  localStorage.setItem('vanilliano_user', JSON.stringify({ id: 'u_test', name: 'تست عضو جديد', email, role: 'user', joinedAt: new Date().toISOString() }))
  localStorage.setItem('vanilliano_cart', JSON.stringify([{
    id: 'balloon-set-gold', variant: null, quantity: 1,
    product: { id: 'balloon-set-gold', name: 'بالونات ذهبية', price: 89, oldPrice: null, image: null, category: 'منتجات', stock: 'in' },
  }]))
}, EMAIL)
await page.goto(SITE + 'checkout', { waitUntil: 'networkidle' })
await page.waitForTimeout(1800)
const banner2 = await page.locator('text=خصم أول طلب 26%').count()
const sumLine2 = await page.locator('text=خصم أول طلب (26%)').count()
console.log('6) الطلب التاني (نفس العضو) من غير خصم؟', banner2 === 0 && sumLine2 === 0 ? 'نعم ✅' : 'لا ❌')

// 5) تنظيف
const rows2 = (await owner.from('orders').select('id')).data || []
for (const r of rows2) {
  if (r.id === saved?.id) await owner.from('orders').delete().eq('id', r.id)
}
console.log('7) تنظيف طلبات الاختبار ✅')
console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()