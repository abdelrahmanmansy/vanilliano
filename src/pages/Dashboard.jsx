import { useState, useEffect, useMemo } from 'react'
import { asset } from '../utils/asset'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  Heart,
  LogOut,
  Pencil,
  Trash2,
  Plus,
  Search,
  RotateCcw,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'
import { useWishlist } from '../context/WishlistContext'
import { useCatalog } from '../hooks/useCatalog'
import { formatPrice, formatDate } from '../utils/format'
import { STORAGE_KEYS } from '../utils/constants'
import { categories } from '../data/categories'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import RatingStars from '../components/ui/RatingStars'
import StockBadge from '../components/product/StockBadge'
import { toast } from 'react-hot-toast'

const tabs = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'products', label: 'المنتجات', icon: Package },
  { id: 'orders', label: 'الطلبات', icon: ShoppingBag },
  { id: 'wishlist', label: 'المفضلة', icon: Heart },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
]

const orderStatuses = ['جديد', 'قيد التجهيز', 'تم الشحن', 'تم التسليم', 'ملغي']

const emptyProduct = {
  id: '',
  name: '',
  price: '',
  oldPrice: '',
  category: 'baking-supplies',
  stock: 'in',
  rating: '4.5',
  reviews: '0',
  badge: 'none',
  description: '',
  image: '',
}

