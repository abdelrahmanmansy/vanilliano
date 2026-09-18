import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useCatalog } from '../hooks/useCatalog'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { formatPrice, calculateDiscount } from '../utils/format'
import EmptyState from '../components/ui/EmptyState'
import RatingStars from '../components/ui/RatingStars'
import Badge from '../components/ui/Badge'
import Breadcrumbs from '../components/ui/Breadcrumbs'

export default function Wishlist() {
  const { wishlist, removeItem, clearWishlist } = useWishlist()
  const { addItem } = useCart()
  const { products } = useProducts()
  const { getById } = useCatalog(products)
  const navigate = useNavigate()

  const items = wishlist
    .map((id) => getById(id))
    .filter(Boolean)

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <Breadcrumbs items={[{ label: 'المفضلة' }]} />
        <EmptyState
          icon={Heart}
          title="قائمة المفضلة فارغة"
          description="اضغط على أيقونة القلب على أي منتج تحبه ليظهر هنا وتجد أصيلاً."
          actionLabel="تصفح المنتجات"
          onAction={() => navigate('/products')}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ label: 'المفضلة' }]} />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-burgundy-950 md:text-3xl">
            المفضلة
          </h1>
          <p className="mt-1 text-sm text-burgundy-900/50">
            {items.length} منتج في قائمتك
          </p>
        </div>
        <button
          onClick={clearWishlist}
          className="text-xs font-bold text-red-500 hover:text-red-600"
        >
          مسح الكل
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => {
          const discount = calculateDiscount(product.price, product.oldPrice)
          return (
            <div
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-vanilla-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <Link
                to={`/product/${product.id}`}
                className="relative block aspect-square overflow-hidden bg-vanilla-50"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="img-zoom h-full w-full object-cover"
                />
                {product.badge && (
                  <span className="absolute right-3 top-3">
                    <Badge type={product.badge} />
                  </span>
                )}
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <Link
                  to={`/product/${product.id}`}
                  className="line-clamp-2 mb-2 text-sm font-black leading-snug text-burgundy-950 hover:text-burgundy-700"
                >
                  {product.name}
                </Link>
                <RatingStars rating={product.rating} size={13} />

                <div className="mt-auto flex items-end justify-between pt-3">
                  <div>
                    {discount > 0 && (
                      <p className="text-xs text-burgundy-900/40 line-through">
                        {formatPrice(product.oldPrice)} ج.م
                      </p>
                    )}
                    <p className="text-lg font-black text-burgundy-900">
                      {formatPrice(product.price)}{' '}
                      <span className="text-xs">ج.م</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => removeItem(product.id)}
                      aria-label="إزالة من المفضلة"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-vanilla-200 text-burgundy-900/50 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={() => addItem(product)}
                      disabled={product.stock === 'out'}
                      aria-label="أضف للسلة"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy-700 text-white transition-all hover:scale-105 disabled:opacity-40"
                    >
                      <ShoppingBag size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}