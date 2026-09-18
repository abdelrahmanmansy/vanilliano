import { Link, useNavigate } from 'react-router-dom'
import { Home, ArrowRight } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      <div className="pointer-events-none absolute top-10 right-10 h-40 w-40 rounded-full bg-vanilla-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-40 w-40 rounded-full bg-burgundy-100/50 blur-3xl" />

      <p className="mb-6 animate-bounce text-[7rem] font-black leading-none text-burgundy-700 md:text-[10rem]">
        404
      </p>
      <h1 className="mb-3 text-3xl font-black text-burgundy-950">
        للأسف، هذه الصفحة غير موجودة
      </h1>
      <p className="mb-8 max-w-md text-sm text-burgundy-900/50">
        يبدو أنك وصلت إلى صفحة لا نعرفها في فانيليانو. لعل الكبكيك اللذيذ
        أضاع الطريق؟ دعنا نعيدك إلى المكان الصحيح.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={() => navigate(-1)} variant="secondary">
          <ArrowRight size={18} />
          الرجوع للخلف
        </Button>
        <Link to="/">
          <Button size="lg">
            <Home size={18} />
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  )
}