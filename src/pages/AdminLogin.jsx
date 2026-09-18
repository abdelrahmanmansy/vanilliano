import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import { toast } from 'react-hot-toast'

export default function AdminLogin() {
  const { loginAsAdmin, adminLoading, hasSupabase } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('أدخل البريد وكلمة السر')
      return
    }
    setSubmitting(true)
    try {
      await loginAsAdmin({ email, password })
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.message || 'بيانات الدخول غير صحيحة')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-[2.5rem] border border-vanilla-100 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-burgundy-700 text-white shadow-lg shadow-burgundy-700/25">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-black text-burgundy-950">
            منطقة محمية
          </h1>
          <p className="mt-2 text-sm text-burgundy-900/50">
            الوصول غير متاح إلا بالدعوة المباشرة
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-black text-burgundy-900">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              className="w-full rounded-2xl border border-vanilla-200 bg-cream-50 px-4 py-3 text-left text-sm font-bold outline-none focus:border-burgundy-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black text-burgundy-900">
              كلمة السر
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-burgundy-900/30" />
              <input
                type={show ? 'text' : 'password'}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-vanilla-200 bg-cream-50 py-3 pr-10 pl-4 text-left text-sm font-bold outline-none focus:border-burgundy-400"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-burgundy-900/40 hover:text-burgundy-700"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!hasSupabase && (
            <p className="rounded-xl bg-vanilla-100 px-4 py-2 text-[11px] leading-relaxed text-burgundy-900/60">
              قاعدة البيانات غير مربوطة حالياً — سيتم اعتماد الدخول التجريبي
              بشكل مؤقت حتى إتمام ربط Supabase.
            </p>
          )}

          <Button
            fullWidth
            type="submit"
            size="lg"
            disabled={adminLoading || submitting}
          >
            {submitting ? 'جارٍ الدخول...' : 'دخول'}
            {!submitting && <ArrowRight size={18} />}
          </Button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="mt-6 w-full text-center text-xs font-black text-burgundy-900/40 hover:text-burgundy-700"
        >
          العودة إلى المتجر
        </button>
      </div>
    </div>
  )
}