import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CreditCard,
  Smartphone,
  Clock,
  Banknote,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Logo from './Logo'
import { categories } from '../../data/categories'
import { STORE, WHATSAPP_LINK } from '../../utils/constants'

const socials = [
  {
    label: 'واتساب',
    href: WHATSAPP_LINK(),
    path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
  },
  {
    label: 'فيسبوك',
    href: 'https://www.facebook.com/share/1Q6pyrTGBg/?mibextid=wwXIfr',
    path: 'M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.408.593 24 1.324 24h11.494v-9.294H9.689v-3.621h3.129V8.41c0-3.099 1.893-4.787 4.659-4.787 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.621h-3.12V24h6.116c.73 0 1.324-.593 1.324-1.324V1.324C24 .593 23.408 0 22.676 0z',
  },
  {
    label: 'انستغرام',
    href: 'https://www.instagram.com/',
    path: 'M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2m0 4.9a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8m0 2.1a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6m5.1-3.7a1.1 1.1 0 1 0 0 2.3 1.1 1.1 0 0 0 0-2.3Z',
  },
  {
    label: 'تيك توك',
    href: 'https://www.tiktok.com/',
    path: 'M16.6 5.8a4.8 4.8 0 0 1-2.4-4.2h-3.1v13.2a2.9 2.9 0 0 1-2.9 2.8 2.9 2.9 0 1 1 3-3.7V8.6a7.9 7.9 0 0 0 4.6 1.4 8 8 0 0 0 2.4-.4v-3a4.7 4.7 0 0 1-1.6.2Z',
  },
  {
    label: 'سناب شات',
    href: 'https://www.snapchat.com/',
    path: 'M12 2.6c-2.5 0-4.4 1-5.6 2.8a8.7 8.7 0 0 0-1.1 4.4c-1.3.9-2 1.9-2 3 0 1 .4 1.8 1.2 2.3.3.2.6.4 1 .6.1 2 .9 3.4 2.5 4.2.4.2.9.2 1.4.2.2 1.2.9 1.9 2 2.1h3.4c1.3-.2 2.1-1 2.3-2.3.4 0 .8-.1 1.1-.3 1.9-.8 2.8-2.3 2.8-4.3 0-1.1-.7-2-2-3V9.7a8.7 8.7 0 0 0-1.1-4.4C16.4 3.6 14.5 2.6 12 2.6Z',
  },
]

const SocialIcon = ({ path }) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
    <path d={path} />
  </svg>
)

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    const email = newsletterEmail.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح')
      return
    }
    try {
      const subs = JSON.parse(
        window.localStorage.getItem('vanilliano_newsletter') || '[]',
      )
      const next = [...new Set([...subs, email])]
      window.localStorage.setItem('vanilliano_newsletter', JSON.stringify(next))
      setNewsletterEmail('')
      toast.success('مرحباً بك في نادي فانيليانو! استخدم كود WELCOME10 لأول طلب 🎉')
    } catch {
      toast.error('تعذر الاشتراك الآن، جرّب مرة أخرى')
    }
  }

  return (
    <footer className="mt-20 bg-burgundy-950 text-cream-100">
      {/* Top CTA strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between">
          <div>
            <h3 className="text-xl font-black text-white md:text-2xl">
              تبقى على آخر العروض والمنتجات 🔔
            </h3>
            <p className="mt-1 text-sm text-cream-100/60">
              اشترك في النشرة البريدية واحصل على خصم 10% على أول طلب.
            </p>
          </div>
          <form
            onSubmit={handleSubscribe}
            className="flex w-full max-w-md items-center gap-2 rounded-full bg-white/10 p-1.5 backdrop-blur"
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="بريدك الإلكتروني"
              className="flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-cream-100/40"
            />
            <button
              type="submit"
              className="flex h-10 items-center gap-2 rounded-full bg-vanilla-500 px-5 text-sm font-black text-burgundy-950 transition-colors hover:bg-vanilla-400"
            >
              <Send size={15} />
              اشتراك
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo size={40} />
          <p className="mt-4 text-sm leading-relaxed text-cream-100/60">
            متجر فانيليانو وجهتك المفضلة لكل مستلزمات الحلويات والكيك ومستلزمات
            الحفلات والتغليف الهدايا، بجودة عالية وأسعار منافسة.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socials.map(({ label, href, path }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                aria-label={label}
                title={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream-100 transition-all duration-300 hover:-translate-y-1 hover:bg-vanilla-500 hover:text-burgundy-950"
              >
                <SocialIcon path={path} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-base font-black text-white">الأقسام</h4>
          <ul className="space-y-2.5">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/category/${c.slug}`}
                  className="text-sm text-cream-100/60 transition-colors hover:text-vanilla-300"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-base font-black text-white">روابط سريعة</h4>
          <ul className="space-y-2.5">
            {[
              { to: '/products', label: 'جميع المنتجات' },
              { to: '/offers', label: 'العروض الحالية' },
              { to: '/about', label: 'من نحن' },
              { to: '/contact', label: 'تواصل معنا' },
              { to: '/faq', label: 'الأسئلة الشائعة' },
              { to: '/wishlist', label: 'المفضلة' },
              { to: '/checkout', label: 'إتمام الطلب' },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-cream-100/60 transition-colors hover:text-vanilla-300"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-base font-black text-white">تواصل معنا</h4>
          <ul className="space-y-3 text-sm text-cream-100/60">
            <li className="flex items-center gap-3">
              <Phone size={16} className="shrink-0 text-vanilla-400" />
              <span dir="ltr">
                {STORE.phones.map((p, i) => (
                  <span key={p}>
                    <a
                      href={`tel:${p.replace(/\s/g, '')}`}
                      className="transition-colors hover:text-vanilla-300"
                    >
                      {p}
                    </a>
                    {i === 0 && <span className="mx-1">·</span>}
                  </span>
                ))}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="shrink-0 text-vanilla-400" />
              <a
                href={`mailto:${STORE.email}`}
                dir="ltr"
                className="transition-colors hover:text-vanilla-300"
              >
                {STORE.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-vanilla-400" />
              <span>
                فرع دهشور — بدرشين، الجيزة
                <span className="block text-xs text-cream-100/40">
                  بجوار كورشي مول
                </span>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Clock size={16} className="shrink-0 text-vanilla-400" />
              يومياً: 10ص - 10م
            </li>
          </ul>
        </div>
      </div>

      {/* Payment + bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
          <div className="flex items-center gap-3">
            {[
              { icon: Smartphone, label: 'فودافون كاش' },
              { icon: CreditCard, label: 'إنستا باي' },
              { icon: Banknote, label: 'الدفع عند الاستلام' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-[11px] font-bold text-cream-100/70"
              >
                <Icon size={14} className="text-vanilla-400" />
                {label}
              </span>
            ))}
          </div>
          <p className="text-xs text-cream-100/40">
            © {new Date().getFullYear()} فانيليانو Vanilliano - جميع الحقوق
            محفوظة
          </p>
        </div>
      </div>
    </footer>
  )
}