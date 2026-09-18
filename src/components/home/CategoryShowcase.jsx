import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { categories } from '../../data/categories'
import { useProducts } from '../../context/ProductsContext'
import { useCatalog } from '../../hooks/useCatalog'
import SectionHeader from '../ui/SectionHeader'

export default function CategoryShowcase() {
  const { products } = useProducts()
  const { byCategory } = useCatalog(products)
  const categoryCount = (id) => byCategory(id).length
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          title="تسوق حسب القسم"
          subtitle="خمسة أقسام مكتملة تلبي كل احتياجاتك، من المطبخ إلى طاولة الاحتفال."
        />
        <Link
          to="/products"
          className="mb-10 hidden shrink-0 items-center gap-1 text-sm font-black text-burgundy-700 transition-colors hover:text-burgundy-900 md:flex"
        >
          جميع الأقسام
          <ArrowLeft size={16} className="rtl:rotate-180" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => {
          const count = categoryCount(category.id)
          const featured = index === 0
          return (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className={`group relative overflow-hidden rounded-3xl shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl ${
                featured ? 'lg:col-span-2 lg:row-span-2' : ''
              }`}
            >
              <img
                src={category.image}
                alt={category.name}
                className={`img-zoom h-full w-full object-cover ${
                  featured ? 'min-h-[420px] lg:min-h-[520px]' : 'min-h-[220px]'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950/85 via-burgundy-950/20 to-transparent" />
              <div
                className={`absolute inset-x-0 ${featured ? 'bottom-0 p-7' : 'bottom-0 p-5'}`}
              >
                <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                  {count} منتج
                </span>
                <h3
                  className={`font-black text-white ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}
                >
                  {category.name}
                </h3>
                <p
                  className={`mt-1 text-sm text-cream-100/80 ${featured ? '' : 'line-clamp-1'}`}
                >
                  {category.tagline}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}