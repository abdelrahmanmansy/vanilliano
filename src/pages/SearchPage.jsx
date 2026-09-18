import { useMemo, useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, PackageSearch } from 'lucide-react'
import ProductGrid from '../components/product/ProductGrid'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import EmptyState from '../components/ui/EmptyState'
import { useProducts } from '../context/ProductsContext'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [input, setInput] = useState(q)
  const [loading, setLoading] = useState(true)
  const { products } = useProducts()
  const navigate = useNavigate()

  const normalized = q.trim().toLowerCase()

  const results = useMemo(() => {
    if (!normalized) return []
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(normalized) ||
        p.description.toLowerCase().includes(normalized) ||
        p.category.toLowerCase().includes(normalized),
    )
  }, [normalized, products])

  useEffect(() => {
    setInput(q)
    setLoading(true)
    const id = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(id)
  }, [q])

  const handleSubmit = (e) => {
    e.preventDefault()
    setSearchParams({ q: input.trim() })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ label: 'البحث' }]} />

      <h1 className="mb-6 text-2xl font-black text-burgundy-950 md:text-3xl">
        ابحث عن منتجاتك
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 flex max-w-2xl items-center gap-3 rounded-full border border-vanilla-200 bg-white px-5 py-2 shadow-sm focus-within:border-burgundy-300"
      >
        <Search size={19} className="text-burgundy-900/40" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب اسم منتج أو خامة أو قسم..."
          className="w-full bg-transparent py-2 text-sm font-bold outline-none placeholder:text-burgundy-900/30"
        />
      </form>

      {!normalized ? (
        <div className="py-16">
          <EmptyState
            icon={Search}
            title="ابدأ البحث الآن"
            description="اكتب كلمة في خانة البحث أعلاه للعثور على كل ما تحتاجه من فانيليانو."
          />
        </div>
      ) : loading ? (
        <ProductGrid products={[]} loading skeletonCount={8} />
      ) : results.length === 0 ? (
        <div className="py-10">
          <EmptyState
            icon={PackageSearch}
            title={`لا توجد نتائج لـ "${q}"`}
            description="تأكد من الإملاء أو جرّب كلمات أبسط مثل كاندي أو شوكولاتة."
            actionLabel="تصفح جميع المنتجات"
            onAction={() => navigate('/products')}
          />
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm font-bold text-burgundy-900/60">
            وجدنا {results.length} منتجاً مطابقاً لـ "{q}"
          </p>
          <ProductGrid products={results} loading={false} />
        </>
      )}
    </div>
  )
}