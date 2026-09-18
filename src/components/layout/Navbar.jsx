import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingBag,
  User,
  ChevronDown,
  Truck,
  BadgePercent,
  ShieldCheck,
  Gift,
} from 'lucide-react'
import Logo from './Logo'
import CartDrawer from './CartDrawer'
import SearchOverlay from './SearchOverlay'
import { categories } from '../../data/categories'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'

const NAV_ROUTES = [
  { to: '/', label: 'الرئيسية' },
  { to: '/products', label: 'المتجر' },
  { to: '/offers', label: 'العروض' },
  { to: '/about', label: 'من نحن' },
  { to: '/contact', label: 'تواصل معنا' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const { totalItems } = useCart()
  const { wishlist } = useWishlist()
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const closeMenus = () => setMobileOpen(false)
    window.addEventListener('resize', closeMenus)
    return () => window.removeEventListener('resize', closeMenus)
  }, [])

  const navLinkClass = ({ isActive }) =>
    `relative py-2 text-sm font-bold transition-colors after:absolute after:right-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-burgundy-700 after:transition-all after:duration-300 ${
      isActive
        ? 'text-burgundy-700 after:w-full'
        : 'text-burgundy-900/70 hover:text-burgundy-900 after:w-0 hover:after:w-full'
    }`

  return (
    <header className="sticky top-0 z-40">
      {/* Announcement bar (collapses on scroll) */}
      <div
        className={`overflow-hidden bg-burgundy-800 transition-all duration-300 ${
          scrolled ? 'max-h-0 py-0 opacity-0' : 'max-h-12 py-2 opacity-100'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5">
            <Truck size={13} /> شحن مجاني للطلبات فوق 300 ج.م
          </span>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <BadgePercent size={13} /> خصم 10% على أول طلب بكود WELCOME10
          </span>
          <span className="hidden items-center gap-1.5 md:inline-flex">
            <ShieldCheck size={13} /> منتجات أصلية 100%
          </span>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className={`border-b border-vanilla-100 bg-cream-50/90 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled ? 'shadow-md shadow-burgundy-900/5' : ''
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:h-[72px] md:px-6">
          {/* Mobile menu button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-burgundy-950 hover:bg-burgundy-50 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="القائمة"
          >
            <Menu size={22} />
          </button>

          <Logo size={38} />

          {/* Desktop search + actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 items-center gap-2 rounded-full border border-vanilla-200 bg-white px-4 text-sm text-burgundy-900/40 transition-colors hover:border-burgundy-300 sm:flex md:w-56"
              aria-label="بحث"
            >
              <Search size={16} />
              <span className="truncate">ابحث عن منتجات...</span>
            </button>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-burgundy-950 hover:bg-burgundy-50 sm:hidden"
              onClick={() => setSearchOpen(true)}
              aria-label="بحث"
            >
              <Search size={20} />
            </button>

            <Link
              to="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-burgundy-950 transition-colors hover:bg-burgundy-50"
              aria-label="المفضلة"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy-700 px-1 text-[10px] font-black text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-burgundy-950 transition-colors hover:bg-burgundy-50"
              aria-label="سلة التسوق"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-vanilla-500 px-1 text-[10px] font-black text-white">
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              to={user ? '/dashboard' : '/login'}
              className="hidden h-10 items-center gap-2 rounded-full bg-burgundy-950 px-4 text-sm font-bold text-white transition-colors hover:bg-burgundy-800 md:flex"
            >
              <User size={16} />
              {user ? user.name.split(' ')[0] : 'دخول'}
            </Link>
          </div>
        </div>

        {/* Desktop category nav */}
        <div className="hidden border-t border-vanilla-100 bg-white/60 backdrop-blur lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-7 px-6">
            {NAV_ROUTES.map((r) => (
              <NavLink key={r.to} to={r.to} end={r.to === '/'} className={navLinkClass}>
                {r.label}
              </NavLink>
            ))}
            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1 py-2 text-sm font-bold text-burgundy-900/70 transition-colors hover:text-burgundy-700">
                <Gift size={15} />
                الأقسام
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${categoriesOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {categoriesOpen && (
                <div className="absolute right-1/2 top-full z-50 w-[560px] translate-x-1/2 animate-scale-in pt-2">
                  <div className="grid grid-cols-2 gap-2 rounded-3xl border border-vanilla-100 bg-white p-3 shadow-xl shadow-burgundy-900/10">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        to={`/category/${c.slug}`}
                        className="flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-cream-100"
                      >
                        <img
                          src={c.image}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                        <div>
                          <p className="text-sm font-black text-burgundy-950">
                            {c.name}
                          </p>
                          <p className="line-clamp-1 text-[11px] text-burgundy-900/40">
                            {c.tagline}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-burgundy-950/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-cream-50 shadow-2xl animate-slide-in-sheet">
            <div className="flex items-center justify-between border-b border-vanilla-200 p-4">
              <Logo size={32} showTagline={false} />
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-burgundy-50"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="mb-2 px-2 text-[11px] font-bold text-burgundy-900/40">
                القائمة الرئيسية
              </p>
              <nav className="space-y-0.5">
                {NAV_ROUTES.map((r) => (
                  <Link
                    key={r.to}
                    to={r.to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-3 py-3 text-base font-bold text-burgundy-950 transition-colors hover:bg-white"
                  >
                    {r.label}
                  </Link>
                ))}
              </nav>

              <p className="mb-2 mt-5 px-2 text-[11px] font-bold text-burgundy-900/40">
                الأقسام
              </p>
              <div className="space-y-0.5">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/category/${c.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white"
                  >
                    <img
                      src={c.image}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <span className="flex-1 text-sm font-bold text-burgundy-950">
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <Link
                  to={user ? '/dashboard' : '/login'}
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-full bg-burgundy-950 py-3 text-center text-sm font-bold text-white"
                >
                  {user ? 'لوحة التحكم' : 'تسجيل الدخول'}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-full border border-burgundy-700 py-3 text-center text-sm font-bold text-burgundy-700"
                >
                  حساب جديد
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Search overlay + cart drawer */}
      {searchOpen && <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  )
}

export { NAV_ROUTES }