import { categories } from '../../data/categories'
import { SORT_OPTIONS } from '../../utils/constants'
import { formatPrice } from '../../utils/format'

export default function ProductFilters({
  filters,
  onChange,
  priceRange,
  maxPrice,
  appliedCount,
  onClear,
}) {
  const set = (key, value) => onChange({ ...filters, [key]: value })

  const categoryOptions = [
    { id: 'all', name: 'كل الأقسام' },
    ...categories.map((c) => ({ id: c.id, name: c.name })),
  ]

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-burgundy-950">التصفية</h3>
        {appliedCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-bold text-red-500 hover:text-red-600"
          >
            مسح الكل ({appliedCount})
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="mb-3 text-xs font-black text-burgundy-900/50">القسم</p>
        <div className="space-y-1">
          {categoryOptions.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-cream-100"
            >
              <input
                type="radio"
                name="category"
                checked={filters.category === c.id}
                onChange={() => set('category', c.id)}
                className="h-4 w-4 accent-burgundy-700"
              />
              <span className="text-sm font-bold text-burgundy-950">
                {c.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="mb-3 text-xs font-black text-burgundy-900/50">
          السعر: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])} ج.م
        </p>
        <input
          type="range"
          min={filters.minPrice ?? 0}
          max={Math.max(maxPrice, filters.maxPrice ?? maxPrice)}
          value={priceRange[1]}
          onChange={(e) =>
            onChange({
              ...filters,
              maxPrice: Number(e.target.value),
            })
          }
          className="w-full accent-burgundy-700"
        />
        <div className="mt-1 flex justify-between text-[11px] font-bold text-burgundy-900/40">
          <span>{formatPrice(filters.minPrice ?? 0)} ج.م</span>
          <span>{formatPrice(maxPrice)} ج.م</span>
        </div>
      </div>

      {/* Availability */}
      <div>
        <p className="mb-3 text-xs font-black text-burgundy-900/50">
          التوفر
        </p>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-cream-100">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => set('inStockOnly', e.target.checked)}
            className="h-4 w-4 accent-burgundy-700"
          />
          <span className="text-sm font-bold text-burgundy-950">
            المتوفر فقط
          </span>
        </label>
      </div>

      {/* Offers only */}
      <div>
        <p className="mb-3 text-xs font-black text-burgundy-900/50">العروض</p>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-cream-100">
          <input
            type="checkbox"
            checked={filters.onSale}
            onChange={(e) => set('onSale', e.target.checked)}
            className="h-4 w-4 accent-burgundy-700"
          />
          <span className="text-sm font-bold text-burgundy-950">
            المنتجات المخفضة فقط
          </span>
        </label>
      </div>

      {/* Sort visibility hint */}
      <div className="rounded-2xl bg-vanilla-50 p-4">
        <p className="text-xs leading-relaxed text-burgundy-900/50">
          الترتيب يتم من الأعلى عبر أزرار الترتيب في قائمة المنتجات.
        </p>
      </div>
    </div>
  )
}

export { SORT_OPTIONS }