import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Check,
  AlertCircle,
} from 'lucide-react'
import Logo from '../components/layout/Logo'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { EMAIL_REGEX } from '../utils/constants'
import { toast } from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const passwordRules = [
    { test: (p) => p.length >= 6, label: '6 أحرف على الأقل' },
    { test: (p) => /[A-Za-z]/.test(p), label: 'حرف إنجليزي واحد' },
    { test: (p) => /\d/.test(p), label: 'رقم واحد على الأقل' },
  ]

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 3)
      next.name = 'الاسم يجب أن لا يقل عن 3 أحرف'
    if (!EMAIL_REGEX.test(form.email))
      next.email = 'أدخل بريداً إلكترونياً صحيحاً'
    if (!passwordRules.every((r) => r.test(form.password)))
      next.password = 'كلمة المرور لا تحقق الشروط'
    if (form.confirmPassword !== form.password)
      next.confirmPassword = 'كلمتا المرور غير متطابقتين'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setLoading(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      navigate('/')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (error) =>
    `w-full rounded-2xl border bg-cream-50/70 py-3.5 pr-12 text-sm font-bold text-burgundy-950 outline-none transition-colors placeholder:text-burgundy-900/30 focus:bg-white focus:border-burgundy-400 ${
      error ? 'border-red-300' : 'border-vanilla-200'
    }`

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={52} showTagline={false} />
          <h1 className="mt-6 text-2xl font-black text-burgundy-950">
            انضم إلى فانيليانو 🎉
          </h1>
          <p className="mt-2 text-sm text-burgundy-900/50">
            أنشئ حسابك لتستمتع بخصومات وتتبع أفضل للطلبات.
          </p>
        </div>

        <div className="rounded-[2rem] border border-vanilla-100 bg-white p-7 shadow-xl shadow-burgundy-900/5">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                الاسم الكامل
              </label>
              <div className="relative">
                <User
                  size={17}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-burgundy-900/40"
                />
                <input
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="اسمك الكريم"
                  className={inputClass(errors.name)}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-[11px] font-bold text-red-500">
                  {errors.name}
                </p>
              )}
            </div>

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
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
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
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
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
              <div className="mt-2 space-y-1">
                {passwordRules.map((r) => {
                  const pass = r.test(form.password)
                  return (
                    <p
                      key={r.label}
                      className={`flex items-center gap-1.5 text-[11px] font-bold ${
                        pass ? 'text-emerald-600' : 'text-burgundy-900/40'
                      }`}
                    >
                      {pass ? <Check size={11} /> : <AlertCircle size={11} />}
                      {r.label}
                    </p>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock
                  size={17}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-burgundy-900/40"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setField('confirmPassword', e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  className={inputClass(errors.confirmPassword)}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-[11px] font-bold text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              icon={UserPlus}
            >
              {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
            </Button>
          </form>

          <div className="mt-4 rounded-2xl bg-vanilla-50/60 p-3 text-center">
            <p className="text-[11px] leading-relaxed text-burgundy-900/50">
              التسجيل تجريبي ومحلي على جهازك؛ بياناتك لا تُرسل إلى أي خادم.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-burgundy-900/50">
            لديك حساب بالفعل؟{' '}
            <Link
              to="/login"
              className="font-black text-burgundy-700 hover:underline"
            >
              سجّل دخولك
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}