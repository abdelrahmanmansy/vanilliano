import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react'
import Logo from '../components/layout/Logo'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { EMAIL_REGEX } from '../utils/constants'
import { toast } from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const next = {}
    if (!EMAIL_REGEX.test(email)) next.email = 'أدخل بريداً إلكترونياً صحيحاً'
    if (password.length < 6)
      next.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (error) =>
    `peer w-full rounded-2xl border bg-cream-50/70 py-3.5 pl-12 pr-12 text-sm font-bold text-burgundy-950 outline-none transition-colors placeholder:text-burgundy-900/30 focus:bg-white focus:border-burgundy-400 ${
      error ? 'border-red-300' : 'border-vanilla-200'
    }`

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={52} showTagline={false} />
          <h1 className="mt-6 text-2xl font-black text-burgundy-950">
            أهلاً بعودتك 👋
          </h1>
          <p className="mt-2 text-sm text-burgundy-900/50">
            سجّل دخولك لتتابع طلباتك والمفضلة بشكل أسرع.
          </p>
        </div>

        <div className="rounded-[2rem] border border-vanilla-100 bg-white p-7 shadow-xl shadow-burgundy-900/5">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-burgundy-900/40"
                />
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors((er) => ({ ...er, email: undefined }))
                  }}
                  placeholder="you@email.com"
                  className={inputClass(errors.email)}
                  style={{ textAlign: 'right' }}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-[11px] font-bold text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock
                  size={17}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-burgundy-900/40"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors((er) => ({ ...er, password: undefined }))
                  }}
                  placeholder="••••••••"
                  className={inputClass(errors.password)}
                  style={{ textAlign: 'right' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-burgundy-900/40 hover:text-burgundy-700"
                  aria-label="إظهار كلمة المرور"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[11px] font-bold text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading} icon={LogIn}>
              {loading ? 'جارٍ التسجيل...' : 'تسجيل الدخول'}
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-vanilla-100 bg-vanilla-50/60 p-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-black text-burgundy-900">
              <ShieldCheck size={14} className="text-vanilla-600" />
              حساب تجريبي
            </p>
            <p className="text-xs leading-relaxed text-burgundy-900/60" dir="ltr">
              demo@vanilliano.com / vanilliano
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-burgundy-900/50">
            ليس لديك حساب؟{' '}
            <Link
              to="/register"
              className="font-black text-burgundy-700 hover:underline"
            >
              أنشئ حساباً جديداً
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}