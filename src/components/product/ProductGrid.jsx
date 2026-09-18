import { useEffect, useState } from 'react'
import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading = false, skeletonCount = 8 }) {
  const [showSkeleton, setShowSkeleton] = useState(true)

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowSkeleton(false), 450)
      return () => clearTimeout(timer)
    }
    setShowSkeleton(true)
  }, [loading])

  if (loading || showSkeleton) {
    return (
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-3xl border border-vanilla-100 bg-white"
          >
            <div className="skeleton aspect-square" />
            <div className="space-y-3 p-4">
              <div className="skeleton h-3 w-1/3 rounded-full" />
              <div className="skeleton h-4 w-3/4 rounded-full" />
              <div className="skeleton h-3 w-1/2 rounded-full" />
              <div className="flex items-center justify-between pt-2">
                <div className="skeleton h-6 w-16 rounded-full" />
                <div className="skeleton h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
}