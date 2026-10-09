import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { formatPrice, calculateDiscount } from '../../utils/format'
import { useCategories } from '../../context/CategoriesContext'
import RatingStars from '../ui/RatingStars'
import Badge from '../ui/Badge'

export default function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isWishlisted, toggleItem } = useWishlist()
  const { categories } = useCategories()
  const wished = isWishlisted(product.id)

  const manualDisc = product.discount && Number(product.discount) > 0 ? Number(product.discount) : 0
  const discount = manualDisc > 0 ? manualDisc : calculateDiscount(product.price, product.oldPrice)
  const outOfStock = product.stock === 'out'
  const qtyAvailable = typeof product.qty === 'number' ? product.qty : null
  const soldOut = outOfStock || qtyAvailable === 0

  return (
    <div
      className="group animate-fade-in-up relative flex flex-col overflow-hidden rounded-3xl border border-vanilla-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-vanilla-200 hover:shadow-xl hover:shadow-burgundy-900/5"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {/* Image */}
      <Link
        to={`/product/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-vanilla-50"
      >
        {product.image?.endsWith('.svg') ? (
          <figure
            className="illustration-float"
            style={{ animationDelay: `${(index % 5) * 0.4}s` }}
          >
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className={`img-zoom h-full w-full object-cover ${soldOut ? 'opacity-50 saturate-50' : ''}`}
            />
          </figure>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`img-zoom h-full w-full object-cover ${soldOut ? 'opacity-50 saturate-50' : ''}`}
          />
        )}
        {/* Badges */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {product.badge && <Badge type={product.badge} />}
          {discount > 0 && (
            <Badge type="offer">{`خصم ${discount}%`}</Badge>
          )}
        </div>
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-burgundy-950/30">
            <span className="rounded-full bg-burgundy-950/85 px-5 py-2 text-xs font-black text-white">
              الكمية خلصت
            </span>
          </div>
        )}
        {/* Quick view */}
        {!soldOut && (
          <div className="absolute bottom-3 left-3 translate-y-12 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => navigate(`/product/${product.id}`)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-burgundy-900 shadow-lg backdrop-blur transition-colors hover:bg-white"
              aria-label="عرض سريع"
            >
              <Eye size={17} />
            </button>
          </div>
        )}
      </Link>

      {/* Wishlist */}
      <button
        onClick={() => toggleItem(product)}
        aria-label={wished ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
        className={`absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur transition-all duration-300 ${
          wished
            ? 'bg-burgundy-700 text-white'
            : 'bg-white/90 text-burgundy-900 hover:bg-white'
        }`}
      >
        <Heart size={17} className={wished ? 'fill-current' : ''} />
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-[11px] font-bold text-burgundy-700/60">
          {categories.find((c) => c.id === product.category)?.name || ''}
        </p>
        <Link
          to={`/product/${product.id}`}
          className="line-clamp-2 mb-2 text-sm font-black leading-snug text-burgundy-950 transition-colors hover:text-burgundy-700"
        >
          {product.name}
        </Link>

        <div className="mb-3 flex items-center gap-1">
          <RatingStars rating={product.rating} size={13} showValue />
          <span className="text-[11px] text-burgundy-900/40">
            ({product.reviews})
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            {product.oldPrice > product.price && (
              <p className="text-xs text-burgundy-900/40 line-through">
                {formatPrice(product.oldPrice)} ج.م
              </p>
            )}
            <p className="text-lg font-black text-burgundy-900">
              {formatPrice(product.price)}{' '}
              <span className="text-xs font-bold">ج.م</span>
            </p>
          </div>

          <button
            onClick={() => addItem(product)}
            disabled={soldOut}
            aria-label="أضف إلى السلة"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-burgundy-700 text-white shadow-md shadow-burgundy-700/30 transition-all duration-300 hover:bg-burgundy-800 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <ShoppingBag size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}