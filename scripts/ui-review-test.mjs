import { chromium } from 'playwright-core'
import { createClient } from '@supabase/supabase-js'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BADMIN = 'https://abdelrahmanmansy.github.io/vanilliano/admin/'
const url = 'https://cjhcohxkhgglxqgmuntt.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaGNvaHhraGdnbHhxZ211bnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNzg4MzQsImV4cCI6MjEwNTY1NDgzNH0.5-V0L72ypCgIB8akl8_maKNkGrovEp9gZEj4GDx4flA'

const owner = createClient(url, anonKey)
await owner.auth.signInWithPassword({ email: 'abdelrahmanahmedmansy@gmail.com', password: 'Van1d4061147!' })

// تنظيف أي بقايا من تشغيل سابق ثم إنشاء رأي تجريبي
await owner.from('reviews').delete().eq('name', 'تست مراجعة آلية')
const { data: ins } = await owner.from('reviews').insert({ name: 'تست مراجعة آلية', text: 'مراجعة فحص آلية', rating: 4, approved: false }).select('id')
const rid = ins[0].id
console.log('1) رأي تجريبي اتقفل, id =', rid)

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

await page.goto(BADMIN, { waitUntil: 'networkidle' })
await page.fill('input[type="email"]', 'abdelrahmanahmedmansy@gmail.com')
await page.fill('input[type="password"]', 'Van1d4061147!')
await page.click('button[type="submit"], .login .btn')
await page.waitForTimeout(1500)

await page.click('.sidebar button:has-text("آراء العملاء")')
await page.waitForTimeout(1500)

const items = await page.locator('.msg-item').count()
console.log('2) التبويب فيه مراجعات:', items, items > 0 ? '✅' : '❌')

const testItem = page.locator('.msg-item', { hasText: 'تست مراجعة آلية' }).first()
const approvedBtn = testItem.locator('button:has-text("موافقة ونشر")')
console.log('3) الزر موافقة ونشر موجود للرأي التجريبي؟', (await approvedBtn.count()) > 0 ? '✅' : '❌')
if ((await approvedBtn.count()) > 0) {
  await approvedBtn.click()
  await page.waitForTimeout(1500)
}

const { data: chk } = await owner.from('reviews').select('approved').eq('id', rid)
console.log('4) الرأي اتموافق عليه في DB؟', chk?.[0]?.approved === true ? 'نعم ✅' : 'لا ❌')

await owner.from('reviews').delete().eq('id', rid)
console.log('5) تنظيف الرأي التجريبي ✅')

console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()