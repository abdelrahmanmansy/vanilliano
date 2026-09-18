import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/format'
import { validateCoupon } from '../data/coupons'
import {
  SHIPPING_COST,
  FREE_SHIPPING_THRESHOLD,
} from '../utils/constants'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import Breadcrumbs from '../components/ui/Breadcrumbs'

export default function Cart() {
  const { cart, removeItem, updateQuantity, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [usedCodes] = useState([])

  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const discount = coupon ? coupon.discountValue : 0
  const total = Math.max(subtotal - discount, 0) + shipping

  const remainingForFree = FREE_SHIPPING_THRESHOLD - subtotal

  const handleApplyCoupon = () => {
    const result = validateCoupon(couponInput, subtotal, usedCodes)
    setCouponError('')
    if (!result.valid) {
      setCouponError(result.message)
      setCoupon(null)
      return
    }
    setCoupon(result)
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <Breadcrumbs items={[{ label: 'سلة التسوق' }]} />
        <EmptyState
          icon={ShoppingBag}
          title="سلتك فارغة حالياً"
          description="اكتشف تشكيلتنا الواسعة من خامات الحلويات ومستلزمات الحفلات وابدأ التسوق."
          actionLabel="تصفح المنتجات"
          onAction={() => navigate('/products')}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ label: 'سلة التسوق' }]} />
      <h1 className="mb-6 text-2xl font-black text-burgundy-950 md:text-3xl">
        سلة التسوق
      </h1>

      {remainingForFree > 0 && (
        <div className="mb-6 rounded-2xl border border-vanilla-200 bg-vanilla-50 p-4">
          <p className="mb-2 text-sm font-bold text-burgundy-900">
            أضف منتجات بقيمة{' '}
            <span className="text-burgundy-700">
              {formatPrice(remainingForFree)} ج.م
            </span>{' '}
            لتحصل على شحن مجاني
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-l from-vanilla-400 to-burgundy-500 transition-all duration-500"
              style={{
                width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={item.id + (item.variant || '')}
                className="flex gap-4 rounded-3xl border border-vanilla-100 bg-white p-4 shadow-sm"
              >
                <Link
                  to={`/product/${item.id}`}
                  className="shrink-0 overflow-hidden rounded-2xl border border-vanilla-100"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-24 w-24 object-cover sm:h-28 sm:w-28"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/product/${item.id}`}
                      className="text-sm font-black leading-snug text-burgundy-950 hover:text-burgundy-700 sm:text-base"
                    >
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.id, item.variant)}
                      className="shrink-0 rounded-full p-2 text-burgundy-900/40 transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label="حذف"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-burgundy-900/50">
                    سعر الوحدة: {formatPrice(item.product.price)} ج.م
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center overflow-hidden rounded-full border border-vanilla-200">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity - 1,
                            item.variant,
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center text-burgundy-900 hover:bg-burgundy-50"
                        aria-label="تقليل"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-9 text-center text-sm font-black text-burgundy-950">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity + 1,
                            item.variant,
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center text-burgundy-900 hover:bg-burgundy-50"
                        aria-label="زيادة"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-base font-black text-burgundy-900">
                      {formatPrice(item.product.price * item.quantity)}{' '}
                      <span className="text-xs">ج.م</span>
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-black text-burgundy-700 hover:text-burgundy-900"
            >
              <ArrowLeft size={16} className="rtl:rotate-180" />
              متابعة التسوق
            </Link>
            <button
              onClick={clearCart}
              className="text-sm font-bold text-red-500 hover:text-red-600"
            >
              تفريغ السلة بالكامل
            </button>
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm lg:sticky lg:top-40">
          <h2 className="mb-4 text-lg font-black text-burgundy-950">
            ملخص الطلب
          </h2>

          {/* Coupon */}
          <div className="mb-5">
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-full border border-vanilla-200 bg-cream-50 px-3">
                <Tag size={15} className="text-burgundy-900/40" />
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="كود الخصم"
                  className="w-full bg-transparent py-2.5 text-sm font-bold outline-none placeholder:text-burgundy-900/30"
                />
              </div>
              <Button variant="secondary" onClick={handleApplyCoupon}>
                تطبيق
              </Button>
            </div>
            {couponError && (
              <p className="mt-2 text-xs font-bold text-red-500">
                {couponError}
              </p>
            )}
            {coupon && (
              <p className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600">
                <Tag size={12} />
                {coupon.message} (-{formatPrice(coupon.discountValue)} ج.م)
              </p>
            )}
          </div>

          <div className="space-y-3 border-t border-vanilla-100 pt-4 text-sm">
            <div className="flex justify-between text-burgundy-900/70">
              <span>المجموع الفرعي</span>
              <span className="font-bold text-burgundy-950">
                {formatPrice(subtotal)} ج.م
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>الخصم</span>
                <span className="font-bold">-{formatPrice(discount)} ج.م</span>
              </div>
            )}
            <div className="flex justify-between text-burgundy-900/70">
              <span>الشحن</span>
              <span className="font-bold text-burgundy-950">
                {shipping === 0 ? 'مجاني' : `${formatPrice(shipping)} ج.م`}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-vanilla-100 pt-4">
            <span className="text-sm font-black text-burgundy-950">
              الإجمالي
            </span>
            <span className="text-2xl font-black text-burgundy-900">
              {formatPrice(total)}{' '}
              <span className="text-sm">ج.م</span>
            </span>
          </div>

          {!user && (
            <p className="mt-3 rounded-xl bg-vanilla-50 px-3 py-2 text-[11px] font-bold text-burgundy-900/60">
              💡 سجّل الدخول للاطلاع أسرع على طلباتك لاحقاً
            </p>
          )}

          <Link to="/checkout" className="mt-5 block">
            <Button fullWidth size="lg">
              إتمام الطلب عبر واتساب
            </Button>
          </Link>

          <div className="mt-4 space-y-1.5 text-[11px] text-burgundy-900/40">
            <p className="flex items-center gap-1.5">
              <ShieldCheck size={13} /> انستا باي · فودافون كاش · عند الاستلام
            </p>
            <p className="flex items-center gap-1.5">
              <Truck size={13} /> أو استلم من أقرب فرع لك
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}