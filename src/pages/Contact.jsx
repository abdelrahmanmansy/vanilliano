import { useState } from 'react'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
} from 'lucide-react'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import { EMAIL_REGEX, PHONE_REGEX, STORE, WHATSAPP_LINK } from '../utils/constants'
import { toast } from 'react-hot-toast'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

const contactChannels = [
  {
    icon: Phone,
    title: 'اتصل بنا',
    value: STORE.phoneDisplay,
    note: 'رد فوري خلال ساعات العمل',
    href: `tel:${STORE.phones[0].replace(/\s/g, '')}`,
  },
  {
    icon: Mail,
    title: 'البريد الإلكتروني',
    value: STORE.email,
    note: 'نرد خلال 24 ساعة',
    href: `mailto:${STORE.email}`,
  },
  {
    icon: MapPin,
    title: 'فرع دهشور',
    value: STORE.branches[0].name,
    note: 'بدرشين، الجيزة بجوار كورشي مول',
  },
  {
    icon: MessageCircle,
    title: 'واتساب',
    value: STORE.phones[0],
    note: 'أسرع طريقة للتواصل والطلب',
    href: WHATSAPP_LINK(),
  },
]

export default function Contact() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 3)
      next.name = 'يرجى إدخال اسم لا يقل عن 3 أحرف'
    if (!EMAIL_REGEX.test(form.email))
      next.email = 'يرجى إدخال بريد إلكتروني صحيح'
    if (form.phone && !PHONE_REGEX.test(form.phone))
      next.phone = 'يرجى إدخال رقم هاتف صحيح'
    if (!form.subject.trim()) next.subject = 'يرجى اختيار موضوع الرسالة'
    if (form.message.trim().length < 10)
      next.message = 'الرسالة يجب أن لا تقل عن 10 أحرف'
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) {
      toast.error('يرجى تصحيح الحقول المميزة بالأحمر')
      return
    }
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      setForm(initialForm)
      toast.success('تم إرسال رسالتك بنجاح، سنرد عليك قريباً!')
      setTimeout(() => setSent(false), 5000)
    }, 1200)
  }

  const inputClass = (error) =>
    `w-full rounded-2xl border bg-white px-4 py-3 text-sm font-bold text-burgundy-950 outline-none transition-colors placeholder:text-burgundy-900/30 focus:border-burgundy-400 ${
      error ? 'border-red-300' : 'border-vanilla-200'
    }`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumbs items={[{ label: 'تواصل معنا' }]} />
      <h1 className="mb-2 text-2xl font-black text-burgundy-950 md:text-3xl">
        تواصل معنا
      </h1>
      <p className="mb-10 max-w-xl text-sm text-burgundy-900/50">
        عندك سؤال، استفسار جملة، أو فكرة تعاون؟ فريق فانيليانو جاهز لسماعك.
      </p>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contactChannels.map(({ icon: Icon, title, value, note, href }) => {
          const body = (
            <>
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-vanilla-100 text-burgundy-700">
                <Icon size={20} />
              </span>
              <h3 className="text-sm font-black text-burgundy-950">{title}</h3>
              <p className="mt-1 text-sm font-bold text-burgundy-700" dir="ltr">
                {value}
              </p>
              <p className="mt-1 text-[11px] text-burgundy-900/40">{note}</p>
            </>
          )
          const className =
            'block rounded-3xl border border-vanilla-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md'
          return href ? (
            <a
              key={title}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className={className}
            >
              {body}
            </a>
          ) : (
            <div key={title} className={className}>
              {body}
            </div>
          )
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Form */}
        <div className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm lg:col-span-3 md:p-8">
          {sent && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
              <CheckCircle2 size={20} />
              تم استلام رسالتك! سيتواصل معك فريقنا خلال 24 ساعة.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                  الاسم الكامل *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="اسمك الكريم"
                  className={inputClass(errors.name)}
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] font-bold text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="you@email.com"
                  className={inputClass(errors.email)}
                  style={{ textAlign: 'right' }}
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] font-bold text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                  رقم الجوال (اختياري)
                </label>
                <input
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className={inputClass(errors.phone)}
                  style={{ textAlign: 'right' }}
                />
                {errors.phone && (
                  <p className="mt-1 text-[11px] font-bold text-red-500">
                    {errors.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                  موضوع الرسالة *
                </label>
                <select
                  value={form.subject}
                  onChange={(e) => setField('subject', e.target.value)}
                  className={inputClass(errors.subject)}
                >
                  <option value="">اختر الموضوع</option>
                  <option value="order">استفسار عن طلب</option>
                  <option value="wholesale">طلبات الجملة</option>
                  <option value="partnership">شراكة / تعاون</option>
                  <option value="support">دعم فني</option>
                  <option value="other">أخرى</option>
                </select>
                {errors.subject && (
                  <p className="mt-1 text-[11px] font-bold text-red-500">
                    {errors.subject}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">
                رسالتك *
              </label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setField('message', e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className={`${inputClass(errors.message)} resize-none`}
              />
              {errors.message && (
                <p className="mt-1 text-[11px] font-bold text-red-500">
                  {errors.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              icon={Send}
              loading={sending}
              fullWidth
            >
              {sending ? 'جارٍ الإرسال...' : 'إرسال الرسالة'}
            </Button>
          </form>
        </div>

        {/* Info sidebar */}
        <aside className="rounded-3xl bg-burgundy-950 p-8 text-cream-100 lg:col-span-2">
          <h3 className="mb-3 text-xl font-black text-white">
            نرد عليك بسرعة ⚡
          </h3>
          <p className="mb-6 text-sm leading-relaxed text-cream-100/60">
            غالباً نرد خلال ساعات العمل وليس أكثر من 24 ساعة. للحالات
            المستعجلة تواصل معنا عبر الواتساب.
          </p>
          <div className="space-y-4">
            {[
              { icon: Clock, text: STORE.hours },
              { icon: MapPin, text: 'فرع دهشور — بدرشين، الجيزة' },
              { icon: MessageCircle, text: 'رد فوري على الواتساب' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-2xl bg-white/5 p-4"
              >
                <Icon size={18} className="mt-0.5 shrink-0 text-vanilla-300" />
                <span className="text-sm text-cream-100/80">{text}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 p-4">
            <p className="text-xs font-black text-vanilla-300">للطلبات الفورية</p>
            <a
              href={WHATSAPP_LINK()}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-sm font-bold text-white"
              dir="ltr"
            >
              wa.me/{STORE.whatsapp}
            </a>
          </div>
        </aside>
      </div>

      {/* Branches map placeholder */}
      <div className="mt-8 rounded-3xl bg-gradient-to-br from-vanilla-100 to-cream-100 p-8">
        <h3 className="mb-5 flex items-center gap-2 text-lg font-black text-burgundy-950">
          <MapPin size={20} className="text-burgundy-700" />
          فروعنا في انتظارك
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {STORE.branches.map((b) => (
            <div
              key={b.name}
              className="rounded-2xl border border-vanilla-100 bg-white p-5 shadow-sm"
            >
              <p className="mb-1 flex items-center gap-2 text-sm font-black text-burgundy-950">
                <MapPin size={15} className="text-burgundy-700" />
                {b.name}
              </p>
              <p className="text-sm font-bold text-burgundy-900/60">{b.address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}