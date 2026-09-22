import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { storageService } from '../services/storage'
import { supabaseService } from '../services/supabase'

const AuthContext = createContext(null)

const DEMO_EMAIL = 'demo@vanilliano.com'
const DEMO_PASSWORD = 'vanilliano'

const OWNER_EMAIL = 'abdelrahmanahmedmansy@gmail.com'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storageService.getUser())
  const [adminLoading, setAdminLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const checkAdmin = async () => {
      try {
        if (!supabaseService.isConfigured()) {
          if (!cancelled) setAdminLoading(false)
          return
        }
        const { data } = await supabaseService.getAdminSession()
        if (!cancelled && data?.session) {
          const sessionEmail = data.session.user.email
          if (sessionEmail === OWNER_EMAIL) {
            const admin = {
              id: 'admin_supabase',
              name: 'صاحب المتجر',
              email: sessionEmail,
              role: 'admin',
              joinedAt: new Date().toISOString(),
            }
            storageService.saveUser(admin)
            setUser(admin)
          }
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setAdminLoading(false)
      }
    }
    checkAdmin()
    return () => {
      cancelled = true
    }
  }, [])

  const login = ({ email, password }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const cleanEmail = String(email || '').trim().toLowerCase()
        const cleanPassword = String(password || '').trim()
        if (
          cleanEmail === DEMO_EMAIL &&
          cleanPassword === DEMO_PASSWORD
        ) {
          const newUser = {
            id: 'd1',
            name: 'مستخدم فانيليانو',
            email,
            role: 'user',
            joinedAt: new Date().toISOString(),
          }
          storageService.saveUser(newUser)
          setUser(newUser)
          toast.success('تم تسجيل الدخول بنجاح، أهلاً بعودتك!')
          resolve(newUser)
        } else {
          reject(
            new Error(
              'بيانات الدخول غير صحيحة. جرّب الحساب التجريبي: demo@vanilliano.com / vanilliano',
            ),
          )
        }
      }, 900)
    })
  }

  const register = ({ name, email, password }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!name || !email || !password) {
          reject(new Error('جميع الحقول مطلوبة'))
          return
        }
        const newUser = {
          id: `u_${Date.now()}`,
          name,
          email,
          role: 'user',
          joinedAt: new Date().toISOString(),
        }
        storageService.saveUser(newUser)
        setUser(newUser)
        toast.success(`أهلاً بك في فانيليانو، ${name}!`)
        resolve(newUser)
      }, 900)
    })
  }

  const loginAsAdmin = async ({ email, password } = {}) => {
    if (supabaseService.isConfigured() && email && password) {
      const { data, error } = await supabaseService.signInAdmin(email, password)
      if (error) {
        throw new Error(
          error.message || 'بيانات الدخول غير صحيحة',
        )
      }
      if (data?.user?.email !== OWNER_EMAIL) {
        await supabaseService.signOutAdmin()
        throw new Error(
          'هذا الحساب ليس حساب صاحب المتجر.',
        )
      }
      const admin = {
        id: 'admin_supabase',
        name: 'صاحب المتجر',
        email: data.user.email,
        role: 'admin',
        joinedAt: new Date().toISOString(),
      }
      storageService.saveUser(admin)
      setUser(admin)
      toast.success('تم الدخول إلى لوحة التحكم')
      return admin
    }
    const admin = {
      id: 'admin_1',
      name: 'مدير المتجر',
      email: 'admin@vanilliano.com',
      role: 'admin',
      joinedAt: new Date().toISOString(),
    }
    storageService.saveUser(admin)
    setUser(admin)
    toast.success('تم الدخول إلى لوحة التحكم')
  }

  const logout = async () => {
    if (supabaseService.isConfigured()) {
      await supabaseService.signOutAdmin()
    }
    storageService.saveUser(null)
    setUser(null)
    toast.success('تم تسجيل الخروج بنجاح')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        loginAsAdmin,
        logout,
        isAdmin,
        adminLoading,
        hasSupabase: supabaseService.isConfigured(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}