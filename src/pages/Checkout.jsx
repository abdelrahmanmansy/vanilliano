import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  MapPin,
  Phone,
  Truck,
  Store,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  MessageCircle,
  Banknote,
  Smartphone,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { supabaseService } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/format'
import instapayQr from '../assets/instapay-qr.jpg'
import vodafoneQr from '../assets/vodafone-qr.jpg'
import { validateCoupon } from '../data/coupons'
import {
  SHIPPING_COST,
  FREE_SHIPPING_THRESHOLD,
  STORAGE_KEYS,
  PHONE_REGEX,
  EMAIL_REGEX,
  STORE,
  PAYMENT,
  WHATSAPP_LINK,
} from '../utils/constants'
import Button from '../components/ui/Button'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import EmptyState from '../components/ui/EmptyState'
import { toast } from 'react-hot-toast'

const cities = [
  'القاهرة',
  'الجيزة',
  'حلوان',
  'المعادي',
  'مدينة نصر',
  'التجمع الخامس',
  '6 أكتوبر',
  'الشيخ زايد',
  'بدرشين',
  'دهشور',
  'إمبابة',
  'شبرا الخيمة',
  'المنوفية',
  'دار السلام',
  'الهرم',
  'العياط',
  'المنيب',
  'منطقة أخرى',
]

