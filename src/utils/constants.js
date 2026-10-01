export const STORAGE_KEYS = {
  cart: 'vanilliano_cart',
  wishlist: 'vanilliano_wishlist',
  user: 'vanilliano_user',
  orders: 'vanilliano_orders',
  products: 'vanilliano_products',
}

export const STORE = {
  name: 'فانيليانو Vanilliano',
  domain: 'vanilliano.com',
  email: 'vanilliano@gmail.com',
  currency: 'ج.م',
  whatsapp: '201118215741',
  phoneDisplay: '\u200E010 0994 2440 · \u200E011 1821 5741',
  phones: ['010 0994 2440', '011 1821 5741'],
  branches: [
    { name: 'فرع دهشور', address: 'بدرشين، الجيزة بجوار كورشي مول' },
  ],
  hours: 'يومياً من 10 صباحاً حتى 12 منتصف الليل',
}

export const PAYMENT = {
  instapay: '01111846842',
  instapayDisplay: '\u200E0111 1846 842',
  // لينك الاستقبال الحقيقي بتاعك من تطبيق InstaPay (IPA -> مشاركة/لينك)
  // شكله: https://ipn.eg/S/<اسمالحساب>/instapay/<الكود>
  // لو فاضي: الزر هيفتح الموقع الرسمي بدل ما يدي رسالة «رابط غير صحيح».
  instapayLink: '',
  vodafoneCash: '01009942440',
  vodafoneCashDisplay: '\u200E010 0994 2440',
}

// المحافظ الإلكترونية في مصر — كل واحد بيفتح محفظته أو تطبيق بنكه
export const WALLETS = [
  {
    id: 'vodafone',
    name: 'فودافون كاش',
    emoji: '🔴',
    color: '#e60000',
    phone: '01009942440',
    phoneDisplay: '0100 994 2440',
    // Vodafone Cash universal link: بيفتح المحفظة لو مش متثبتة بيفتح المتجر
    app: 'market://details?id=com.vodafone.vodafonecash',
    web: 'https://www.vodafone.com.eg/vodafone-cash',
  },
  {
    id: 'orange',
    name: 'محفظة أورنج',
    emoji: '🟠',
    color: '#ff7900',
    phone: '01009942440',
    phoneDisplay: '0100 994 2440',
    app: 'market://details?id=com.orange.mwallet.eg',
    web: 'https://www.orange.eg/en/mobile-money',
  },
  {
    id: 'etisalat',
    name: 'محفظة اتصالات كاش',
    emoji: '🟢',
    color: '#8cc63f',
    phone: '01009942440',
    phoneDisplay: '0100 994 2440',
    app: 'market://details?id=com.etisalat.wallet.eg',
    web: 'https://www.etisalat.eg/en/consumer/ecash',
  },
  {
    id: 'we',
    name: 'محفظة وي',
    emoji: '🟣',
    color: '#6a1b9a',
    phone: '01009942440',
    phoneDisplay: '0100 994 2440',
    app: 'market://details?id=aramexplus.eg',
    web: 'https://www.aramexplus.com/',
  },
  {
    id: 'instapay',
    name: 'انستا باي',
    emoji: '🟣',
    color: '#5b21b6',
    phone: '01111846842',
    phoneDisplay: '0111 1846 842',
    app: '',
    web: 'https://www.instapay.eg',
  },
]

export const WHATSAPP_LINK = (text = '') =>
  `https://wa.me/${STORE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const HOME_PAGE_SIZE = 8

export const SHIPPING_COST = 25

export const FREE_SHIPPING_THRESHOLD = 300

export const PHONE_REGEX = /^(\+?\d{8,15})$/

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const SORT_OPTIONS = [
  { id: 'default', label: 'الأكثر صلة' },
  { id: 'price_asc', label: 'السعر: من الأقل إلى الأعلى' },
  { id: 'price_desc', label: 'السعر: من الأعلى إلى الأقل' },
  { id: 'rating', label: 'الأعلى تقييماً' },
  { id: 'newest', label: 'الأحدث أولاً' },
  { id: 'sale', label: 'أفضل الخصومات' },
]