import { useEffect, useState } from 'react'
import { BadgePercent, Flame, Clock } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useCatalog } from '../hooks/useCatalog'
import { formatPrice } from '../utils/format'
import ProductGrid from '../components/product/ProductGrid'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { Link } from 'react-router-dom'

export default function Offers() {
  const [loading, setLoading] = useState(true)
  const { products } = useProducts()
  const { onSale } = useCatalog(products)

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(id)
  }, [])

  const onSaleList = onSale()
  const totalSavings = onSaleList.reduce(
    (sum, p) => sum + (p.oldPrice - p.price),
    0,
  )
  const bestDeal = onSaleList[0]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ label: 'العروض' }]} />

      {/* Hero offer */}
      <section className="relative mb-10 overflow-hidden rounded-[2.5rem] bg-gradient-to-l from-burgundy-800 via-burgundy-700 to-vanilla-600 p-8 md:p-12">
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-1/4 h-56 w-56 rounded-full bg-vanilla-300/20 blur-2xl" />
        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div className="text-center md:text-right">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-black text-white backdrop-blur">
              <Flame size={14} className="text-vanilla-300" />
              عروض لفترة محدودة
            </span>
            <h1 className="mb-3 text-3xl font-black text-white md:text-4xl">
              وفّر أكثر مع عروض فانيليانو
            </h1>
            <p className="mb-6 text-sm text-cream-100/70">
              خصومات حقيقية على منتجاتنا المختارة. اجمع ما تحب بسعر أحلى.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <span className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-white backdrop-blur">
                <BadgePercent size={18} className="text-vanilla-300" />
                <span className="text-sm font-bold">
                  خصم يصل إلى {bestDeal ? bestDeal.discount : 30}%
                </span>
              </span>
              <span className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-white backdrop-blur">
                <Clock size={18} className="text-vanilla-300" />
                <span className="text-sm font-bold">
                  إجمالي الوفورات: {formatPrice(totalSavings)} ج.م
                </span>
              </span>
            </div>
          </div>
          <div className="hidden justify-end md:flex">
            <Link to="/products">
              <img
                src={bestDeal?.image}
                alt="أقوى عرض"
                className="h-56 w-56 rotate-3 rounded-[2rem] border-4 border-white/20 object-cover shadow-2xl transition-transform duration-300 hover:rotate-0"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'منتج مخفض', value: `${onSaleList.length}` },
          { label: 'أفضل خصم', value: `${bestDeal ? bestDeal.discount : 0}%` },
          { label: 'وفّرت اليوم', value: `${formatPrice(totalSavings)} ج.م` },
          { label: 'منتجات في المتجر', value: `${products.length}` },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-vanilla-100 bg-white p-4 text-center shadow-sm"
          >
            <p className="text-xl font-black text-burgundy-700">{s.value}</p>
            <p className="mt-1 text-xs font-bold text-burgundy-900/50">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-black text-burgundy-950 md:text-2xl">
          منتجات مخفضة 🛍️
        </h2>
        <p className="mt-2 text-sm text-burgundy-900/50">
          ينتهي العرض عند نفاد الكمية، اطلب الآن قبل فوات الأوان.
        </p>
      </div>

      <ProductGrid products={onSaleList} loading={loading} />
    </div>
  )
}