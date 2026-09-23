import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { products as defaultProducts } from '../data/products'
import { supabaseService } from '../services/supabase'

const ProductsContext = createContext(null)

const STORAGE_KEY = 'vanilliano_products_overrides_v3'

function readLocalOverrides() {
  try {
    ;['vanilliano_products_overrides', 'vanilliano_products_overrides_v2'].forEach(
      (k) => window.localStorage.removeItem(k),
    )
    const override = window.localStorage.getItem(STORAGE_KEY)
    if (!override) return null
    const overrides = JSON.parse(override)
    if (!overrides.enabled) return null
    const list = Array.isArray(overrides.list) ? overrides.list : []
    const valid =
      list.length > 0 &&
      list.every(
        (p) =>
          p &&
          typeof p.id === 'string' &&
          typeof p.name === 'string' &&
          typeof p.price === 'number',
      )
    return valid ? list : null
  } catch {
    return null
  }
}

function persistLocal(list) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ enabled: true, list }),
    )
  } catch {
    /* ignore */
  }
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => readLocalOverrides() || defaultProducts)
  const [remoteReady, setRemoteReady] = useState(false)

  useEffect(() => {
    if (!supabaseService.isConfigured()) {
      setRemoteReady(true)
      return
    }
    let cancelled = false
    const loadRemote = async () => {
      try {
        const { data, error } = await supabaseService.getProducts()
        if (cancelled) return
        if (!error && Array.isArray(data) && data.length > 0) {
          setProducts(data)
          persistLocal(data)
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setRemoteReady(true)
      }
    }
    loadRemote()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({
      products,
      disabled: false,
      remoteReady,
      supabaseConfigured: supabaseService.isConfigured(),
    }),
    [products, remoteReady],
  )

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider')
  }
  return context
}