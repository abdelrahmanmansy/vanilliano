import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Tag } from 'lucide-react'
import { useProducts } from '../../context/ProductsContext'
import { useCatalog } from '../../hooks/useCatalog'
import ProductGrid from '../product/ProductGrid'
import SectionHeader from '../ui/SectionHeader'
import { formatPrice } from '../../utils/format'

export default function SpecialOffers() {
  const [loading, setLoading] = useState(true)
  const { products } = useProducts()
  const { onSale } = useCatalog(products)

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 650)
    return () => clearTimeout(id)
  }, [])

  const saleProducts = onSale(4)
  const savings = saleProducts.reduce(
    (sum, p) => sum + (p.oldPrice - p.price),
    0,
  )

  return (
    <section className="relative overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-burgundy-800 via-burgundy-700 to-burgundy-800" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-vanilla-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionHeader
              title="عروض هذا الأسبوع 🔖"
              subtitle="خصومات حقيقية على منتجات مختارة — بادر قبل نفاد الكميات."
            />
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-3 text-white backdrop-blur">
              <Tag size={18} className="text-vanilla-300" />
              <span className="text-sm font-bold">
                وفّر حتى{' '}
                <strong className="text-lg text-vanilla-300">
                  {formatPrice(savings)} ج.م
                </strong>{' '}
                على المنتجات المعروضة
              </span>
            </div>
          </div>
          <Link
            to="/offers"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/30 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-white hover:text-burgundy-800"
          >
            جميع العروض
            <ArrowLeft size={16} className="rtl:rotate-180" />
          </Link>
        </div>

        <div className="[&_h2]:!text-white [&_p]:!text-cream-100/70">
          <ProductGrid
            products={saleProducts}
            loading={loading}
            skeletonCount={4}
          />
        </div>
      </div>
    </section>
  )
}