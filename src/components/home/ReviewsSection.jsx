import { useState, useEffect } from 'react'
import { Star, Send } from 'lucide-react'
import { supabaseService } from '../../services/supabase'
import Button from '../ui/Button'
import RatingStars from '../ui/RatingStars'
import { toast } from 'react-hot-toast'

const COLORS = ['#db8c33', '#c64e60', '#a35920', '#c47325', '#7a6a55', '#3f7d86', '#8a5a44', '#6b7f3a']

function avatarFor(name, i) {
  return {
    char: (name || 'ع').trim().charAt(0),
    color: COLORS[i % COLORS.length],
  }
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(!supabaseService.isConfigured())
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error } = await supabaseService.getReviews()
      if (cancelled) return
      if (!error) setReviews(data || [])
      setLoading(false)
    }
    if (supabaseService.isConfigured()) load()
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) {
      toast.error('اكتب رأيك المرة دي، ولو بسرعة')
      return
    }
    if (!name.trim()) {
      toast.error('اكتب اسمك عشان يظهر مع الرأي')
      return
    }
    setSubmitting(true)
    const { data, error } = await supabaseService.addReview({
      name: name.trim(),
      text: text.trim(),
      rating,
    })
    setSubmitting(false)
    if (error) {
      toast.error('حصلت مشكلة في الإرسال، جرب تاني')
      return
    }
    supabaseService.addActivity({
      kind: 'review',
      label: `رأي جديد من ${name.trim()} — بانتظار الموافقة`,
      meta: { name: name.trim(), rating },
    })
    setName('')
    setText('')
    setRating(5)
    toast.success('شكراً! رأيك اتبعت وبيظهر هنا بعد مراجعته')
  }

  return (
    <div className="mt-14 border-t border-vanilla-100 pt-12">
      <div className="mx-auto max-w-3xl">
        <h3 className="text-center text-2xl font-black text-burgundy-950">
          شاركنا رأيك 💬
        </h3>
        <p className="mt-2 text-center text-sm text-burgundy-900/50">
          جربتنا في متجرك وعلى موقعنا؟ اكتب رأيك ويظهر هنا بعد مراجعته.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-4 rounded-3xl border border-vanilla-100 bg-cream-50/50 p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                اسمك
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="مثال: منى أحمد"
                className="w-full rounded-2xl border border-vanilla-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-burgundy-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                تقييمك
              </label>
              <div className="flex items-center gap-1 py-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110"
                    aria-label={`${s} نجوم`}
                  >
                    <Star
                      size={26}
                      className={
                        (hover || rating) >= s
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-vanilla-200'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-black text-burgundy-900">
              رأيك
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="اكتب تجربتك مع متجرنا... جودة المنتجات، التغليف، سرعة التوصيل"
              className="w-full resize-none rounded-2xl border border-vanilla-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-burgundy-400"
            />
          </div>
          <Button type="submit" disabled={submitting}>
            <Send size={16} />
            {submitting ? 'جارٍ النشر...' : 'انشر رأيك'}
          </Button>
        </form>

        {reviews.length > 0 && (
          <div className="mt-8 space-y-4">
            <p className="text-xs font-black text-burgundy-900/40">
              أحدث آراء عملائنا ({reviews.length})
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map((r, i) => {
                const av = avatarFor(r.name, i)
                return (
                  <figure
                    key={r.id}
                    className="flex flex-col rounded-3xl border border-vanilla-100 bg-cream-50/50 p-6"
                  >
                    <RatingStars rating={Number(r.rating) || 5} size={14} />
                    <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-burgundy-900/70">
                      "{r.text}"
                    </blockquote>
                    <figcaption className="mt-4 flex items-center gap-3">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-full text-base font-black text-white"
                        style={{ backgroundColor: av.color }}
                      >
                        {av.char}
                      </span>
                      <div>
                        <p className="text-sm font-black text-burgundy-950">{r.name}</p>
                        <p className="text-[11px] text-burgundy-900/40">
                          عميل فانيليانو
                        </p>
                      </div>
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          </div>
        )}

        {loading && !supabaseService.isConfigured() && (
          <p className="mt-6 text-center text-xs font-bold text-burgundy-900/40">
            قسم الآراء المباشرة غير متاح حالياً.
          </p>
        )}
      </div>
    </div>
  )
}