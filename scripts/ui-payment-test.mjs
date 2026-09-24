import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const SITE = 'https://abdelrahmanmansy.github.io/vanilliano/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

await page.goto(SITE, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => {
  localStorage.setItem('vanilliano_cart', JSON.stringify([{
    id: 'balloon-set-gold', variant: null, quantity: 1,
    product: { id: 'balloon-set-gold', name: 'بالونات ذهبية', price: 89, oldPrice: null, image: null, category: 'منتجات', stock: 'in' },
  }]))
})
await page.goto(SITE + 'checkout', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

const positions = await page.evaluate(() => {
  const measureLeft = (el, text) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let n
    while ((n = walker.nextNode())) {
      const idx = n.data.indexOf(text)
      if (idx === -1) continue
      const r = document.createRange()
      r.setStart(n, idx)
      r.setEnd(n, idx + text.length)
      return Math.round(r.getBoundingClientRect().left)
    }
    return null
  }
  const els = [...document.querySelectorAll('p')]
  const insta = els.find((e) => e.textContent.includes('تحويل فوري بالموبايل'))
  const voda = els.find((e) => e.textContent.includes('تحويل على المحفظة'))
  return {
    insta: insta ? ['0111', '1846', '842'].map((c) => measureLeft(insta, c)) : null,
    voda: voda ? ['010', '0994', '2440'].map((c) => measureLeft(voda, c)) : null,
    bodyHasReversedInsta: document.body.innerText.includes('84218460111'),
    bodyHasReversedVoda: document.body.innerText.includes('2440994010'),
  }
})

const checkOrder = (arr, label) => {
  if (!arr) return `${label}: ❌ عنصر غير موجود`
  const [a, b, c] = arr
  const ok = a !== null && b !== null && c !== null && a < b && b < c
  return `${label}: ${ok ? '✅ معروض بالترتيبى مظبوط' : '❌ مقلوب (' + JSON.stringify(arr) + ')'}`
}
console.log(checkOrder(positions.insta, 'انستا باي (0111 1846 842)'))
console.log(checkOrder(positions.voda, 'فودافون كاش (010 0994 2440)'))
console.log('مفيش رقم مقلوب مدمج في الصفحة؟', !positions.bodyHasReversedInsta && !positions.bodyHasReversedVoda ? 'نعم ✅' : 'لا ❌')
console.log('PAGEERRORS:', pageErrors.join(' || ') || '(none)')
await browser.close()