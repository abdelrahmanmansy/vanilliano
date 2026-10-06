import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { categories as defaultCategories } from '../data/categories'
import { supabaseService } from '../services/supabase'
import { asset } from '../utils/asset'

const CategoriesContext = createContext(null)

const STORAGE_KEY = 'vanilliano_categories_v1'

// الأقسام اللي اتحفظوا من الداشبورد — بتسبق الملف المحلي عشان أي تعديل يظهر فوراً
function readCached() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const list = JSON.parse(raw)
    if (!Array.isArray(list) || list.length === 0) return null
    return list.every((c) => c && typeof c.id === 'string' && typeof c.name === 'string')
      ? list
      : null
  } catch {
    return null
  }
}

function cache(list) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

// الصورة ممكن تيجي من الداتابيز نسبية (/vanilliano/…) أو رابط كامل — asset() بيتعامل مع الاتنين
const withImage = (c) => (c && c.image ? { ...c, image: asset(c.image) } : c)

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(() =>
    (readCached() || defaultCategories).map(withImage),
  )

  useEffect(() => {
    if (!supabaseService.isConfigured()) return
    let cancelled = false
    const load = async () => {
      try {
        const { data, error } = await supabaseService.getCategories()
        if (cancelled) return
        if (!error && Array.isArray(data) && data.length > 0) {
          const list = data.map(withImage)
          setCategories(list)
          cache(list)
        }
      } catch {
        /* ignore */
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({ categories, configured: supabaseService.isConfigured() }),
    [categories],
  )

  return (
    <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoriesContext)
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider')
  }
  return context
}
