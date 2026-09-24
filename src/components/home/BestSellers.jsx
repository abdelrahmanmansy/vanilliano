import { useEffect, useState } from 'react'
import { supabaseService } from '../../services/supabase'
import { useProducts } from '../../context/ProductsContext'
import ProductGrid from '../product/ProductGrid'
import SectionHeader from '../ui/SectionHeader'

export default function BestSellers() {
  const [loading, setLoading] = useState(true)
  const [sellers, setSellers] = useState([])
  const { products } = useProducts()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const { data, error } = await supabaseService.getTopSellers(8)
      if (!cancelled && !error) setSellers(data || [])
      if (!cancelled) setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const best = sellers
    .map((s) => products.find((p) => p.id === s.product_id))
    .filter(Boolean)

  if (!loading && best.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-10">
        <SectionHeader
          title="الأكثر مبيعاً 🔥"
          subtitle="الأكثر طلباً فعلياً حسب طلبات عملاء فانيليانو."
        />
      </div>
      <ProductGrid products={best} loading={loading} skeletonCount={4} />
    </section>
  )
}