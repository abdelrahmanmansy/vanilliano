import { chromium } from 'playwright-core'
import { createClient } from '@supabase/supabase-js'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SITE = 'https://abdelrahmanmansy.github.io/vanilliano/'
const url = 'https://cjhcohxkhgglxqgmuntt.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaGNvaHhraGdnbHhxZ211bnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNzg4MzQsImV4cCI6MjEwNTY1NDgzNH0.5-V0L72ypCgIB8akl8_maKNkGrovEp9gZEj4GDx4flA'
const owner = createClient(url, anonKey)
await owner.auth.signInWithPassword({ email: 'abdelrahmanahmedmansy@gmail.com', password: 'Van1d4061147!' })

const ORDER_ID = `ORD-TEST-${Date.now().toString().slice(-6)}`
const EMAIL = `list-me-${Date.now().toString().slice(-5)}@example.com`
await owner.from('orders').insert({
  id: ORDER_ID,
  name: 'ليستة تست',
  email: EMAIL,
  phone: '01012345678',
  payment_method: 'cod',
  total: 273,
  status: 'بانتظار التأكيد',
  items: [
    { id: 'x1', name: 'بالونات ذهبية', price: 89, quantity: 2 },
    { id: 'x2', name: 'علبة ماكارون', price: 95, quantity: 1 },
  ],
})
console.log('1) طلب حقيقي اتعمل في القاعدة:', ORDER_ID)

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

await page.goto(SITE, { waitUntil: 'domcontentloaded' })
await page.evaluate((email) => {
  localStorage.setItem('vanilliano_user', JSON.stringify({ id: 'u_list', name: 'ليستة تست', email, role: 'user', joinedAt: new Date().toISOString() }))
}, EMAIL)
await page.goto(SITE + 'dashboard', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await page.locator('button:has-text("الطلبات")').first().click()
await page.waitForTimeout(1200)

const text = await page.evaluate(() => document.body.innerText)
console.log('2) الطلب الحقيقي ظاهر في القائمة؟', text.includes(ORDER_ID) ? 'نعم ✅' : 'لا ❌')
console.log('3) المنتجات بالإجمالي ظاهرة؟', text.includes('بالونات ذهبية') && text.includes('علبة ماكارون') ? 'نعم ✅' : 'لا ❌')
console.log('4) مفيش طلبات وهمية؟', !text.includes('VNL-991234') && !text.includes('أم خالد') ? 'نعم ✅' : 'لا ❌')
console.log('5) فيه إجمالي الطلب بالعربي؟', text.includes('٢٧٣') ? 'نعم ✅ (٢٧٣ج)' : 'لا ❌')

await owner.from('orders').delete().eq('id', ORDER_ID)
console.log('6) تنظيف ✅')
console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()