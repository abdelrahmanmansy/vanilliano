export function formatPrice(amount) {
  return new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

export function formatDate(isoString) {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(isoString))
}

export function calculateDiscount(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
}

export function slugify(text) {
  return text
    .toString()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .toLowerCase()
}

export function scrollToTop(behavior = 'smooth') {
  window.scrollTo({ top: 0, behavior })
}

// ٠١٢ (عربي) و ۰۱۲ (فارسي) → 012 إنجليزي
const ARABIC_DIGITS = /[\u0660-\u0669\u06F0-\u06F9]/g

export function normalizeDigits(value = '') {
  return String(value).replace(ARABIC_DIGITS, (d) => {
    const code = d.charCodeAt(0)
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660)
  })
}

// حقل الموبايل: أرقام بس (إنجليزي/عربي) — أي حرف أو رمز أو كلام يتمسح
export function digitsOnly(value = '') {
  return normalizeDigits(value).replace(/[^\d]/g, '')
}