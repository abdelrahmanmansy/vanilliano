import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCcw,
  Share2,
  Check,
  Zap,
  Gift,
} from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useCatalog } from '../hooks/useCatalog'
import { categories } from '../data/categories'
import { formatPrice, calculateDiscount } from '../utils/format'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import RatingStars from '../components/ui/RatingStars'
import Badge from '../components/ui/Badge'
import StockBadge from '../components/product/StockBadge'
import QuantityStepper from '../components/ui/QuantityStepper'
import Button from '../components/ui/Button'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import ProductGrid from '../components/product/ProductGrid'
import { toast } from 'react-hot-toast'

const trustItems = [
  { icon: Truck, label: 'شحن خلال 2-5 أيام' },
  { icon: ShieldCheck, label: 'منتج أصلي 100%' },
  { icon: RefreshCcw, label: 'إرجاع خلال 3 أيام عمل' },
]

export default function ProductDetail({ productId }) {
  const { products } = useProducts()
  const { getById, related } = useCatalog(products)
  const product = getById(productId)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('desc')
  const [justAdded, setJustAdded] = useState(false)
  const { addItem } = useCart()
  const { isWishlisted, toggleItem } = useWishlist()
  const navigate = useNavigate()

  useEffect(() => {
    setQuantity(1)
    setActiveTab('desc')
    setJustAdded(false)
  }, [productId])

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center md:px-6">
        <h1 className="mb-3 text-2xl font-black text-burgundy-950">
          المنتج غير موجود
        </h1>
        <p className="mb-6 text-sm text-burgundy-900/50">
          يبدو أنك وصلت لرابط خاطئ.
        </p>
        <Link
          to="/products"
          className="rounded-full bg-burgundy-700 px-6 py-3 text-sm font-black text-white"
        >
          العودة للمتجر
        </Link>
      </div>
    )
  }

  const category = categories.find((c) => c.id === product.category)
  const discount = calculateDiscount(product.price, product.oldPrice)
  const wished = isWishlisted(product.id)
  const outOfStock = product.stock === 'out'
  const relatedList = related(product, 4)
  const others = relatedList.length >= 4 ? relatedList : [...relatedList, ...relatedList].slice(0, 4)

  const handleAdd = (goToCart = false) => {
    if (outOfStock) {
      toast.error('هذا المنتج غير متوفر حالياً')
      return
    }
    addItem(product, quantity)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1600)
    if (goToCart) {
      setTimeout(() => navigate('/checkout'), 700)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url })
      } catch {
        /* dismissed */
      }
    } else {
      navigator.clipboard?.writeText(url)
      toast.success('تم نسخ رابط المنتج')
    }
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Breadcrumbs
          items={[
            category
              ? { label: category.name, to: `/category/${category.slug}` }
              : null,
            { label: product.name },
          ].filter(Boolean)}
        />

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image */}
          <div className="relative">
            <div className="group sticky top-32 overflow-hidden rounded-[2rem] border border-vanilla-100 bg-vanilla-50 shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="img-zoom h-full w-full object-cover"
              />
              <div className="absolute right-4 top-4 flex flex-col gap-2">
                {product.badge && <Badge type={product.badge} />}
                {discount > 0 && <Badge type="offer">{`خصم ${discount}%`}</Badge>}
              </div>
              <button
                onClick={() => toggleItem(product)}
                aria-label="إضافة للمفضلة"
                className={`absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur transition-all hover:scale-105 ${
                  wished ? 'text-burgundy-700' : 'text-burgundy-900'
                }`}
              >
                <Heart size={19} className={wished ? 'fill-current' : ''} />
              </button>
              <button
                onClick={handleShare}
                aria-label="مشاركة"
                className="absolute bottom-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-burgundy-900 shadow-lg backdrop-blur hover:scale-105"
              >
                <Share2 size={17} />
              </button>
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              {category && (
                <Link
                  to={`/category/${category.slug}`}
                  className="rounded-full bg-vanilla-100 px-3 py-1 text-[11px] font-black text-burgundy-700"
                >
                  {category.name}
                </Link>
              )}
              <StockBadge stock={product.stock} />
            </div>

            <h1 className="mb-3 text-2xl font-black leading-snug text-burgundy-950 md:text-3xl">
              {product.name}
            </h1>

            <div className="mb-5 flex items-center gap-2">
              <RatingStars rating={product.rating} showValue />
              <span className="text-xs text-burgundy-900/40">
                ({product.reviews} تقييم)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 flex items-end gap-3">
              <span className="text-3xl font-black text-burgundy-900 md:text-4xl">
                {formatPrice(product.price)}{' '}
                <span className="text-base">ج.م</span>
              </span>
              {product.oldPrice > product.price && (
                <>
                  <span className="text-lg text-burgundy-900/40 line-through">
                    {formatPrice(product.oldPrice)} ج.م
                  </span>
                  <span className="mb-1 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-500">
                    وفّر {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Quantity + CTA */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                size="lg"
                max={outOfStock ? 0 : 99}
              />
              <Button
                size="lg"
                icon={ShoppingBag}
                onClick={() => handleAdd(false)}
                disabled={outOfStock}
                className="flex-1 sm:flex-none"
              >
                {justAdded ? 'تمت الإضافة ✓' : 'أضف إلى السلة'}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                icon={Zap}
                onClick={() => handleAdd(true)}
                disabled={outOfStock}
                className="flex-1 sm:flex-none"
              >
                اشترِ الآن
              </Button>
            </div>

            {/* Trust */}
            <div className="mb-8 grid grid-cols-3 gap-2 rounded-2xl border border-vanilla-100 bg-cream-100/60 p-4">
              {trustItems.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <Icon size={18} className="text-burgundy-700" />
                  <span className="text-[10px] font-bold text-burgundy-900/60 md:text-[11px]">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="mb-8">
              <h3 className="mb-3 text-sm font-black text-burgundy-950">
                مميزات المنتج
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {product.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-center gap-2 text-sm text-burgundy-900/70"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check size={11} className="text-emerald-600" />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tabs */}
            <div className="rounded-2xl border border-vanilla-100 bg-white">
              <div className="flex border-b border-vanilla-100">
                {[
                  { id: 'desc', label: 'الوصف' },
                  { id: 'details', label: 'التفاصيل' },
                  { id: 'shipping', label: 'الشحن والإرجاع' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`relative flex-1 px-4 py-3 text-xs font-black transition-colors md:text-sm ${
                      activeTab === t.id
                        ? 'text-burgundy-700'
                        : 'text-burgundy-900/40 hover:text-burgundy-900'
                    }`}
                  >
                    {t.label}
                    {activeTab === t.id && (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-burgundy-700" />
                    )}
                  </button>
                ))}
              </div>
              <div className="p-5">
                {activeTab === 'desc' && (
                  <p className="text-sm leading-relaxed text-burgundy-900/70">
                    {product.description}
                  </p>
                )}
                {activeTab === 'details' && (
                  <ul className="space-y-2 text-sm text-burgundy-900/70">
                    <li className="flex justify-between border-b border-vanilla-100 pb-2">
                      <span className="font-bold">الحالة</span>
                      <span>
                        فانيليانو — متوفر الآن، توصيل سريع
                      </span>
                    </li>
                    <li className="flex justify-between border-b border-vanilla-100 pb-2">
                      <span className="font-bold">الكمية في العبوة</span>
                      <span>كما هو موضح في الوصف</span>
                    </li>
                    <li className="flex justify-between border-b border-vanilla-100 pb-2">
                      <span className="font-bold">بلد المنشأ</span>
                      <span>مستورد من موردين معتمدين</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-bold">التعبئة</span>
                      <span>فانيليانو</span>
                    </li>
                  </ul>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-3 text-sm text-burgundy-900/70">
                    <p className="flex items-start gap-2">
                      <Truck size={16} className="mt-0.5 shrink-0 text-burgundy-700" />
                      التوصيل داخل القاهرة والجيزة خلال 24-48 ساعة، وباقي المحافظات خلال 2-5 أيام عمل.
                    </p>
                    <p className="flex items-start gap-2">
                      <RefreshCcw size={16} className="mt-0.5 shrink-0 text-burgundy-700" />
                      إرجاع أو استبدال خلال 3 أيام عمل من الاستلام.
                    </p>
                    <p className="flex items-start gap-2">
                      <Gift size={16} className="mt-0.5 shrink-0 text-burgundy-700" />
                      تغليف هدايا مجاني لأي مناسبة عند طلبه في السلة.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-black text-burgundy-950 md:text-2xl">
              منتجات مشابهة قد تعجبك
            </h2>
            <Link
              to={`/products?category=${product.category}`}
              className="text-xs font-black text-burgundy-700 hover:text-burgundy-900"
            >
              عرض القسم الكامل
            </Link>
          </div>
          <ProductGrid products={others} loading={false} />
        </div>
      </section>

      {/* Mobile sticky bar */}
      {!outOfStock && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-vanilla-200 bg-white/95 p-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-base font-black text-burgundy-900">
                {formatPrice(product.price)}{' '}
                <span className="text-xs">ج.م</span>
              </p>
              {product.oldPrice > product.price && (
                <p className="text-xs text-burgundy-900/40 line-through">
                  {formatPrice(product.oldPrice)} ج.م
                </p>
              )}
            </div>
            <Button
              className="flex-1"
              icon={ShoppingBag}
              onClick={() => handleAdd(false)}
            >
              {justAdded ? 'تمت الإضافة ✓' : 'أضف إلى السلة'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}