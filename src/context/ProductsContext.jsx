import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
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
  const [supabaseSynced, setSupabaseSynced] = useState(false)

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
          setSupabaseSynced(true)
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

  const persist = (list) => {
    setProducts(list)
    persistLocal(list)
  }

  const upsertProduct = async (product) => {
    const exists = products.some((p) => p.id === product.id)
    const next = exists
      ? products.map((p) => (p.id === product.id ? { ...p, ...product } : p))
      : [...products, product]
    persist(next)
    if (supabaseService.isConfigured()) {
      const { error } = await supabaseService.saveProduct(product)
      if (error) {
        toast.error('حُفظ محلياً فقط — فشل الاتصال بقاعدة البيانات')
        return
      }
    }
    toast.success(exists ? 'تم تحديث المنتج' : 'تمت إضافة المنتج')
  }

  const deleteProduct = async (id) => {
    persist(products.filter((p) => p.id !== id))
    if (supabaseService.isConfigured()) {
      const { error } = await supabaseService.deleteProduct(id)
      if (error) {
        toast.error('حُذف محلياً فقط — فشل الاتصال بقاعدة البيانات')
        return
      }
    }
    toast.success('تم حذف المنتج')
  }

  const resetProducts = async () => {
    persist(defaultProducts)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    toast.success('تمت استعادة المنتجات الافتراضية')
  }

  const syncAllToSupabase = async () => {
    if (!supabaseService.isConfigured()) {
      toast.error('قاعدة البيانات غير مربوطة')
      return false
    }
    try {
      const list = readLocalOverrides() || defaultProducts
      const client = supabaseService.getClient()
      if (!client) return false
      const { data: sessionData } = await client.auth.getSession()
      if (!sessionData?.session) {
        toast.error('سجّل دخولك كصاحب المتجر أولاً')
        return false
      }
      for (let i = 0; i < list.length; i += 200) {
        const { error } = await client.from('products').upsert(list.slice(i, i + 200))
        if (error) throw error
      }
      setSupabaseSynced(true)
      toast.success('تمت مزامنة المنتجات مع قاعدة البيانات')
      return true
    } catch (err) {
      toast.error('فشلت المزامنة: ' + (err?.message || 'خطأ غير معروف'))
      return false
    }
  }

  const value = useMemo(
    () => ({
      products,
      upsertProduct,
      deleteProduct,
      resetProducts,
      syncAllToSupabase,
      disabled: false,
      remoteReady,
      supabaseSynced,
      supabaseConfigured: supabaseService.isConfigured(),
    }),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [products, remoteReady, supabaseSynced],
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