const paymentMethods = [
  {
    id: 'instapay',
    label: 'انستا باي InstaPay',
    desc: `تحويل فوري بالموبايل: ${PAYMENT.instapayDisplay}`,
    icon: Smartphone,
  },
  {
    id: 'vodafone',
    label: 'فودافون كاش Vodafone Cash',
    desc: `تحويل على المحفظة: ${PAYMENT.vodafoneCashDisplay}`,
    icon: Banknote,
  },
  {
    id: 'cod',
    label: 'الدفع عند الاستلام',
    desc: 'نقداً عند وصول طلبك (القاهرة والجيزة)',
    icon: Banknote,
  },
]

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [coupon, setCoupon] = useState(null)
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [payment, setPayment] = useState('instapay')
  const [deliveryMethod, setDeliveryMethod] = useState('delivery')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    branch: STORE.branches[0].name,
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [memberPercent, setMemberPercent] = useState(0)

  useEffect(() => {
    let alive = true
    if (user?.email) {
      supabaseService.firstOrderDiscount(user.email).then((p) => {
        if (alive) setMemberPercent(p)
      })
    } else {
      setMemberPercent(0)
    }
    return () => {
      alive = false
    }
  }, [user?.email])

  const shipping =
    deliveryMethod === 'pickup' ||
    subtotal === 0 ||
    subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_COST
  const discount = coupon ? coupon.discountValue : 0
  const memberAmount = Math.round((subtotal * memberPercent) / 100)
  const total = Math.max(subtotal - discount - memberAmount, 0) + shipping

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 3) next.name = 'يرجى إدخال اسمك الكامل لتتمكن من إتمام الطلب'
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email))
      next.email = form.email.trim() ? 'بريد إلكتروني غير صحيح' : 'يرجى إدخال البريد الإلكتروني لنتواصل معك'
    if (!PHONE_REGEX.test(form.phone)) next.phone = 'رقم جوال غير صحيح'
    if (deliveryMethod === 'delivery') {
      if (!form.city) next.city = 'اختر المنطقة'
      if (form.address.trim().length < 8) next.address = 'العنوان مختصر جداً'
    }
    return next
  }

  const handleApplyCoupon = () => {
    const result = validateCoupon(couponInput, subtotal, [])
    setCouponError('')
    if (!result.valid) {
      setCouponError(result.message)
      setCoupon(null)
      return
    }
    setCoupon(result)
  }

  const buildMessage = (items, orderTotal, orderShipping, orderDiscount) => {
    const paymentLabel = {
      instapay: `انستا باي (${PAYMENT.instapayDisplay})`,
      vodafone: `فودافون كاش (${PAYMENT.vodafoneCashDisplay})`,
      cod: 'الدفع عند الاستلام',
    }[payment]
    const paymentInstruction =
      payment === 'instapay'
        ? `📲 ارسل المبلغ على انستا باي: ${PAYMENT.instapayDisplay}`
        : payment === 'vodafone'
          ? `📲 ارسل المبلغ على فودافون كاش: ${PAYMENT.vodafoneCashDisplay}`
          : '💵 اطلب الدفع نقداً عند الاستلام'
    const siteURL = window.location.origin
    const lines = [
      `🛒 طلب جديد من ${STORE.name}`,
      '',
      `👤 الاسم: ${form.name}`,
      `📞 جوال العميل: ${form.phone}`,
      `📧 بريد العميل: ${form.email.trim()}`,
    ]
    if (deliveryMethod === 'delivery') {
      lines.push(`🚚 التوصيل إلى: ${form.city} — ${form.address}`)
    } else {
      lines.push(`🏬 الاستلام من: ${form.branch}`)
    }
    lines.push(`💳 طريقة الدفع: ${paymentLabel}`)
    lines.push(paymentInstruction)
    if (form.notes.trim()) lines.push(`📝 ملاحظات: ${form.notes.trim()}`)
    lines.push('', '📦 *تفاصيل الطلب:*')
    items.forEach((item, i) => {
      lines.push(
        `${i + 1}. ${item.name} × ${item.quantity} = ${formatPrice(item.price * item.quantity)} ج.م`,
      )
      if (item.image) lines.push(`🖼️ صورة المنتج: ${siteURL}${item.image}`)
    })
    if (orderDiscount > 0) lines.push(`🎁 الخصم: -${formatPrice(orderDiscount)} ج.م`)
    if (memberAmount > 0)
      lines.push(`🎉 خصم أول طلب لعضو جديد (${memberPercent}%): -${formatPrice(memberAmount)} ج.م`)
    lines.push(
      '',
      `💵 المجموع الفرعي: ${formatPrice(subtotal)} ج.م`,
      `🚚 الشحن: ${orderShipping === 0 ? 'مجاني' : `${formatPrice(orderShipping)} ج.م`}`,
      `✨ *الإجمالي: ${formatPrice(orderTotal)} ج.م*`,
      '',
      `🏬 ${STORE.name}`,
      `📍 العنوان: ${STORE.branches.map((b) => `${b.name} — ${b.address}`).join(' | ')}`,
      `📞 الموبايل: ${STORE.phoneDisplay}`,
      `🌐 الموقع: ${STORE.domain}`,
      'الرجاء تأكيد توفر الطلب وموعد التوصيل.',
    )
    return lines.join('\n')
  }

  const saveOrder = () => {
    const order = {
      id: `VNL-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      items: cart.map((item) => ({
        ...item.product,
        quantity: item.quantity,
      })),
      subtotal,
      discount,
      shipping,
      total,
      paymentMethod: payment,
      deliveryMethod,
      shippingInfo: { ...form },
      status: 'بانتظار التأكيد',
    }
    const existing = JSON.parse(
      window.localStorage.getItem(STORAGE_KEYS.orders) || '[]',
    )
    const notes = String(order.shippingInfo?.notes || '').trim()
    order.shippingInfo.notes = memberAmount > 0
      ? `${notes}${notes ? ' — ' : ''}خصم أول طلب ${memberPercent}% = -${formatPrice(memberAmount)} ج.م`.trim()
      : notes
    window.localStorage.setItem(
      STORAGE_KEYS.orders,
      JSON.stringify([order, ...existing]),
    )
    supabaseService.addOrder(order)
    supabaseService.addActivity({
      kind: 'purchase',
      label: `طلب جديد ${order.id} — ${order.shippingInfo?.name} — ${formatPrice(total)} ج.م`,
      meta: { order: order.id, total },
    })
    return order
  }

  const handlePlaceOrder = (viaWhatsApp = true) => {
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      toast.error('يرجى استكمال بيانات الطلب أولاً')
      return
    }
    const order = saveOrder()
    const message = buildMessage(order.items, order.total, order.shipping, order.discount)
    setPlacing(true)
    setTimeout(() => {
      clearCart()
      if (viaWhatsApp) window.open(WHATSAPP_LINK(message), '_blank')
      setPlacing(false)
      setPlacedOrder({ ...order, message, viaWhatsApp })
      toast.success(
        viaWhatsApp
          ? 'جهّزنا طلبك على الواتساب! أرسل الرسالة لتأكيد الطلب 💚'
          : 'تم استلام طلبك في الموقع! سنتواصل معك لتأكيده ✅',
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 900)
  }

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6">
        <div className="animate-scale-in rounded-[2.5rem] border border-vanilla-100 bg-white p-10 shadow-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h1 className="mb-2 text-2xl font-black text-burgundy-950">
            شكراً لك! طلبك جاهز للإرسال 🎉
          </h1>
          <p className="mb-3 text-sm text-burgundy-900/60">
            فتحنا لك واتساب برسالة جاهزة فيها تفاصيل طلبك — اضغط إرسال وخلاص،
            هنرد عليك فوراً للتأكيد.
          </p>
          <p className="mb-6 text-sm text-burgundy-900/60">
            رقم الطلب:{' '}
            <span className="font-black text-burgundy-700" dir="ltr">
              {placedOrder.id}
            </span>
          </p>

          <div className="mb-8 rounded-2xl border border-vanilla-100 bg-cream-50/60 p-4">
            <ul className="space-y-2 text-right">
              {placedOrder.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 font-bold text-burgundy-950">
                    <img
                      src={item.image}
                      alt=""
                      className="h-9 w-9 rounded-lg object-cover"
                    />
                    {item.name}{' '}
                    <span className="text-xs text-burgundy-900/40">
                      × {item.quantity}
                    </span>
                  </span>
                  <span className="font-black text-burgundy-900">
                    {formatPrice(item.price * item.quantity)} ج.م
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-vanilla-100 pt-3 text-base font-black text-burgundy-950">
              <span>الإجمالي</span>
              <span>{formatPrice(placedOrder.total)} ج.م</span>
            </div>
          </div>

          <div className="mb-8 rounded-2xl bg-burgundy-700 p-4 text-right text-sm text-white">
            <p className="mb-1 font-black">🏬 {STORE.name}</p>
            <p className="mb-1 text-xs text-white/80">
              📍 {STORE.branches.map((b) => `${b.name} — ${b.address}`).join(' | ')}
            </p>
            <p className="text-xs text-white/80">
              📞 {STORE.phoneDisplay} · 🌐 {STORE.domain}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href={WHATSAPP_LINK(placedOrder.message)} target="_blank" rel="noreferrer">
              <Button size="lg" icon={MessageCircle} variant="success">
                إعادة فتح واتساب
              </Button>
            </a>
            <Link to="/products">
              <Button size="lg">متابعة التسوق</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <Breadcrumbs items={[{ label: 'إتمام الطلب' }]} />
        <EmptyState
          icon={ShoppingBag}
          title="لا يوجد ما تشتريه بعد"
          description="أضف منتجات إلى سلتك ثم عد هنا لإتمام طلبك عبر واتساب."
          actionLabel="تصفح المتجر"
          onAction={() => navigate('/products')}
        />
      </div>
    )
  }

  const inputClass = (error) =>
    `w-full rounded-2xl border bg-cream-50/60 px-4 py-3 text-sm font-bold outline-none focus:border-burgundy-400 ${
      error ? 'border-red-300' : 'border-vanilla-200'
    }`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ label: 'إتمام الطلب' }]} />
      <h1 className="mb-1 text-2xl font-black text-burgundy-950 md:text-3xl">
        إتمام الطلب
      </h1>
      <p className="mb-8 text-sm text-burgundy-900/50">
        عبّئ بياناتك وستصلك الرسالة جاهزة على واتساب لتأكيد الطلب.
      </p>

      {memberPercent > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-sm font-black">مبروك! خصم أول طلب {memberPercent}%</p>
            <p className="text-xs font-bold text-emerald-600/80">
              لإنك عضو جديد، اتخصم -{formatPrice(memberAmount)} ج.م من طلبك الحالي.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-burgundy-950">
              <User size={20} className="text-burgundy-700" />
              بياناتك
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                  الاسم الكامل *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="اسمك الكريم"
                  className={inputClass(errors.name)}
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] font-bold text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                  رقم الجوال *
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-burgundy-900/40"
                  />
                  <input
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className={`${inputClass(errors.phone)} py-3 pl-4 pr-11`}
                    style={{ textAlign: 'right' }}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-[11px] font-bold text-red-500">
                    {errors.phone}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                  البريد الإلكتروني{' '}
                  <span className="text-burgundy-700">(راجع عليه خطوات طلبك)</span>
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="you@email.com"
                  className={inputClass(errors.email)}
                  style={{ textAlign: 'right' }}
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] font-bold text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-burgundy-950">
              <MapPin size={20} className="text-burgundy-700" />
              طريقة الاستلام
            </h2>

            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              {[
                {
                  id: 'delivery',
                  label: 'توصيل للمنزل',
                  desc: 'نوصل لعنوانك — 25 ج.م (مجاني فوق 300 ج.م)',
                  icon: Truck,
                },
                {
                  id: 'pickup',
                  label: 'استلام من الفرع',
                  desc: 'وفّر رسوم الشحن وخذ طلبك من أقرب فرع',
                  icon: Store,
                },
              ].map(({ id, label, desc, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setDeliveryMethod(id)}
                  className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-right transition-all ${
                    deliveryMethod === id
                      ? 'border-burgundy-700 bg-burgundy-50/50'
                      : 'border-vanilla-200 hover:border-vanilla-300'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      deliveryMethod === id
                        ? 'bg-burgundy-700 text-white'
                        : 'bg-cream-100 text-burgundy-900/50'
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-black text-burgundy-950">
                      {label}
                    </span>
                    <span className="block text-xs text-burgundy-900/50">
                      {desc}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {deliveryMethod === 'delivery' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                    المنطقة *
                  </label>
                  <select
                    value={form.city}
                    onChange={(e) => setField('city', e.target.value)}
                    className={inputClass(errors.city)}
                  >
                    <option value="">اختر المنطقة</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-[11px] font-bold text-red-500">
                      {errors.city}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                    العنوان التفصيلي *
                  </label>
                  <input
                    value={form.address}
                    onChange={(e) => setField('address', e.target.value)}
                    placeholder="الحي، الشارع، رقم المبنى"
                    className={inputClass(errors.address)}
                  />
                  {errors.address && (
                    <p className="mt-1 text-[11px] font-bold text-red-500">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                  اختر الفرع *
                </label>
                <select
                  value={form.branch}
                  onChange={(e) => setField('branch', e.target.value)}
                  className={inputClass()}
                >
                  {STORE.branches.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name} — {b.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                ملاحظات (اختياري)
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                placeholder="أي تفاصيل إضافية تخص طلبك..."
                className="w-full resize-none rounded-2xl border border-vanilla-200 bg-cream-50/60 px-4 py-3 text-sm font-bold outline-none focus:border-burgundy-400"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-burgundy-950">
              <ShieldCheck size={20} className="text-burgundy-700" />
              طريقة الدفع
            </h2>

            <div className="space-y-3">
              {paymentMethods.map(({ id, label, desc, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPayment(id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-right transition-all ${
                    payment === id
                      ? 'border-burgundy-700 bg-burgundy-50/50'
                      : 'border-vanilla-200 hover:border-vanilla-300'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      payment === id
                        ? 'bg-burgundy-700 text-white'
                        : 'bg-cream-100 text-burgundy-900/50'
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-black text-burgundy-950">
                      {label}
                    </span>
                    <span className="block text-xs text-burgundy-900/50">
                      {desc}
                    </span>
                  </span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      payment === id
                        ? 'border-burgundy-700 bg-burgundy-700'
                        : 'border-burgundy-200'
                    }`}
                  >
                    {payment === id && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </button>
              ))}
            </div>

            {payment === 'instapay' && (
              <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-vanilla-100 bg-cream-50 p-4 text-center">
                <img
                  src={instapayQr}
                  alt="كود QR لانستا باي"
                  className="h-44 w-44 rounded-2xl bg-white object-contain p-2 shadow-sm"
                />
                <p className="text-xs font-black text-burgundy-950">
                  امسح الكود بالتطبيق لتحويل المبلغ مباشرة
                </p>
                <p className="text-[11px] text-burgundy-900/50">
                  أو حوّل على: {PAYMENT.instapayDisplay}
                </p>
              </div>
            )}

            {payment === 'vodafone' && (
              <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-vanilla-100 bg-cream-50 p-4 text-center">
                <img
                  src={vodafoneQr}
                  alt="كود QR لفودافون كاش"
                  className="h-44 w-44 rounded-2xl bg-white object-contain p-2 shadow-sm"
                />
                <p className="text-xs font-black text-burgundy-950">
                  امسح الكود بالتطبيق لتحويل المبلغ مباشرة
                </p>
                <p className="text-[11px] text-burgundy-900/50">
                  أو حوّل على: {PAYMENT.vodafoneCashDisplay}
                </p>
              </div>
            )}

            <p className="mt-4 rounded-2xl bg-vanilla-50 p-4 text-xs leading-relaxed text-burgundy-900/60">
              💚 الطلب يصل جاهزاً على واتساب مع رقم الدفع — لا يُحصل أي مبلغ الآن،
              الدفع يكون بانستا باي أو فودافون كاش قبل الشحن (أو نقداً عند
              الاستلام للقاهرة والجيزة).
            </p>

            <Button
              size="lg"
              fullWidth
              className="mt-6"
              icon={MessageCircle}
              variant="success"
              loading={placing}
              onClick={handlePlaceOrder}
            >
              {placing ? 'جاهز رسالتك...' : 'إرسال الطلب عبر واتساب'}
            </Button>
          </div>
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm lg:sticky lg:top-40">
          <h2 className="mb-4 text-lg font-black text-burgundy-950">
            ملخص طلبك ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h2>

          <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {cart.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="line-clamp-1 text-xs font-black text-burgundy-950">
                    {item.product.name}
                  </p>
                  <p className="text-[11px] text-burgundy-900/40">
                    × {item.quantity}
                  </p>
                </div>
                <span className="text-xs font-black text-burgundy-900">
                  {formatPrice(item.product.price * item.quantity)} ج.م
                </span>
              </li>
            ))}
          </ul>

          {/* Coupon */}
          <div className="mt-5">
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="كود الخصم"
                className="w-full rounded-full border border-vanilla-200 bg-cream-50 px-4 py-2.5 text-xs font-bold outline-none focus:border-burgundy-400"
              />
              <Button variant="secondary" size="sm" onClick={handleApplyCoupon}>
                تطبيق
              </Button>
            </div>
            {couponError && (
              <p className="mt-2 text-[11px] font-bold text-red-500">
                {couponError}
              </p>
            )}
            {coupon && (
              <p className="mt-2 text-[11px] font-bold text-emerald-600">
                تم تطبيق خصم {formatPrice(coupon.discountValue)} ج.م
              </p>
            )}
          </div>

          <div className="mt-5 space-y-2.5 border-t border-vanilla-100 pt-4 text-sm">
            <div className="flex justify-between text-burgundy-900/70">
              <span>المجموع الفرعي</span>
              <span className="font-bold">{formatPrice(subtotal)} ج.م</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>الخصم</span>
                <span className="font-bold">-{formatPrice(discount)} ج.م</span>
              </div>
            )}
            {memberAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>خصم أول طلب ({memberPercent}%)</span>
                <span className="font-bold">-{formatPrice(memberAmount)} ج.م</span>
              </div>
            )}
            <div className="flex justify-between text-burgundy-900/70">
              <span>الشحن</span>
              <span className="font-bold">
                {shipping === 0 ? 'مجاني' : `${formatPrice(shipping)} ج.م`}
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-vanilla-100 pt-4">
            <span className="font-black text-burgundy-950">الإجمالي</span>
            <span className="text-2xl font-black text-burgundy-900">
              {formatPrice(total)}{' '}
              <span className="text-sm">ج.م</span>
            </span>
          </div>

          <div className="mt-4 space-y-1.5 text-[11px] text-burgundy-900/40">
            <p className="flex items-center gap-1.5">
              <MessageCircle size={13} /> تأكيد فوري عبر الواتساب
            </p>
            <p className="flex items-center gap-1.5">
              <ShieldCheck size={13} /> انستا باي · فودافون كاش · عند الاستلام
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}