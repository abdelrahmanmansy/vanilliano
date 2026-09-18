import { createContext, useContext } from 'react'
import { toast } from 'react-hot-toast'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/constants'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist, removeWishlist] = useLocalStorage(
    STORAGE_KEYS.wishlist,
    [],
  )

  const toggleItem = (product) => {
    const exists = wishlist.includes(product.id)
    if (exists) {
      setWishlist((current) => current.filter((id) => id !== product.id))
      toast.success(`تمت إزالة "${product.name}" من المفضلة`)
    } else {
      setWishlist((current) => [...current, product.id])
      toast.success(`تمت إضافة "${product.name}" إلى المفضلة`)
    }
  }

  const removeItem = (id) => {
    setWishlist((current) => current.filter((item) => item !== id))
  }

  const clearWishlist = () => {
    setWishlist([])
    removeWishlist()
  }

  const isWishlisted = (id) => wishlist.includes(id)

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleItem,
        removeItem,
        clearWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}