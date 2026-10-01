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

// بنجرّب كذا رابط ورا بعض: أول واحد يفتح التطبيق بيوقف الباقي.
// لو المتصفح رفض كلهم، الصفحة هتفضل ظاهرة ونوديه للمتجر.
const openWithFallbacks = (targets, fallback) => {
  let index = 0
  let opened = false

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') opened = true
  })

  const tryNext = () => {
    if (opened || index >= targets.length) {
      if (!opened) window.location.href = fallback
      return
    }

    // المتصفح غالباً بيرفض custom scheme في بعض البيئات،
    // فبنجرب ب invisible iframe كمان قبل ما نستسلم
    const target = targets[index++]

    if (target.startsWith('intent://')) {
      window.location.href = target
      setTimeout(tryNext, 2500)
      return
    }

    const frame = document.createElement('iframe')
    frame.style.display = 'none'
    frame.src = target
    frame.onerror = () => frame.remove()
    document.body.appendChild(frame)
    setTimeout(() => {
      frame.remove()
      tryNext()
    }, 1200)

    window.location.href = target
    setTimeout(tryNext, 2500)
  }

  tryNext()
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

  //Scheme الخاص بالتطبيق أول حاجة (لو مسجّل)، بعدين intent، بعدين لينك مُسجَّل
  const targets = []
  if (wallet.schemeScheme) targets.push(wallet.schemeScheme)
  targets.push(target)

  openWithFallbacks(targets.filter(Boolean), fallback)
}

// أي رابط IPA حقيقي بيفتح تطبيق انستا باي على الموبايل — نستخدمه بدل المتجر
export const hasInstapayDeepLink = Boolean(
  WALLETS.find((w) => w.id === 'instapay')?.scheme
)

export default WALLETS