import { Link } from 'react-router-dom'
import { Heart, Sparkles, Users, Leaf, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'
import { useInView } from '../hooks/useInView'
import { asset } from '../utils/asset'

export default function About() {
  const [visionRef, visionInView] = useInView(0.15)
  const [valuesRef, valuesInView] = useInView(0.1)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-burgundy-950">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-vanilla-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-burgundy-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center md:px-6 md:py-20">
          <div className="mb-6 flex justify-center">
            <div className="relative h-40 w-40 overflow-hidden rounded-3xl border-4 border-white/10 shadow-2xl">
              <img
                src={asset('/images/hero/story.jpg')}
                alt="شغفنا بالحلويات"
                className="h-full w-full object-cover transition-transform duration-500"
              />
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-black text-white md:text-5xl">
            قصتنا تبدأ من <span className="text-gradient">حب الحلويات</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-cream-100/70 md:text-base">
            فانيليانو وُلد من شغف صانعي الحلويات والحفلات أنفسهم. كنا نبحث
            باستمرار عن خامات فاخرة ومستلزمات أصلية، فقررنا أن نؤسس المتجر
            الذي نتمنّى أن نجده.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-vanilla-100 px-4 py-1 text-xs font-black text-burgundy-700">
              <Sparkles size={14} />
              من نحن
            </span>
            <h2 className="mb-4 text-2xl font-black text-burgundy-950 md:text-3xl">
              متجرٌ يليق بإبداعك
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-burgundy-900/60 md:text-base">
              منذ انطلاقتنا، نقدّم لعملائنا تشكيلة مختارة بعناية من خامات
              الكيك والكاندي ومستلزمات الحفلات والتغليف الهدايا، من أفضل
              الموردين حول العالم. نهتم بأدق التفاصيل: من جودة الخامة إلى
              وصولها إليك في تغليفٍ يحترم طلبك.
            </p>
            <p className="mb-6 text-sm leading-relaxed text-burgundy-900/60 md:text-base">
              اليوم، يثق بنا آلاف العملاء من صانعات الحلويات، منظمي
              الفعاليات، والمتاجر الصغيرة — ونحن نفخر بأن نكون جزءاً من أبهى
              احتفالاتهم.
            </p>
            <div className="mb-6 overflow-hidden rounded-3xl shadow-lg">
              <img
                src={asset('/images/hero/story2.jpg')}
                alt="كيكة فانيليانو الشهية"
                className="h-64 w-full object-cover"
              />
            </div>
            <Link to="/products">
              <Button icon={ArrowLeft} size="lg">
                اكتشف منتجاتنا
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-vanilla-50 p-6">
              <p className="text-3xl font-black text-burgundy-700">1</p>
              <p className="mt-1 text-sm font-bold text-burgundy-900/60">
                فرع دهشور – بدرشين، الجيزة
              </p>
            </div>
            <div className="rounded-3xl bg-burgundy-50 p-6">
              <p className="text-3xl font-black text-burgundy-700">100%</p>
              <p className="mt-1 text-sm font-bold text-burgundy-900/60">
                خامات أصلية ومضمونة
              </p>
            </div>
            <div className="rounded-3xl bg-cream-100 p-6">
              <p className="text-3xl font-black text-burgundy-700">24-48</p>
              <p className="mt-1 text-sm font-bold text-burgundy-900/60">
                ساعة توصيل داخل القاهرة والجيزة
              </p>
            </div>
            <div className="rounded-3xl bg-vanilla-100 p-6">
              <p className="text-3xl font-black text-burgundy-700">واتساب</p>
              <p className="mt-1 text-sm font-bold text-burgundy-900/60">
                دعم فوري واستشارات مجانية
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section
        ref={visionRef}
        className="bg-burgundy-950 py-16"
      >
        <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
          <span
            className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black text-vanilla-300 backdrop-blur ${
              visionInView ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            <Heart size={13} />
            رؤيتنا ورسالتنا
          </span>
          <h2
            className={`mt-4 text-2xl font-black text-white md:text-4xl ${
              visionInView ? 'animate-fade-in-up delay-100' : 'opacity-0'
            }`}
          >
            نحلم بعالمٍ تُصنع فيه أعذب الذكريات بلمسةٍ منك
          </h2>
          <p
            className={`mt-4 text-sm leading-relaxed text-cream-100/70 md:text-base ${
              visionInView ? 'animate-fade-in-up delay-200' : 'opacity-0'
            }`}
          >
            رؤيتنا أن نكون الرفيق الأول لكل من يصنع حلوى أو حفلة في المنطقة،
            بإلهامهم بمنتجات فاخرة، تجربة شراء مريحة، ودعم يسبق توقعاتهم.
          </p>
        </div>
      </section>

      {/* Values */}
      <section ref={valuesRef} className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="mb-10 text-center text-2xl font-black text-burgundy-950 md:text-3xl">
          قيمنا التي نؤمن بها
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Leaf,
              title: 'الأصالة والجودة',
              desc: 'نتحقق من كل مورد وكل شحنة لنضمن لك منتجات أصلية تدوم جودتها.',
            },
            {
              icon: Heart,
              title: 'حُب التفاصيل',
              desc: 'اهتمامنا بالتفاصيل ينعكس على تغليفنا وسرعة ردنا واختيارنا الدقيق.',
            },
            {
              icon: Users,
              title: 'شراكة طويلة الأمد',
              desc: 'معاملتنا لا تنتهي عند بيعة، بل تبدأ منها. عملاؤنا أصدقاؤنا.',
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className={`rounded-3xl border border-vanilla-100 bg-white p-7 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lg ${
                valuesInView ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-vanilla-100 text-burgundy-700">
                <Icon size={24} />
              </span>
              <h3 className="mb-2 text-base font-black text-burgundy-950">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-burgundy-900/60">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}