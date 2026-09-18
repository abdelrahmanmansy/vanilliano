import CountUp from './CountUp'
import { useInView } from '../../hooks/useInView'

const stats = [
  { value: 500, suffix: '+', label: 'منتج فاخر' },
  { value: 12000, suffix: '+', label: 'عميل سعيد' },
  { value: 25, suffix: '+', label: 'مدينة نوصل لها' },
  { value: 4.9, suffix: '★', label: 'تقييم العملاء', decimal: 1 },
]

export default function Stats() {
  const [ref, inView] = useInView(0.2)

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-burgundy-950 py-14"
    >
      <div className="pointer-events-none absolute -left-20 top-0 h-60 w-60 rounded-full bg-vanilla-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-60 w-60 rounded-full bg-burgundy-500/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 md:grid-cols-4 md:px-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-black text-vanilla-300 md:text-4xl">
              {inView ? (
                <CountUp end={s.value} duration={1600} decimal={s.decimal} />
              ) : (
                '0'
              )}
              <span className="text-white">{s.suffix}</span>
            </p>
            <p className="mt-2 text-sm font-bold text-cream-100/60">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}