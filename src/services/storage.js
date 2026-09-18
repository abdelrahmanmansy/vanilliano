import { STORAGE_KEYS } from '../utils/constants'

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('Failed to persist:', key, error)
  }
}

export const storageService = {
  getProducts() {
    return read(STORAGE_KEYS.products, null)
  },
  saveProducts(products) {
    write(STORAGE_KEYS.products, products)
  },
  getCart() {
    return read(STORAGE_KEYS.cart, [])
  },
  getWishlist() {
    return read(STORAGE_KEYS.wishlist, [])
  },
  getOrders() {
    return read(STORAGE_KEYS.orders, [])
  },
  saveOrders(orders) {
    write(STORAGE_KEYS.orders, orders)
  },
  getUser() {
    return read(STORAGE_KEYS.user, null)
  },
  saveUser(user) {
    write(STORAGE_KEYS.user, user)
  },
  clearAll() {
    Object.values(STORAGE_KEYS).forEach((key) =>
      window.localStorage.removeItem(key),
    )
  },
}