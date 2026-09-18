import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useProducts } from '../../context/ProductsContext'
import { useCatalog } from '../../hooks/useCatalog'
import ProductGrid from '../product/ProductGrid'
import SectionHeader from '../ui/SectionHeader'

export default function NewArrivals() {
  const [loading, setLoading] = useState(true)
  const { products } = useProducts()
  const { newArrivals } = useCatalog(products)

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 650)
    return () => clearTimeout(id)
  }, [])

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title="وصل حديثاً ✨"
          subtitle="أحدث المنتجات التي انضمت إلى رفوف فانيليانو هذا الشهر."
        />
        <Link
          to="/products"
          className="mb-10 hidden shrink-0 items-center gap-1 text-sm font-black text-burgundy-700 transition-colors hover:text-burgundy-900 md:flex"
        >
          تصفح أحدث المنتجات
          <ArrowLeft size={16} className="rtl:rotate-180" />
        </Link>
      </div>
      <ProductGrid products={newArrivals(8)} loading={loading} skeletonCount={8} />
    </section>
  )
}