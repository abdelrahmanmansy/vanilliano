import { createContext, useContext, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/constants'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart, removeCart] = useLocalStorage(STORAGE_KEYS.cart, [])

  const addItem = (product, quantity = 1, options = {}) => {
    if (product.stock === 'out') {
      toast.error('هذا المنتج غير متوفر حالياً')
      return
    }
    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id && item.variant === options.variant,
      )
      if (existing) {
        return current.map((item) =>
          item.id === product.id && item.variant === options.variant
            ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
            : item,
        )
      }
      return [
        ...current,
        {
          id: product.id,
          variant: options.variant || null,
          quantity,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            image: product.image,
            category: product.category,
            stock: product.stock,
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
      current.map((item) =>
        item.id === id && item.variant === variant
          ? { ...item, quantity: Math.min(quantity, 99) }
          : item,
      ),
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