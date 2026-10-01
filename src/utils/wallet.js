import { WALLETS } from './constants.js'

const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent

export const isAndroid = /android/i.test(ua)
export const isIOS = /iphone|ipad|ipod/i.test(ua)
export const isMobileDevice = isAndroid || isIOS

// يبني الرابط اللي بنفتحه حسب الجهاز — دالة منفصلة عشان نقدر نختبرها
export const walletTarget = (wallet, platform) => {
  if (!wallet) return ''

  // انستا باي: لينك الاستقبال الحقيقي بيفتح تطبيق انستا باي على الموبايل
  if (wallet.scheme && platform !== 'desktop') return wallet.scheme

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
  // بنفتح صفحة المتجر الرسمي، ولو معروف لينك الآيفون بنفتحه
  return wallet.ios || wallet.install || wallet.web
}

export const openWallet = (walletId) => {
  const wallet = WALLETS.find((w) => w.id === walletId)
  const target = walletTarget(
    wallet,
    isAndroid ? 'android' : isIOS ? 'ios' : 'desktop'
  )
  if (!target) return

  // كمبيوتر: افتح في تاب جديد عشان متسيبش الصفحة
  if (!isMobileDevice) {
    window.open(target, '_blank', 'noopener')
    return
  }

  window.location.href = target
}

// أي رابط IPA حقيقي بيفتح تطبيق انستا باي على الموبايل — نستخدمه بدل المتجر
export const hasInstapayDeepLink = Boolean(
  WALLETS.find((w) => w.id === 'instapay')?.scheme
)

export default WALLETS