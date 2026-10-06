import { createContext, useContext, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/constants'

const CartContext = createContext(null)

// الحد الأقصى للوحدة الواحدة: الكمية المتوفرة لو محددة، وإلا 99 (الحد التاريخي)
const MAX_PER_ITEM = 99

const stockLimit = (product) =>
  typeof product?.qty === 'number' && product.qty >= 0
    ? Math.min(product.qty, MAX_PER_ITEM)
    : MAX_PER_ITEM

export function CartProvider({ children }) {
  const [cart, setCart, removeCart] = useLocalStorage(STORAGE_KEYS.cart, [])

  const addItem = (product, quantity = 1, options = {}) => {
    const limit = stockLimit(product)
    if (product.stock === 'out' || limit <= 0) {
      toast.error('هذا المنتج غير متوفر حالياً')
      return
    }
    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id && item.variant === options.variant,
      )
      if (existing) {
        const next = Math.min(existing.quantity + quantity, limit)
        if (next === existing.quantity) {
          toast.error(`الكمية المتاحة من "${product.name}" هي ${limit} فقط`)
          return current
        }
        return current.map((item) =>
          item.id === product.id && item.variant === options.variant
            ? { ...item, quantity: next }
            : item,
        )
      }
      return [
        ...current,
        {
          id: product.id,
          variant: options.variant || null,
          quantity: Math.min(quantity, limit),
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            image: product.image,
            category: product.category,
            stock: product.stock,
            qty: product.qty,
          },
        },
      ]
    })
    toast.success(`تمت إضافة "${product.name}" إلى السلة`)
  }

  const removeItem = (id, variant = null) => {
    setCart((current) =>
      current.filter(
        (item) => !(item.id === id && item.variant === variant),
      ),
    )
    toast.success('تمت إزالة المنتج من السلة')
  }

  const updateQuantity = (id, quantity, variant = null) => {
    if (quantity < 1) {
      removeItem(id, variant)
      return
    }
    setCart((current) =>
      current.map((item) => {
        if (item.id !== id || item.variant !== variant) return item
        const limit = stockLimit(item.product)
        const next = Math.min(quantity, limit)
        if (next < quantity) {
          toast.error(`الكمية المتاحة من "${item.product.name}" هي ${limit} فقط`)
        }
        return next < 1 ? item : { ...item, quantity: next }
      }),
    )
  }

  const clearCart = () => {
    setCart([])
    removeCart()
  }

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  )

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
    [cart],
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}