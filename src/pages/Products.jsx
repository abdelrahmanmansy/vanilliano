import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { SlidersHorizontal, Search, X, PackageSearch } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useCatalog } from '../hooks/useCatalog'
import { categories } from '../data/categories'
import ProductGrid from '../components/product/ProductGrid'
import ProductFilters from '../components/product/ProductFilters'
import { SORT_OPTIONS } from '../utils/constants'
import EmptyState from '../components/ui/EmptyState'
import Drawer from '../components/ui/Drawer'
import Button from '../components/ui/Button'
import Breadcrumbs from '../components/ui/Breadcrumbs'

const defaultFilters = {
  category: 'all',
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  onSale: false,
}

function doesMatchSearch(product, q) {
  if (!q) return true
  const query = q.toLowerCase()
  return (
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query)
  )
}

function sortProducts(list, sort) {
  const next = [...list]
  switch (sort) {
    case 'price_asc':
      return next.sort((a, b) => a.price - b.price)
    case 'price_desc':
      return next.sort((a, b) => b.price - a.price)
    case 'rating':
      return next.sort((a, b) => b.rating - a.rating)
    case 'newest':
      return next.sort((a, b) => (b.badge === 'new') - (a.badge === 'new'))
    case 'sale':
      return next.sort((a, b) => b.discount - a.discount)
    default:
      return next
  }
}

export default function Products({ presetCategoryId }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const initialQuery = searchParams.get('q') || ''
  const urlCategory = searchParams.get('category')
  const initialCategory = presetCategoryId || urlCategory || 'all'

  const { products } = useProducts()
  const { byCategory } = useCatalog(products)

  const [filters, setFilters] = useState({
    ...defaultFilters,
    category: initialCategory,
  })
  const [sort, setSort] = useState('default')
  const [query, setQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const maxPrice = useMemo(
    () => Math.max(...products.map((p) => p.oldPrice || p.price), 200),
    [products],
  )

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(id)
  }, [location.search])

  useEffect(() => {
    navigate(
      `?q=${encodeURIComponent(query)}${filters.category !== 'all' ? `&category=${filters.category}` : ''}`,
      { replace: true },
    )
  }, [query, filters.category, navigate])

  const appliedCount =
    (filters.category !== 'all' ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.maxPrice && filters.maxPrice < maxPrice ? 1 : 0)

  const filtered = useMemo(() => {
    let list =
      filters.category === 'all' ? [...products] : byCategory(filters.category)
    list = list.filter(
      (p) =>
        doesMatchSearch(p, query) &&
        (filters.minPrice == null || p.price >= filters.minPrice) &&
        (filters.maxPrice == null || p.price <= filters.maxPrice) &&
        (!filters.inStockOnly || p.stock !== 'out') &&
        (!filters.onSale || p.discount > 0),
    )
    return sortProducts(list, sort)
  }, [filters, query, sort, products, byCategory])

  const clearFilters = () => {
    setFilters(defaultFilters)
    setQuery('')
    setSort('default')
  }

  const currentCategory = categories.find((c) => c.id === filters.category)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs
        items={[
          currentCategory
            ? { label: currentCategory.name, to: `/category/${currentCategory.slug}` }
            : { label: query ? `نتائج البحث عن: ${query}` : 'المتجر' },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-black text-burgundy-950 md:text-3xl">
          {currentCategory ? currentCategory.name : 'جميع المنتجات'}
        </h1>
        <p className="mt-1 text-sm text-burgundy-900/50">
          {filtered.length} منتج متاح
        </p>
      </div>

      {/* Search bar (when navigated from search) */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setQuery(query)
        }}
        className="mb-6 flex max-w-xl items-center gap-2 rounded-2xl border border-vanilla-200 bg-white px-4 py-2 focus-within:border-burgundy-300"
      >
        <Search size={17} className="text-burgundy-900/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="بحث داخل المنتجات..."
          className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-burgundy-900/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-burgundy-900/40"
            aria-label="مسح البحث"
          >
            <X size={15} />
          </button>
        )}
      </form>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => setFiltersOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-burgundy-700 px-4 py-2 text-xs font-black text-burgundy-700 transition-colors hover:bg-burgundy-700 hover:text-white"
        >
          <SlidersHorizontal size={15} />
          التصفية
          {appliedCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-burgundy-700 text-[10px] text-white">
              {appliedCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-bold text-burgundy-900/50 sm:block">
            ترتيب حسب:
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-vanilla-200 bg-white px-4 py-2 text-xs font-black text-burgundy-950 outline-none focus:border-burgundy-300"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-40 rounded-3xl border border-vanilla-100 bg-white p-5 shadow-sm">
            <ProductFilters
              filters={filters}
              onChange={setFilters}
              priceRange={[
                filters.minPrice ?? 0,
                filters.maxPrice ?? maxPrice,
              ]}
              maxPrice={maxPrice}
              appliedCount={appliedCount}
              onClear={clearFilters}
            />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {loading ? (
            <ProductGrid products={[]} loading skeletonCount={8} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="لا توجد منتجات مطابقة"
              description="جرّب تعديل الفلاتر أو إزالة كلمة البحث للعثور على ما تبحث عنه."
              actionLabel="مسح جميع الفلاتر"
              onAction={clearFilters}
            />
          ) : (
            <ProductGrid products={filtered} />
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="تصفية وترتيب"
        footer={
          <Button fullWidth size="lg" onClick={() => setFiltersOpen(false)}>
            عرض {filtered.length} منتج
          </Button>
        }
      >
        <div className="mb-6">
          <p className="mb-2 text-xs font-black text-burgundy-900/50">
            ترتيب حسب
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded-full border border-vanilla-200 bg-white px-4 py-3 text-sm font-black text-burgundy-950 outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <ProductFilters
          filters={filters}
          onChange={(f) => {
            setFilters(f)
          }}
          priceRange={[filters.minPrice ?? 0, filters.maxPrice ?? maxPrice]}
          maxPrice={maxPrice}
          appliedCount={appliedCount}
          onClear={clearFilters}
        />
      </Drawer>
    </div>
  )
}