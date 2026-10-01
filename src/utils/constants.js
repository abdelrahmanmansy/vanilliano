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

// ===== أرقام التحويل =====
// غير الأرقام هنا بس، وهي هتظهر في صفحة الدفع على طول
export const WALLET_NUMBERS = {
  vodafone: { phone: '01009942440', display: '\u200E010 0994 2440' },
  orange: { phone: '01009942440', display: '\u200E010 0994 2440' },
  etisalat: { phone: '01009942440', display: '\u200E010 0994 2440' },
  we: { phone: '01009942440', display: '\u200E010 0994 2440' },
  instapay: { phone: '01111846842', display: '\u200E0111 1846 842' },
}

// المحافظ الإلكترونية في مصر — الزر بيفتح تطبيق المحفظة على الموبايل مباشرة
// pkg = اسم التطبيق الرسمي في جوجل بلاي (متحقق منه)
// install = صفحة المتجر لو التطبيق مش مثبّت | web = الموقع الرسمي
export const WALLETS = [
  {
    id: 'vodafone',
    name: 'فودافون كاش',
    emoji: '🔴',
    color: '#e60000',
    ...WALLET_NUMBERS.vodafone,
    pkg: 'com.vodafone.spoc',
    install: 'https://play.google.com/store/apps/details?id=com.vodafone.spoc',
    // آيفون: تطبيق فودافون كاش المصري غير متاح منفصل —
    // محفظته جوه تطبيق Ana Vodafone. بنوديه على صفحة فودافون كاش.
    ios: 'https://www.vodafone.com.eg/vodafone-cash',
    web: 'https://www.vodafone.com.eg/vodafone-cash',
  },
  {
    id: 'orange',
    name: 'محفظة أورنج',
    emoji: '🟠',
    color: '#ff7900',
    ...WALLET_NUMBERS.orange,
    pkg: 'com.orange.orangemoney_customer',
    install:
      'https://play.google.com/store/apps/details?id=com.orange.orangemoney_customer',
    // آيفون: تطبيق أورنج موني المصري غير متاح، ومحفظةه بتتوزّع
    // على تطبيق My Orange. بنوديه على الموقع الرسمي بدل متجر خاطئ.
    ios: 'https://www.orange.eg/ar/mobile-money',
    web: 'https://www.orange.eg/ar/mobile-money',
  },
  {
    id: 'etisalat',
    name: 'محفظة اتصالات كاش',
    emoji: '🟢',
    color: '#8cc63f',
    ...WALLET_NUMBERS.etisalat,
    pkg: 'com.etisalat.flous',
    install: 'https://play.google.com/store/apps/details?id=com.etisalat.flous',
    // آيفون: نفس التطبيق باسم e& money - EG
    ios: 'https://apps.apple.com/eg/app/e-money-eg/id1123428821',
    web: 'https://www.etisalat.eg/ar/consumer/ecash',
  },
  {
    id: 'we',
    name: 'محفظة وي',
    emoji: '🟣',
    color: '#6a1b9a',
    ...WALLET_NUMBERS.we,
    pkg: 'com.TE.WEWallet',
    install: 'https://play.google.com/store/apps/details?id=com.TE.WEWallet',
    ios: 'https://apps.apple.com/eg/app/we-pay-eg/id1485158275',
    web: 'https://we.eg/ar',
  },
  {
    id: 'instapay',
    name: 'انستا باي',
    emoji: '🟣',
    color: '#5b21b6',
    ...WALLET_NUMBERS.instapay,
    pkg: 'com.egyptianbanks.instapay',
    install:
      'https://play.google.com/store/apps/details?id=com.egyptianbanks.instapay',
    ios: 'https://apps.apple.com/eg/app/instapay-egypt/id1592108795',
    // آيفون: نطاق ipn.eg مُسجَّل رسمياً، لكن لازم لينك استقبال حقيقي
    // (ipn.eg/S/الاسم/instapay/الكود) — أي رابط تاني التطبيق بيرفضه.
    appLink: PAYMENT.instapayLink || '',
    // لينك الاستقبال الحقيقي (ipn.eg/S/.../instapay/CODE) بيحبّي المبلغ جوه التطبيق
    scheme: PAYMENT.instapayLink || '',
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