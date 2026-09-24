import { chromium } from 'playwright-core'
import { createClient } from '@supabase/supabase-js'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BADMIN = 'https://abdelrahmanmansy.github.io/vanilliano/admin/'
const BSITE = 'https://abdelrahmanmansy.github.io/vanilliano/'
const url = 'https://cjhcohxkhgglxqgmuntt.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaGNvaHhraGdnbHhxZ211bnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNzg4MzQsImV4cCI6MjEwNTY1NDgzNH0.5-V0L72ypCgIB8akl8_maKNkGrovEp9gZEj4GDx4flA'

const owner = createClient(url, anonKey)
const { error: le } = await owner.auth.signInWithPassword({ email: 'abdelrahmanahmedmansy@gmail.com', password: 'Van1d4061147!' })
if (le) { console.log('DB LOGIN FAIL', le.message); process.exit(1) }

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const consoleErrors = []
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('CONSOLE: ' + m.text()) })
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message))

await page.goto(BADMIN, { waitUntil: 'networkidle' })
await page.fill('input[type="email"]', 'abdelrahmanahmedmansy@gmail.com')
await page.fill('input[type="password"]', 'Van1d4061147!')
await page.click('button[type="submit"], .login .btn')
await page.waitForTimeout(1500)

// 1) البحث في المنتجات
await page.click('.sidebar button:has-text("المنتجات")')
await page.waitForTimeout(1000)
const before = await page.locator('table tbody tr').count()
await page.fill('input[placeholder*="ابحث باسم"]', 'جيلاتين')
await page.waitForTimeout(500)
const after = await page.locator('table tbody tr').count()
console.log('A) بحث المنتجات:', before, '→', after, after < before ? '✅' : '❌')
await page.fill('input[placeholder*="ابحث باسم"]', '')

// 2) تسجيل شراء جديد
await page.click('.sidebar button:has-text("الطلبات")')
await page.waitForTimeout(1000)
await page.click('button:has-text("تسجيل شراء جديد")')
await page.waitForTimeout(600)
await page.fill('input[list="admin-products"]', 'gelatin-sheets')
await page.fill('form.card input[type="number"]', '2')
await page.fill('form.card input:not([list]):not([type="number"])', 'اختبار شراء Ui')
await page.click('form.card button:has-text("حفظ عملية الشراء")')
await page.waitForTimeout(2500)

const { data: rec } = await owner.from('orders').select('id, total, items, status').eq('name', 'اختبار شراء Ui')
console.log('B) عملية الشراء اتسجلت في DB؟', rec && rec.length > 0 ? 'نعم ✅ (الإجمالي ' + rec?.[0]?.total + ')' : 'لا ❌')

// 3) تبويب الأكثر مبيعاً
await page.click('.sidebar button:has-text("الأكثر مبيعاً")')
await page.waitForTimeout(1200)
const tsRows = await page.locator('table tbody tr').count()
console.log('C) تبويب الأكثر مبيعاً ظهرت صفوف؟', tsRows > 0 ? 'نعم ✅ (' + tsRows + ' منتج)' : 'لا ❌')

// التحقق من top_sellers RPC يعيد صفوف
const { data: tops } = await owner.rpc('top_sellers', { max_count: 5 })
console.log('D) دالة top_sellers شغالة؟', Array.isArray(tops) && tops.length > 0 ? 'نعم ✅ (' + tops[0].product_name + ' x' + tops[0].qty + ')' : 'لا ❌')

// تنظيف الطلب التجريبي
if (rec && rec.length > 0) await owner.from('orders').delete().eq('id', rec[0].id)
console.log('E) تنظيف الطلب التجريبي ✅')

// 4) قسم الأكثر مبيعاً في المتجر
await page.goto(BSITE, { waitUntil: 'networkidle' })
await page.waitForTimeout(4000)
const shelf = await page.locator('text=الأكثر مبيعاً').count()
console.log('F) قسم «الأكثر مبيعاً» ظاهر في المتجر؟', shelf > 0 ? 'نعم ✅' : 'لا ❌')

console.log('G) أخطاء الكونسول:')
console.log(consoleErrors.join('\n') || '(بدون أخطاء)')
await browser.close()