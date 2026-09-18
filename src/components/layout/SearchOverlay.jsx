import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, TrendingUp } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useDebounce } from '../../hooks/useDebounce'
import { useProducts } from '../../context/ProductsContext'
import { categories } from '../../data/categories'
import { formatPrice } from '../../utils/format'

const linkifyCategory = (id) => {
  const cat = categories.find((c) => c.id === id)
  return cat
}

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const debouncedQuery = useDebounce(query, 180)
  const { products } = useProducts()

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 120)
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
    setQuery('')
  }, [open])

  const q = debouncedQuery.trim().toLowerCase()

  const results = q
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q),
        )
        .slice(0, 6)
    : []

  const matchingCategories = q
    ? categories.filter((c) => c.name.includes(debouncedQuery.trim()))
    : []

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-burgundy-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative mx-auto mt-16 w-full max-w-2xl animate-scale-in px-4 md:mt-24">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4">
            <Search className="shrink-0 text-burgundy-700" size={22} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن خامات، حلوى، مستلزمات حفلات..."
              className="w-full bg-transparent text-base text-burgundy-950 outline-none placeholder:text-burgundy-900/30"
            />
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full p-2 text-burgundy-900/40 hover:bg-burgundy-50"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
          </form>

          <div className="max-h-[50vh] overflow-y-auto border-t border-vanilla-100 bg-cream-50/50 px-2 py-3">
            {!q && (
              <div className="px-4 py-6 text-center">
                <p className="mb-2 text-sm font-black text-burgundy-900">
                  فئات شائعة تجعل بحثك أسرع
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        navigate(`/category/${c.slug}`)
                        onClose()
                      }}
                      className="rounded-full border border-vanilla-200 bg-white px-4 py-1.5 text-xs font-bold text-burgundy-900 transition-colors hover:bg-burgundy-700 hover:text-white"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {q && results.length === 0 && matchingCategories.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-black text-burgundy-950">
                  لا توجد نتائج مطابقة لـ "{query}"
                </p>
                <p className="mt-2 text-xs text-burgundy-900/50">
                  جرب كلمات أخرى أو تصفح جميع المنتجات
                </p>
              </div>
            )}

            {matchingCategories.length > 0 && (
              <div className="mb-2 px-2">
                <p className="mb-2 px-2 text-[11px] font-bold text-burgundy-900/40">
                  الأقسام
                </p>
                {matchingCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      navigate(`/category/${c.slug}`)
                      onClose()
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-right transition-colors hover:bg-white"
                  >
                    <img
                      src={c.image}
                      alt=""
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                    <span className="text-sm font-bold text-burgundy-950">
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {results.length > 0 && (
              <div className="px-2">
                <p className="mb-2 px-2 text-[11px] font-bold text-burgundy-900/40">
                  المنتجات
                </p>
                {results.map((p) => {
                  const cat = linkifyCategory(p.category)
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        navigate(`/product/${p.id}`)
                        onClose()
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-right transition-colors hover:bg-white"
                    >
                      <img
                        src={p.image}
                        alt=""
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-black text-burgundy-950">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-burgundy-900/40">
                          {cat?.name}
                        </p>
                      </div>
                      <span className="text-sm font-black text-burgundy-700">
                        {formatPrice(p.price)}{' '}
                        <span className="text-[10px]">ج.م</span>
                      </span>
                    </button>
                  )
                })}
                <button
                  onClick={handleSubmit}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-burgundy-50 px-3 py-3 text-sm font-black text-burgundy-700 transition-colors hover:bg-burgundy-700 hover:text-white"
                >
                  <TrendingUp size={16} />
                  عرض جميع نتائج "{query}"
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}