import { WALLETS } from './constants.js'

const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent

export const isAndroid = /android/i.test(ua)
export const isIOS = /iphone|ipad|ipod/i.test(ua)
export const isMobileDevice = isAndroid || isIOS

// يبني الرابط اللي بنفتحه حسب الجهاز — دالة منفصلة عشان نقدر نختبرها
export const walletTarget = (wallet, platform) => {
  if (!wallet) return ''

  // لينك الاستقبال الحقيقي (ipn.eg/S/...) بيفتح التطبيق والمبلغ متعبّى
  if (wallet.scheme && platform !== 'desktop') return wallet.scheme

  // نطاق مُسجَّل رسمياً للتطبيق (App Links / Universal Links):
  // أي رابط عليه بيقفل التطبيق لوحده على أندرويد وآيفون.
  if (wallet.appLink && platform !== 'desktop') return wallet.appLink

  // أندرويد: intent بيفتح التطبيق المثبّت على طول، ولو مش مثبّت بيفتح المتجر
  if (platform === 'android') {
    const fallback = wallet.install || wallet.web
    return (
      'intent://#Intent;' +
      (wallet.pkg ? `package=${wallet.pkg};` : '') +
      `S.browser_fallback_url=${encodeURIComponent(fallback)};end`
    )
  }

  // آيفون: المتصفح مش بيسمح لأي موقع يفتح تطبيق تاني مثبّت
  return wallet.ios || wallet.install || wallet.web
}

// بنفتح رابط نطاق مُسجَّل: لو التطبيق مثبّت المتصفح هيفتحه على طول
// (بيحصل visibilitychange). لو مش مثبّت، الصفحة هتفضل ظاهرة ونوديه للمتجر.
const openAppLink = (target, fallback) => {
  let done = false

  const timer = setTimeout(() => {
    if (done) return
    window.location.href = fallback
  }, 2500)

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      done = true
      clearTimeout(timer)
    }
  })

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

  // لينك مُسجَّل (ipn.eg) أو لينك استقبال: المتصفح بيفتح التطبيق لوحده،
  // ولو التطبيق مش مثبّت بنوديه لصفحة التحميل بعد مهلة.
  if (wallet.scheme || wallet.appLink) {
    openAppLink(target, fallback)
    return
  }

  window.location.href = target
}

// أي رابط IPA حقيقي بيفتح تطبيق انستا باي على الموبايل — نستخدمه بدل المتجر
export const hasInstapayDeepLink = Boolean(
  WALLETS.find((w) => w.id === 'instapay')?.scheme
)

export default WALLETS