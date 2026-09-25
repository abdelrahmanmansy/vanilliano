import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SITE = 'https://abdelrahmanmansy.github.io/vanilliano/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

await page.goto(SITE, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

const credit = page.locator('footer p:has-text("ABDELRAHMAN MANSY")')
console.log('1) سطر التطوير والتصميم في الفوتر؟', (await credit.count()) > 0 ? 'نعم ✅' : 'لا ❌')
const text = await credit.first().innerText().catch(() => '')
console.log('2) النص صحيح؟', text.includes('Designed & Developed by Abdelrahman Mansy') ? 'نعم ✅' : 'لا ❌ ' + text)
console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()