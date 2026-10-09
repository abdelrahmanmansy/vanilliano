// رقم طلب عشوائي صعب التخمين (بدل آخر 6 أرقام من الوقت)
// 8 حروف من 31 حرف/رقم (من غير 0/O/1/I/L عشان مايتلخبطوش) ≈ 850 مليار احتمال
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function newOrderId(prefix = 'VNL') {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  let out = ''
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length]
  return `${prefix}-${out}`
}
