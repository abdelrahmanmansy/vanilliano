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

  // أندرويد: بنطلب الـlauncher activity صراحةً (MAIN/LAUNCHER).
  // لو طلبنا VIEW من غير بيانات، مفيش Activity هيتطابق فبيقع على fallback.
  if (platform === 'android') {
    const fallback = wallet.install || wallet.web
    return (
      'intent://#Intent;action=android.intent.action.MAIN;' +
      'category=android.intent.category.LAUNCHER;' +
      (wallet.pkg ? `package=${wallet.pkg};` : '') +
      `S.browser_fallback_url=${encodeURIComponent(fallback)};end`
    )
  }

  // نطاق مُسجَّل رسمياً للتطبيق — بيفتحه على آيفون (Universal Links).
  // لازم يكون لينك استقبال حقيقي، وإلا التطبيق هيقول «رابط غير صحيح».
  if (wallet.appLink && platform === 'ios') return wallet.appLink

  // آيفون: المتصفح مش بيسمح لأي موقع يفتح تطبيق تاني مثبّت
  return wallet.ios || wallet.install || wallet.web
}

// لو فتح التطبيق، الصفحة هتختفي (visibilitychange).
// لو رفض المتصفح، بعد 2.5 ثانية نوديه للمتجر.
const openApp = (target, fallback) => {
  let opened = false

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') opened = true
  })

  setTimeout(() => {
    if (!opened) window.location.href = fallback
  }, 2500)

  window.location.href = target
}

export const openWallet = (walletId) => {
  const wallet = WALLETS.find((w) => w.id === walletId)
  if (!wallet) return

  const platform = isAndroid ? 'android' : isIOS ? 'ios' : 'desktop'
  const target = walletTarget(wallet, platform)
  if (!target) return

  // الـfallback لازم يبقى لنفس الجهاز — مش ممكن نودي أندرويد على App Store
  const fallback =
    platform === 'android'
      ? wallet.install || wallet.web
      : platform === 'ios'
        ? wallet.ios || wallet.web
        : wallet.web || wallet.install

  // كمبيوتر: افتح في تاب جديد عشان متسيبش الصفحة
  if (!isMobileDevice) {
    window.open(fallback, '_blank', 'noopener')
    return
  }

  openApp(target, fallback)
}

export default WALLETS