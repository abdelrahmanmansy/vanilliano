import { Truck, ShieldCheck, Headset, RefreshCcw } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'شحن سريع',
    desc: 'توصيل سريع داخل القاهرة والجيزة خلال 24-48 ساعة، وباقي المحافظات خلال 2-5 أيام.',
  },
  {
    icon: ShieldCheck,
    title: 'منتجات أصلية',
    desc: 'نستورد من موردين معتمدين حول العالم بجودة مضمونة 100%.',
  },
  {
    icon: RefreshCcw,
    title: 'إرجاع مرن',
    desc: 'استبدال أو إرجاع خلال 3 أيام عمل وبكل يسر.',
  },
  {
    icon: Headset,
    title: 'دعم فوري',
    desc: 'فريق خدمة عملاء جاهز على الواتساب طوال أيام الأسبوع.',
  },
]

export default function WhyUs() {
  return (
    <section className="border-y border-vanilla-100 bg-cream-100/60 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 md:px-6">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group flex items-start gap-4 rounded-3xl border border-transparent bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-vanilla-200 hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-vanilla-100 text-burgundy-700 transition-colors duration-300 group-hover:bg-burgundy-700 group-hover:text-white">
              <Icon size={22} />
            </span>
            <div>
              <h3 className="mb-1 text-sm font-black text-burgundy-950">
                {title}
              </h3>
              <p className="text-xs leading-relaxed text-burgundy-900/50">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}