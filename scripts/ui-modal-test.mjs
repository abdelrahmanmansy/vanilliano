import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BADMIN = 'https://abdelrahmanmansy.github.io/vanilliano/admin/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
await page.setViewportSize({ width: 1280, height: 720 })
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

await page.goto(BADMIN, { waitUntil: 'networkidle' })
await page.fill('input[type="email"]', 'abdelrahmanmansy@gmail.com')
await page.fill('input[type="password"]', 'Van1d4061147!')
await page.click('button[type="submit"], .login .btn')
await page.waitForTimeout(1500)

await page.click('.sidebar button:has-text("المنتجات")')
await page.waitForTimeout(1000)

// النزول لعمود متأخر في الجدول ثم الضغط على تعديل
const rows = page.locator('table tbody tr')
await rows.nth(40).scrollIntoViewIfNeeded()
await page.waitForTimeout(300)
await rows.nth(40).locator('button:has-text("تعديل")').click()
await page.waitForTimeout(800)

const box = await page.evaluate(() => {
  const o = document.querySelector('.modal-overlay')
  const f = document.querySelector('.modal-form')
  if (!o || !f) return null
  const ob = o.getBoundingClientRect()
  const fb = f.getBoundingClientRect()
  return { overlayTop: Math.round(ob.top), formTop: Math.round(fb.top), formBottom: Math.round(fb.bottom), vh: window.innerHeight }
})
console.log('الفورم modal:', box ? `ظاهر فوق (top=${box.formTop}, bottom=${box.formBottom}, شاشة=${box.vh})` + (box.formTop >= 0 && box.formBottom <= box.vh ? ' ✅ مركزي كامل' : ' ⚠️ خارج الشاشة') : '❌ غير موجود')

// الضغط على الخلفية يقفل
await page.mouse.click(10, 360)
await page.waitForTimeout(400)
const closedMany = await page.locator('.modal-overlay').count()
console.log('إغلاق بالضغط على الخلفية:', closedMany === 0 ? '✅' : '❌')
console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()