export default function Dashboard() {
  const { user, isAdmin, logout } = useAuth()
  const { products, upsertProduct, deleteProduct, resetProducts, syncAllToSupabase, supabaseConfigured, supabaseSynced } = useProducts()
  const { wishlist } = useWishlist()
  const [tab, setTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' })

  useEffect(() => {
    const stored = JSON.parse(
      window.localStorage.getItem(STORAGE_KEYS.orders) || '[]',
    )
    if (stored.length === 0) {
      const demo = [
        {
          id: 'VNL-991234',
          date: new Date(Date.now() - 4 * 864e5).toISOString(),
          items: [
            { id: 'macaron-box', name: 'علبة ماكارون هدية', price: 95, quantity: 2, image: asset('/images/products/macaron-box.svg') },
            { id: 'favor-box-gold', name: 'صندوق توزيعات ذهبي', price: 45, quantity: 3, image: asset('/images/products/favor-box-gold.svg') },
          ],
          subtotal: 325,
          discount: 0,
          shipping: 0,
          total: 325,
          paymentMethod: 'fawry',
          status: 'تم التسليم',
          shippingInfo: { name: 'متجر الدروس' },
        },
        {
          id: 'VNL-997643',
          date: new Date(Date.now() - 2 * 864e5).toISOString(),
          items: [
            { id: 'confetti-candle', name: 'شمعة قصاصات معدنية', price: 35, quantity: 1, image: asset('/images/products/confetti-candle.svg') },
          ],
          subtotal: 35,
          discount: 0,
          shipping: 25,
          total: 60,
          paymentMethod: 'cod',
          status: 'قيد التجهيز',
          shippingInfo: { name: 'أم خالد' },
        },
      ]
      setOrders(demo)
      window.localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(demo))
    } else {
      setOrders(stored)
    }
  }, [])

  const { getById } = useCatalog(products)
  const wishlistProducts = wishlist.map((id) => getById(id)).filter(Boolean)

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const bestProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, 5)

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    )
  }, [products, productSearch])

  const updateOrderStatus = (id, status) => {
    const next = orders.map((o) => (o.id === id ? { ...o, status } : o))
    setOrders(next)
    window.localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(next))
    toast.success('تم تحديث حالة الطلب')
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-[2.5rem] border border-vanilla-100 bg-white p-10 shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cream-100">
            <ShieldCheck size={28} className="text-burgundy-700" />
          </div>
          <h1 className="mb-2 text-2xl font-black text-burgundy-950">
            سجّل الدخول أولاً
          </h1>
          <p className="mb-6 text-sm text-burgundy-900/60">
            تحتاج إلى تسجيل الدخول للوصول إلى لوحة التحكم وطلباتك.
          </p>
          <Link to="/login">
            <Button size="lg">تسجيل الدخول</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-burgundy-950">
            أهلاً، {user.name} 👋
          </h1>
          <p className="mt-1 text-sm text-burgundy-900/50" dir="ltr">
            {user.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <span className="flex items-center gap-1.5 rounded-full bg-burgundy-700 px-4 py-2 text-xs font-black text-white">
              <ShieldCheck size={14} />
              وضع المدير
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={logout}>
            <LogOut size={15} />
            خروج
          </Button>
        </div>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all ${
              tab === id
                ? 'bg-burgundy-700 text-white shadow-lg shadow-burgundy-700/25'
                : 'bg-white text-burgundy-900/60 hover:bg-cream-100'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'الطلبات', value: orders.length, icon: ShoppingBag, color: 'from-burgundy-700 to-burgundy-500' },
              { label: 'إجمالي المبيعات', value: `${formatPrice(totalRevenue)} ج.م`, icon: Star, color: 'from-vanilla-600 to-vanilla-400' },
              { label: 'المنتجات في المتجر', value: products.length, icon: Package, color: 'from-emerald-600 to-emerald-400' },
              { label: 'عناصر المفضلة', value: wishlist.length, icon: Heart, color: 'from-rose-500 to-rose-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-3xl border border-vanilla-100 bg-white p-5 shadow-sm">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white`}>
                  <Icon size={18} />
                </div>
                <p className="text-sm text-burgundy-900/50">{label}</p>
                <p className="text-xl font-black text-burgundy-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-black text-burgundy-950">
                أحدث الطلبات
              </h2>
              {orders.length === 0 ? (
                <p className="text-sm text-burgundy-900/40">لا توجد طلبات بعد.</p>
              ) : (
                <ul className="space-y-3">
                  {orders.slice(0, 4).map((o) => (
                    <li key={o.id} className="flex items-center justify-between rounded-2xl bg-cream-50/60 p-3">
                      <div>
                        <p className="text-sm font-black text-burgundy-950" dir="ltr">
                          {o.id}
                        </p>
                        <p className="text-[11px] text-burgundy-900/40">
                          {formatDate(o.date)} · {o.shippingInfo?.name}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-burgundy-900">
                          {formatPrice(o.total)} ج.م
                        </p>
                        <Badge>{o.status}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => setTab('orders')}
                className="mt-4 text-sm font-black text-burgundy-700 hover:underline"
              >
                عرض كل الطلبات ←
              </button>
            </div>

            <div className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-black text-burgundy-950">
                الأفضل تقييماً
              </h2>
              <ul className="space-y-3">
                {bestProducts.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-vanilla-100 text-xs font-black text-burgundy-700">
                      {i + 1}
                    </span>
                    <img src={p.image} alt="" className="h-10 w-10 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-black text-burgundy-950">{p.name}</p>
                      <RatingStars value={p.rating} size={12} />
                    </div>
                    <span className="text-sm font-black text-burgundy-900">
                      {formatPrice(p.price)} ج.م
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-burgundy-950">
              إدارة المنتجات ({products.length})
            </h2>
            {supabaseConfigured && isAdmin && (
              <p className="mt-1 text-[11px] font-bold text-emerald-700">
                متصل بقاعدة البيانات — أي تعديل يظهر فوراً لزوار المتجر.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-burgundy-900/40" />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="ابحث في المنتجات..."
                  className="w-52 rounded-full border border-vanilla-200 bg-cream-50 py-2 pr-9 pl-4 text-xs font-bold outline-none focus:border-burgundy-400"
                />
              </div>
              {isAdmin ? (
                <>
                  <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true) }}>
                    <Plus size={15} />
                    إضافة منتج
                  </Button>
                  <Button size="sm" variant="secondary" onClick={resetProducts}>
                    <RotateCcw size={15} />
                    استعادة الافتراضي
                  </Button>
                  {supabaseConfigured && (
                    <Button size="sm" variant="secondary" onClick={syncAllToSupabase} title="يُرجع منتجات المتجر إلى قاعدة بيانات Supabase (متاح للمالك)">
                      <RotateCcw size={15} />
                      {supabaseSynced ? 'إعادة مزامنة القاعدة' : 'تعبئة القاعدة بالمنتجات'}
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-[11px] font-bold text-burgundy-900/40">
                  متاح في وضع المدير
                </p>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-right">
              <thead>
                <tr className="border-b border-vanilla-100 text-[11px] font-black text-burgundy-900/40">
                  <th className="pb-3 pl-4">المنتج</th>
                  <th className="pb-3 pl-4">القسم</th>
                  <th className="pb-3 pl-4">السعر</th>
                  <th className="pb-3 pl-4">التقييم</th>
                  <th className="pb-3 pl-4">الحالة</th>
                  <th className="pb-3 pl-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="border-b border-vanilla-50 last:border-0">
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="h-11 w-11 rounded-xl object-cover" />
                        <Link
                          to={`/product/${p.id}`}
                          className="max-w-[180px] truncate text-sm font-black text-burgundy-950 hover:text-burgundy-700"
                        >
                          {p.name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 pl-4 text-xs font-bold text-burgundy-900/50">
                      {categories.find((c) => c.id === p.category)?.name || p.category}
                    </td>
                    <td className="py-3 pl-4 text-sm font-black text-burgundy-900">
                      {formatPrice(p.price)} ج.م
                    </td>
                    <td className="py-3 pl-4">
                      <RatingStars value={p.rating} size={12} />
                    </td>
                    <td className="py-3 pl-4">
                      <StockBadge stock={p.stock} />
                    </td>
                    {isAdmin && (
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { setEditing(p); setModalOpen(true) }}
                            className="rounded-xl bg-cream-100 p-2 text-burgundy-900/50 hover:bg-vanilla-100 hover:text-burgundy-700"
                            title="تعديل"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="rounded-xl bg-cream-100 p-2 text-burgundy-900/50 hover:bg-red-50 hover:text-red-500"
                            title="حذف"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="لا توجد طلبات"
              description="الطلبات التي تُنشأ من صفحة إتمام الشراء ستظهر هنا."
            />
          ) : (
            orders.map((o) => (
              <div key={o.id} className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-burgundy-950" dir="ltr">
                      طلب رقم {o.id}
                    </p>
                    <p className="text-[11px] text-burgundy-900/40">
                      {formatDate(o.date)} · {o.paymentMethod === 'instapay' ? 'انستا باي' : o.paymentMethod === 'vodafone' ? 'فودافون كاش' : o.paymentMethod === 'fawry' ? 'فودافون كاش / انستا باي' : o.paymentMethod === 'cod' ? 'عند الاستلام' : 'واتساب'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-burgundy-900">
                      {formatPrice(o.total)} ج.م
                    </span>
                    {isAdmin ? (
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="rounded-full border border-vanilla-200 bg-cream-50 px-3 py-1.5 text-xs font-black outline-none"
                      >
                        {orderStatuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <Badge>{o.status}</Badge>
                    )}
                  </div>
                </div>
                <ul className="space-y-2">
                  {o.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <img src={item.image} alt="" className="h-10 w-10 rounded-xl object-cover" />
                      <span className="flex-1 text-sm font-bold text-burgundy-950">
                        {item.name} <span className="text-xs text-burgundy-900/40">× {item.quantity}</span>
                      </span>
                      <span className="text-sm font-black text-burgundy-900">
                        {formatPrice(item.price * item.quantity)} ج.م
                      </span>
                    </li>
                  ))}
                </ul>
                {o.shippingInfo && (
                  <p className="mt-3 border-t border-vanilla-50 pt-3 text-[11px] text-burgundy-900/40">
                    📍 التوصيل إلى: {o.shippingInfo.name} · {o.shippingInfo.city || '—'} · {o.shippingInfo.address}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'wishlist' && (
        <div className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-black text-burgundy-950">
            عناصرك المفضلة ({wishlistProducts.length})
          </h2>
          {wishlistProducts.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="لا توجد عناصر مفضلة"
              description="أضف منتجات إلى المفضلة من صفحات المنتجات."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlistProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-vanilla-100 p-3 hover:border-burgundy-200"
                >
                  <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-burgundy-950">{p.name}</p>
                    <p className="text-sm font-black text-burgundy-700">
                      {formatPrice(p.price)} ج.م
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'settings' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-black text-burgundy-950">بيانات الحساب</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-black text-burgundy-900">الاسم</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-2xl border border-vanilla-200 bg-cream-50 px-4 py-3 text-sm font-bold outline-none focus:border-burgundy-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-burgundy-900">البريد الإلكتروني</label>
                <input
                  value={profile.email}
                  onChange={(e) => setProfile((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-2xl border border-vanilla-200 bg-cream-50 px-4 py-3 text-sm font-bold outline-none focus:border-burgundy-400"
                />
              </div>
              <Button onClick={() => toast.success('تم حفظ التغييرات (تجريبي)')}>
                حفظ التغييرات
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-burgundy-800 to-burgundy-700 p-6 text-white shadow-xl">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-black">
                <ShieldCheck size={20} className="text-vanilla-300" />
                لوحة الادمن
              </h2>
              <p className="mb-4 text-sm text-cream-100/80">
                جرّب لوحة التحكم بوضع المدير لإدارة المنتجات والطلبات.
              </p>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <ProductModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSave={(data) => {
            upsertProduct(data)
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}

function ProductModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(() =>
    initial
      ? { ...emptyProduct, ...initial }
      : { ...emptyProduct, id: `p_${Date.now()}` },
  )
  const [errors, setErrors] = useState({})

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const save = () => {
    const next = {}
    if (form.name.trim().length < 3) next.name = 'اسم غير كافٍ'
    if (!form.price || Number(form.price) <= 0) next.price = 'سعر غير صحيح'
    if (form.oldPrice && Number(form.oldPrice) < Number(form.price)) next.oldPrice = 'يجب أن يكون أكبر من السعر'
    if (form.description.trim().length < 10) next.description = 'وصف مختصر جداً'
    setErrors(next)
    if (Object.keys(next).length) return
    onSave({
      ...form,
      id: form.id || `p_${Date.now()}`,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
      rating: Number(form.rating) || 4.5,
      reviews: Number(form.reviews) || 0,
      image: asset(form.image || `/images/products/${form.id}.svg`),
    })
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-burgundy-950/60 p-4 backdrop-blur-sm">
      <div className="animate-scale-in max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-black text-burgundy-950">
            {initial ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h3>
          <button onClick={onClose} className="rounded-xl bg-cream-100 p-2 text-burgundy-900/50 hover:text-burgundy-700">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">اسم المنتج *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className={`w-full rounded-2xl border bg-cream-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-burgundy-400 ${errors.name ? 'border-red-300' : 'border-vanilla-200'}`} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">السعر (ج.م) *</label>
              <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} className={`w-full rounded-2xl border bg-cream-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-burgundy-400 ${errors.price ? 'border-red-300' : 'border-vanilla-200'}`} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">السعر القديم (اختياري)</label>
              <input type="number" value={form.oldPrice || ''} onChange={(e) => set('oldPrice', e.target.value)} className={`w-full rounded-2xl border bg-cream-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-burgundy-400 ${errors.oldPrice ? 'border-red-300' : 'border-vanilla-200'}`} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">القسم</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="w-full rounded-2xl border border-vanilla-200 bg-cream-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-burgundy-400">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">حالة المخزون</label>
              <select value={form.stock} onChange={(e) => set('stock', e.target.value)} className="w-full rounded-2xl border border-vanilla-200 bg-cream-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-burgundy-400">
                <option value="in">متوفر</option>
                <option value="low">مخزون منخفض</option>
                <option value="out">نفذت الكمية</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">الشارة (اختياري)</label>
              <select value={form.badge} onChange={(e) => set('badge', e.target.value)} className="w-full rounded-2xl border border-vanilla-200 bg-cream-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-burgundy-400">
                <option value="none">بدون</option>
                <option value="new">جديد</option>
                <option value="bestseller">الأكثر مبيعاً</option>
                <option value="offer">عرض</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">صورة المنتج</label>
              <div className="flex items-center gap-2">
                <input dir="ltr" value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="/images/products/id.svg" className="w-full rounded-2xl border border-vanilla-200 bg-cream-50 px-4 py-2.5 text-xs font-bold outline-none focus:border-burgundy-400" />
              </div>
              <p className="mt-1 text-[10px] text-burgundy-900/40">
                اتركه فارغاً لاستخدام صورة تلقائية بصيغة SVG.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">التقييم</label>
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => set('rating', e.target.value)} className="w-full rounded-2xl border border-vanilla-200 bg-cream-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-burgundy-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">الوصف *</label>
              <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={`w-full resize-none rounded-2xl border bg-cream-50 px-4 py-2.5 text-sm font-bold outline-none focus:border-burgundy-400 ${errors.description ? 'border-red-300' : 'border-vanilla-200'}`} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button fullWidth onClick={save}>
              {initial ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </Button>
            <Button fullWidth variant="secondary" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}