import { createContext, useContext, useState } from 'react'
import { toast } from 'react-hot-toast'
import { storageService } from '../services/storage'
import { supabaseService } from '../services/supabase'

const AuthContext = createContext(null)

const DEMO_EMAIL = 'demo@vanilliano.com'
const DEMO_PASSWORD = 'vanilliano'

function initialUser() {
  const u = storageService.getUser()
  if (u && u.role === 'admin') return null
  return u
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser)

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
          supabaseService.addActivity({
            kind: 'login',
            label: `تسجيل دخول: ${email}`,
            meta: { email },
          })
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
        supabaseService.addActivity({
          kind: 'login',
          label: `حساب جديد: ${email}`,
          meta: { email },
        })
        resolve(newUser)
      }, 900)
    })
  }

  const logout = () => {
    const email = user?.email || 'غير معروف'
    storageService.saveUser(null)
    setUser(null)
    toast.success('تم تسجيل الخروج بنجاح')
    supabaseService.addActivity({
      kind: 'logout',
      label: `تسجيل خروج: ${email}`,
      meta: { email },
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
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