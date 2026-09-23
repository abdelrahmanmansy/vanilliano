import { testimonials } from '../../data/testimonials'
import RatingStars from '../ui/RatingStars'
import SectionHeader from '../ui/SectionHeader'
import ReviewsSection from './ReviewsSection'

export default function Testimonials() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeader
          title="ماذا يقول عملاؤنا ؟"
          subtitle="آراء حقيقية من صانعي الحلويات ومنظمي الحفلات الذين يثقون بفانيليانو."
          centered
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="flex flex-col rounded-3xl border border-vanilla-100 bg-cream-50/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <RatingStars rating={t.rating} size={14} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-burgundy-900/70">
                "{t.text}"
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full text-base font-black text-white"
                  style={{ backgroundColor: t.initialsColor }}
                >
                  {t.avatar}
                </span>
                <div>
                  <p className="text-sm font-black text-burgundy-950">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-burgundy-900/40">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <ReviewsSection />
      </div>
    </section>
  )
}