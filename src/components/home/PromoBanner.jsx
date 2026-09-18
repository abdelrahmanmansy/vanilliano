import { Link } from 'react-router-dom'
import { ArrowLeft, Gift } from 'lucide-react'

export default function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-burgundy-700 via-burgundy-800 to-burgundy-950">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-vanilla-400/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-6 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col items-center justify-between gap-6 p-8 text-center md:flex-row md:text-right">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black text-vanilla-300 backdrop-blur">
              <Gift size={14} />
              عرض خاص للطلبات الكبيرة
            </span>
            <h3 className="text-2xl font-black leading-snug text-white md:text-3xl">
              احصل على خصم يصل إلى 20%
              <br className="hidden md:block" /> على طلبات المناسبات والتجهيزات
            </h3>
            <p className="mt-2 text-sm text-cream-100/70">
              تواصل معنا لعرض سعر خاص لمناسبتك خلال ساعات.
            </p>
          </div>
          <Link
            to="/contact"
            className="flex shrink-0 items-center gap-2 rounded-full bg-vanilla-500 px-7 py-3.5 text-sm font-black text-burgundy-950 shadow-xl shadow-burgundy-950/30 transition-all duration-300 hover:scale-105 hover:bg-vanilla-400"
          >
            اطلب عرض سعر
            <ArrowLeft size={16} className="rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  )
}