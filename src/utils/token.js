// توكن العميل الشخصي ("كل طلباتك") بقى بيتحسب على السيرفر بملح سري
// (شوف public.customer_token في supabase/migrations/20261008_security_hardening.sql).
// المتصفح بيحفظه بس عشان يفتح طلبات العميل من غير ما يكتب حاجة.
export const TOKEN_KEY = 'vanilliano_token'

export function readStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function saveStoredToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, String(token))
  } catch {
    /* ignore */
  }
}
