import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const ADMIN = 'https://abdelrahmanmansy.github.io/vanilliano/admin/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

await page.goto(ADMIN, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1200)
const email = page.locator('input[type="email"], input[placeholder*="البريد"], input[name="email"]').first()
await email.fill('abdelrahmanahmedmansy@gmail.com')
const pass = page.locator('input[type="password"]').first()
await pass.fill('Van1d4061147!')
await page.locator('button[type="submit"], button:has-text("دخول"), button:has-text("تسجيل الدخول")').first().click()
await page.waitForTimeout(2500)

// لو مش فتح الطلبات، ندوس على تبويب الطلبات
const ordersTab = page.locator('button:has-text("الطلبات"), a:has-text("الطلبات"), [role="tab"]:has-text("الطلبات")').first()
if (await ordersTab.count()) await ordersTab.click()
await page.waitForTimeout(2000)

const body = await page.locator('body').innerText()
console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
console.log('--- ملخص صفحة الطلبات ---')
console.log(body.slice(0, 2500))
await browser.close()