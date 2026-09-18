import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, MessageCircleQuestion, Search } from 'lucide-react'
import { faqs } from '../data/faqs'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import { WHATSAPP_LINK } from '../utils/constants'

export default function FAQ() {
  const [searchParams] = useSearchParams()
  const openFromUrl = searchParams.get('open')
  const [openId, setOpenId] = useState(openFromUrl || null)
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered = q
    ? faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q),
      )
    : faqs

  const toggle = (id) => setOpenId(openId === id ? null : id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ label: 'الأسئلة الشائعة' }]} />
      <h1 className="text-2xl font-black text-burgundy-950 md:text-3xl">
        الأسئلة الشائعة
      </h1>
      <p className="mb-8 mt-2 text-sm text-burgundy-900/50">
        جواب لأكثر الأسئلة التي تصلنا. إن لم تجد جوابك، تواصل معنا بكل سرور.
      </p>

      {/* Search */}
      <div className="mb-8 flex items-center gap-3 rounded-full border border-vanilla-200 bg-white px-5 py-2 shadow-sm focus-within:border-burgundy-300">
        <Search size={18} className="text-burgundy-900/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في الأسئلة..."
          className="w-full bg-transparent py-2 text-sm font-bold outline-none placeholder:text-burgundy-900/30"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-vanilla-200 bg-cream-100/50 text-center">
          <div className="mx-auto max-w-md py-14 px-6">
            <MessageCircleQuestion
              size={42}
              className="mx-auto mb-4 text-burgundy-700"
            />
            <h3 className="mb-2 text-lg font-black text-burgundy-950">
              لا نجد إجابة لسؤالك
            </h3>
            <p className="mb-6 text-sm text-burgundy-900/60">
              جرّب كلمات أخرى أو راسلنا مباشرة وسنوضح لك كل شيء.
            </p>
            <Link to="/contact">
              <Button>تواصل معنا</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => {
            const isOpen = openId === f.id
            return (
              <div
                key={f.id}
                className={`overflow-hidden rounded-3xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-burgundy-200 bg-white shadow-md'
                    : 'border-vanilla-100 bg-white shadow-sm hover:border-vanilla-200'
                }`}
              >
                <button
                  onClick={() => toggle(f.id)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-right"
                >
                  <span className="text-sm font-black text-burgundy-950 md:text-base">
                    {f.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-burgundy-700 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-burgundy-900/60">
                      {f.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Still have questions */}
      <div className="mt-10 rounded-3xl bg-gradient-to-l from-vanilla-100 to-cream-100 p-8 text-center">
        <h3 className="mb-2 text-lg font-black text-burgundy-950">
          لديك سؤال آخر؟
        </h3>
        <p className="mb-5 text-sm text-burgundy-900/60">
          فريق الدعم جاهز لمساعدتك عبر الواتساب أو بريدنا الإلكتروني.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/contact">
            <Button variant="primary">ابدأ محادثة</Button>
          </Link>
          <a
            href={WHATSAPP_LINK()}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="secondary">واتساب</Button>
          </a>
        </div>
      </div>
    </div>
  )
}