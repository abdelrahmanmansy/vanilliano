import { chromium } from 'playwright-core'
import { createClient } from '@supabase/supabase-js'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BADMIN = 'https://abdelrahmanmansy.github.io/vanilliano/admin/'
const url = 'https://cjhcohxkhgglxqgmuntt.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaGNvaHhraGdnbHhxZ211bnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNzg4MzQsImV4cCI6MjEwNTY1NDgzNH0.5-V0L72ypCgIB8akl8_maKNkGrovEp9gZEj4GDx4flA'

const owner = createClient(url, anonKey)
const { error: le } = await owner.auth.signInWithPassword({ email: 'abdelrahmanahmedmansy@gmail.com', password: 'Van1d4061147!' })
if (le) { console.log('DB LOGIN FAIL', le.message); process.exit(1) }

// أول منتج في القائمة (نفس ترتيب الجدول)
const { data: first, error: de } = await owner.from('products').select('*').order('name', { ascending: true }).limit(1)
if (de) { console.log('DB READ FAIL', de.message); process.exit(1) }
const target = first[0]
const newPrice = Number(target.price) + 5
console.log('A) المستهدف:', target.id, target.name, 'price=', target.price)

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const consoleErrors = []
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('CONSOLE: ' + m.text()) })
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message))

await page.goto(BADMIN, { waitUntil: 'networkidle' })
console.log('B) فتح اللوحة، العنوان:', await page.title())

// تسجيل الدخول
await page.fill('input[type="email"]', 'abdelrahmanahmedmansy@gmail.com')
await page.fill('input[type="password"]', 'Van1d4061147!')
await page.click('button[type="submit"], .login .btn')
await page.waitForTimeout(1500)
console.log('C) بعد الدخول، التبويبات الظاهرة:', (await page.locator('.sidebar button').allTextContents()).map((s) => s.trim()).join(' | '))

// فتح المنتجات
await page.click('.sidebar button:has-text("المنتجات")')
await page.waitForTimeout(1200)

const rowCount = await page.locator('table tbody tr').count()
console.log('D) صفوف الجدول:', rowCount)
if (rowCount === 0) {
  console.log('E) لا يوجد منتجات في الجدول! أخطاء الكونسول:')
  console.log(consoleErrors.join('\n') || '(لا أخطاء)')
  await browser.close()
  process.exit(1)
}

const firstRowText = (await page.locator('table tbody tr').first().innerText()).replace(/\s+/g, ' ').trim()
console.log('F) أول صف:', firstRowText)

// الضغط على تعديل
await page.locator('table tbody tr').first().locator('button:has-text("تعديل")').click()
await page.waitForTimeout(800)

const formOpen = await page.locator('form.card').count()
console.log('G) الفورم مفتوح؟', formOpen > 0 ? 'نعم' : 'لا')
const priceVal = await page.locator('form.card input[type="number"]').first().inputValue()
console.log('H) قيمة سعر الفورم:', priceVal)

// تغيير السعر والحفظ
await page.locator('form.card input[type="number"]').first().fill(String(newPrice))
await page.click('form.card button:has-text("حفظ المنتج")')
await page.waitForTimeout(2500)

// فحص DB
const { data: after } = await owner.from('products').select('price').eq('id', target.id)
console.log('I) سعر المنتج في DB بعد الحفظ:', after?.[0]?.price, '/ المتوقع:', newPrice, '=>', String(after?.[0]?.price) === String(newPrice) ? 'تعديل نجح ✅' : 'لم يتغير ❌')

// استرجاع السعر الأصلي
await owner.from('products').upsert({ id: target.id, price: target.price }, { onConflict: 'id' })
console.log('J) استرجاع السعر الأصلي OK')

// === اختبار إضافة منتج جديد ===
const pname = 'اختبار إضافة Ui-' + Date.now().toString().slice(-5)
await page.click('button:has-text("منتج جديد")')
await page.waitForTimeout(600)
await page.locator('form.card input').first().fill(pname)
await page.locator('form.card input[type="number"]').first().fill('77')
await page.click('form.card button:has-text("حفظ المنتج")')
await page.waitForTimeout(2500)

const { data: added } = await owner.from('products').select('id, name, price').eq('name', pname)
console.log('L) المنتج الجديد ظهر في DB؟', added && added.length > 0 ? 'نعم ✅ (' + added[0].price + ' ج.م)' : 'لا ❌')

// رسالة التأكيد تظهر؟
const flashText = (await page.locator('div:has-text("تمت إضافة المنتج الجديد")').count())
console.log('M) رسالة التأكيد ظهرت في اللوحة؟', flashText > 0 ? 'نعم ✅' : 'لا')

// تنظيف: حذف المنتج التجريبي
if (added && added.length > 0) {
  await owner.from('products').delete().eq('id', added[0].id)
  console.log('N) حذف المنتج التجريبي ✅')
}

console.log('K) أخطاء الكونسول خلال الجلسة:')
console.log(consoleErrors.join('\n') || '(بدون أخطاء)')

await browser.close()