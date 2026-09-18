import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import Drawer from '../ui/Drawer'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/format'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

export default function CartDrawer({ open, onClose }) {
  const { cart, removeItem, updateQuantity, subtotal, totalItems } = useCart()

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`سلة التسوق (${totalItems})`}
      footer={
        cart.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-t border-vanilla-200 pt-4">
              <span className="font-bold text-burgundy-900">الإجمالي</span>
              <span className="text-xl font-black text-burgundy-950">
                {formatPrice(subtotal)}{' '}
                <span className="text-xs font-bold">ج.م</span>
              </span>
            </div>
            <Link to="/checkout" onClick={onClose} className="block">
              <Button fullWidth size="lg">
                إتمام الطلب
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        ) : null
      }
    >
      {cart.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="سلتك فارغة"
          description="أضف بعض المنتجات اللذيذة لتبدأ رحلة التسوق."
          actionLabel="تصفح المنتجات"
          onAction={onClose}
          compact
        />
      ) : (
        <ul className="space-y-4">
          {cart.map((item) => (
            <li
              key={item.id + (item.variant || '')}
              className="flex gap-3 rounded-2xl border border-vanilla-100 bg-white p-3 shadow-sm"
            >
              <Link
                to={`/product/${item.id}`}
                onClick={onClose}
                className="shrink-0 overflow-hidden rounded-xl"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-20 w-20 object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/product/${item.id}`}
                    onClick={onClose}
                    className="line-clamp-2 text-sm font-black leading-snug text-burgundy-950 hover:text-burgundy-700"
                  >
                    {item.product.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.id, item.variant)}
                    aria-label="حذف من السلة"
                    className="shrink-0 rounded-full p-1.5 text-burgundy-900/40 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="inline-flex items-center overflow-hidden rounded-full border border-vanilla-200">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                      className="flex h-7 w-7 items-center justify-center text-burgundy-900 hover:bg-burgundy-50"
                      aria-label="زيادة"
                    >
                      <Plus size={13} />
                    </button>
                    <span className="min-w-7 text-center text-xs font-black">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                      className="flex h-7 w-7 items-center justify-center text-burgundy-900 hover:bg-burgundy-50"
                      aria-label="تقليل"
                    >
                      <Minus size={13} />
                    </button>
                  </div>
                  <span className="text-sm font-black text-burgundy-900">
                    {formatPrice(item.product.price * item.quantity)}{' '}
                    <span className="text-xs">ج.م</span>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  )
}