import { WALLETS } from './constants.js'

const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent

export const isAndroid = /android/i.test(ua)
export const isIOS = /iphone|ipad|ipod/i.test(ua)
export const isMobileDevice = isAndroid || isIOS

// يبني الرابط اللي بنفتحه حسب الجهاز — دالة منفصلة عشان نقدر نختبرها
export const walletTarget = (wallet, platform) => {
  if (!wallet) return ''

  // لينك الاستقبال الحقيقي (ipn.eg) بيفتح التطبيق على الموبايل ويحبّي المبلغ
  if (wallet.scheme && platform !== 'desktop') return wallet.scheme

  // أندرويد: intent بيفتح التطبيق المثبّت على طول، ولو مش مثبّت بيفتح المتجر
  if (platform === 'android') {
    const fallback = wallet.install || wallet.web
    return (
      'intent://#Intent;' +
      (wallet.app ? `scheme=${wallet.app};` : '') +
      (wallet.pkg ? `package=${wallet.pkg};` : '') +
      `S.browser_fallback_url=${encodeURIComponent(fallback)};end`
    )
  }

  // آيفون: المتصفح مش بيسمح لأي موقع يفتح تطبيق تاني مثبّت
  return wallet.ios || wallet.install || wallet.web
}

// بنحاول نفتح التطبيق؛ لو فتح، المتصفح هيتخفي لوحده (visibilitychange).
// لو التطبيق مش موجود أو المتصفح رفض، بنرجع للمتجر بعد مهلة قصيرة.
const attemptOpen = (target, fallback) => {
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.visibilityState === 'hidden') clearTimeout(timer)
    },
    { once: false }
  )

  // المتصفح بيرفض فتح التطبيق => بيحط error على الصفحة ويفضل ظاهر.
  // نراقب: لو بعد 2 ثانية الصفحة لسه ظاهرة، يبقى التطبيق مش موجود.
  const timer = setTimeout(() => {
    window.onerror = null
    window.location.href = fallback
  }, 2000)

  window.location.href = target
}

export const openWallet = (walletId) => {
  const wallet = WALLETS.find((w) => w.id === walletId)
  if (!wallet) return

  const platform = isAndroid ? 'android' : isIOS ? 'ios' : 'desktop'
  const target = walletTarget(wallet, platform)
  if (!target) return

  const fallback = wallet.ios || wallet.install || wallet.web

  // كمبيوتر: افتح في تاب جديد عشان متسيبش الصفحة
  if (!isMobileDevice) {
    window.open(fallback, '_blank', 'noopener')
    return
  }

  // لينك الاستقبال: المتصفح بيفتحه لوحده، من غير ما نحتاج fallback
  if (wallet.scheme) {
    window.location.href = target
    return
  }

  attemptOpen(target, fallback)
}

// أي رابط IPA حقيقي بيفتح تطبيق انستا باي على الموبايل — نستخدمه بدل المتجر
export const hasInstapayDeepLink = Boolean(
  WALLETS.find((w) => w.id === 'instapay')?.scheme
)

export default WALLETS