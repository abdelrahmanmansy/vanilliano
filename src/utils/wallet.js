import { WALLETS } from '../utils/constants'

// يفتح محفظة العميل، ولو التطبيق مش متثبّت يفتح صفحة المتجر الرسمية
export const openWallet = (walletId) => {
  const wallet = WALLETS.find((w) => w.id === walletId)
  if (!wallet) return
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

  if (isIOS && wallet.app) {
    window.location.href = wallet.app.replace('market://', 'itms-apps://')
    setTimeout(() => {
      if (document.visibilityState === 'visible') window.location.href = wallet.web
    }, 1800)
    return
  }

  window.location.href = wallet.app || wallet.web
}

export default WALLETS