import { Link, useNavigate } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'
import { categories } from '../data/categories'
import Products from './Products'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import EmptyState from '../components/ui/EmptyState'

export default function CategoryPage({ slug }) {
  const category = categories.find((c) => c.slug === slug)
  const navigate = useNavigate()

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <EmptyState
          icon={PackageSearch}
          title="القسم غير موجود"
          description="ربما تم نقل القسم أو حذفه. تصفح جميع المنتجات من المتجر."
          actionLabel="العودة للمتجر"
          onAction={() => navigate('/products')}
        />
      </div>
    )
  }

  return (
    <>
      {/* Category hero */}
      <section className="relative overflow-hidden bg-burgundy-950">
        <div className="absolute inset-0">
          <img
            src={category.image}
            alt=""
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950 via-burgundy-950/60 to-burgundy-950/30" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <Breadcrumbs items={[{ label: category.name }]} />
          <h1 className="mb-3 text-3xl font-black text-white md:text-4xl">
            {category.name}
          </h1>
          <p className="mb-6 max-w-2xl text-sm leading-relaxed text-cream-100/70 md:text-base">
            {category.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter((c) => c.id !== category.id)
              .map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.slug}`}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  {c.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      <div className="bg-cream-50">
        <Products presetCategoryId={category.id} />
      </div>
    </>
  )
}