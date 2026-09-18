import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import { useProducts } from '../../context/ProductsContext'
import { useCatalog } from '../../hooks/useCatalog'
import ProductGrid from '../product/ProductGrid'
import SectionHeader from '../ui/SectionHeader'

export default function FeaturedProducts() {
  const [loading, setLoading] = useState(true)
  const { products } = useProducts()
  const { bestSellers } = useCatalog(products)

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 650)
    return () => clearTimeout(id)
  }, [])

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            title="الأكثر مبيعاً 🔥"
            subtitle="منتجات يعشقها عملاؤنا، اخترها بثقة لأنها أثبتت حضورها مراراً."
          />
          <Link
            to="/products"
            className="mb-10 hidden shrink-0 items-center gap-1 text-sm font-black text-burgundy-700 transition-colors hover:text-burgundy-900 md:flex"
          >
            عرض الكل
            <ArrowLeft size={16} className="rtl:rotate-180" />
          </Link>
        </div>
        <ProductGrid products={bestSellers(8)} loading={loading} />

        <div className="mt-10 flex justify-center md:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full bg-burgundy-700 px-6 py-3 text-sm font-black text-white shadow-lg shadow-burgundy-700/20"
          >
            <TrendingUp size={16} />
            عرض كل المنتجات
          </Link>
        </div>
      </div>
    </section>
  )
}