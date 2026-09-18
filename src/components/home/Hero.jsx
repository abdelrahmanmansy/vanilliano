import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, Truck } from 'lucide-react'
import Button from '../ui/Button'
import { asset } from '../../utils/asset'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-vanilla-50 via-cream-50 to-cream-50">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-vanilla-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-burgundy-200/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-vanilla-300/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-2 lg:py-24">
        {/* Copy */}
        <div className="text-center lg:text-right">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-vanilla-200 bg-white/80 px-4 py-1.5 text-xs font-black text-burgundy-700 shadow-sm backdrop-blur">
            <Sparkles size={14} className="text-vanilla-500" />
            وجهتك الأولى لخامات الحلويات والحفلات
          </span>

          <h1 className="mb-5 text-4xl font-black leading-[1.15] text-burgundy-950 md:text-5xl lg:text-6xl">
            اصنع حلويات
            <span className="text-gradient"> تُسحر الجميع</span>
            <br />
            واحتفالات لا تُنسى
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-burgundy-900/60 lg:mx-0 md:text-lg">
            في <strong className="text-burgundy-700">Vanilliano</strong> نقدم لك
            تشكيلة فاخرة من خامات الكيك، الكاندي، مستلزمات أعياد الميلاد
            والحفلات، وتحف التغليف والهدايا — كل ما يلهم أحلى إبداعاتك.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/products" className="w-full sm:w-auto">
              <Button size="lg" fullWidth icon={ArrowLeft} className="sm:w-auto">
                استكشف المتجر
              </Button>
            </Link>
            <Link to="/offers" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                fullWidth
                className="sm:w-auto"
              >
                شاهد العروض
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-burgundy-900/50 lg:justify-start">
            <span className="inline-flex items-center gap-1.5 font-bold">
              <Truck size={15} className="text-vanilla-600" />
              شحن سريع
            </span>
            <span className="h-3 w-px bg-burgundy-900/10" />
            <span className="inline-flex items-center gap-1.5 font-bold">
              ✓ منتجات أصلية
            </span>
            <span className="h-3 w-px bg-burgundy-900/10" />
            <span className="inline-flex items-center gap-1.5 font-bold">
              ✓ دعم 7 أيام
            </span>
          </div>
        </div>

        {/* Visual */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative rounded-[2.5rem] border border-white bg-gradient-to-br from-white/80 to-vanilla-100/60 p-4 shadow-2xl shadow-burgundy-900/10 backdrop-blur">
            <img
              src={asset('/images/categories/birthday.jpg')}
              alt="حفلات فانيليانو"
              className="illustration-float img-zoom rounded-[2rem] object-cover"
            />
            <div className="absolute -bottom-5 -right-3 animate-float rounded-2xl border border-white bg-white/95 px-5 py-3 shadow-xl backdrop-blur">
              <p className="text-2xl font-black text-burgundy-700">+500</p>
              <p className="text-[11px] font-bold text-burgundy-900/50">
                منتج وكلاء حفلات
              </p>
            </div>
            <div
              className="absolute -top-4 -left-3 animate-float rounded-2xl border border-white bg-white/95 px-5 py-3 shadow-xl backdrop-blur"
              style={{ animationDelay: '1.2s' }}
            >
              <p className="text-2xl font-black text-vanilla-600">4.9★</p>
              <p className="text-[11px] font-bold text-burgundy-900/50">
                تقييم عملائنا
              </p>
            </div>
            <div
              className="absolute -bottom-4 right-1/3 animate-float rounded-2xl border border-white bg-white/95 px-5 py-3 shadow-xl backdrop-blur"
              style={{ animationDelay: '2.4s' }}
            >
              <p className="text-2xl font-black text-burgundy-500">24h</p>
              <p className="text-[11px] font-bold text-burgundy-900/50">
                توصيل سريع
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}