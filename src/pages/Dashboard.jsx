import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Heart,
  LogOut,
  Star,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'
import { useWishlist } from '../context/WishlistContext'
import { useCatalog } from '../hooks/useCatalog'
import { formatPrice, formatDate } from '../utils/format'
import { STORAGE_KEYS } from '../utils/constants'
import { supabaseService } from '../services/supabase'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import RatingStars from '../components/ui/RatingStars'
import { toast } from 'react-hot-toast'

const tabs = [
  { id: 'overview', label: 'Ù†Ø¸Ø±Ø© Ø¹Ø§Ù…Ø©', icon: LayoutDashboard },
  { id: 'orders', label: 'Ø§Ù„Ø·Ù„Ø¨Ø§Øª', icon: ShoppingBag },
  { id: 'wishlist', label: 'Ø§Ù„Ù…ÙØ¶Ù„Ø©', icon: Heart },
  { id: 'settings', label: 'Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª', icon: Settings },
]

const DEMO_IDS = new Set(['VNL-991234', 'VNL-997643'])

const STATUS_TEXT = {
  'Ø¬Ø¯ÙŠØ¯': 'Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© ðŸ’™',
  'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„ØªØ£ÙƒÙŠØ¯': 'Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© ðŸ’™',
  'ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ø¯ÙØ¹': 'ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ø¯ÙØ¹Ø© âœ…',
  'Ù‚ÙŠØ¯ Ø§Ù„ØªØ¬Ù‡ÙŠØ²': 'Ø¨ÙŠØªØ¬Ù‡Ø² Ø­Ø§Ù„ÙŠØ§Ù‹ ðŸŽ',
  'ØªÙ… Ø§Ù„ØªØ³Ù„ÙŠÙ…': 'ØªÙ… Ø§Ù„ØªØ³Ù„ÙŠÙ… ðŸŽ‰',
  'Ù…Ù„ØºÙŠ': 'Ù…Ù„ØºÙŠ',
}

const statusText = (s) => STATUS_TEXT[s] || s || 'â€”'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { products } = useProducts()
  const { wishlist } = useWishlist()
  const [tab, setTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' })

  useEffect(() => {
    const stored = JSON.parse(
      window.localStorage.getItem(STORAGE_KEYS.orders) || '[]',
    )
    const local = (Array.isArray(stored) ? stored : []).filter(
      (o) => o && !DEMO_IDS.has(o.id),
    )
    setOrders(local)
    if (user?.email) {
      supabaseService.getMyOrders(user.email).then(({ data }) => {
        if (!Array.isArray(data)) return
        const merged = [
          ...local,
          ...data.filter((d) => !local.some((l) => l.id === d.id)),
        ]
        merged.sort(
          (a, b) =>
            new Date(b.created_at || b.date) - new Date(a.created_at || a.date),
        )
        setOrders(merged)
      })
    }
  }, [user?.email])

  const { getById } = useCatalog(products)
  const wishlistProducts = wishlist.map((id) => getById(id)).filter(Boolean)

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const bestProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, 5)

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-[2.5rem] border border-vanilla-100 bg-white p-10 shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-cream-100">
            <Heart size={28} className="text-burgundy-700" />
          </div>
          <h1 className="mb-2 text-2xl font-black text-burgundy-950">
            Ø³Ø¬Ù‘Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø£ÙˆÙ„Ø§Ù‹
          </h1>
          <p className="mb-6 text-sm text-burgundy-900/60">
            ØªØ­ØªØ§Ø¬ Ø¥Ù„Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ø­Ø³Ø§Ø¨Ùƒ ÙˆØ·Ù„Ø¨Ø§ØªÙƒ.
          </p>
          <Link to="/login">
            <Button size="lg">ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-burgundy-950">
            Ø£Ù‡Ù„Ø§Ù‹ØŒ {user.name} ðŸ‘‹
          </h1>
          <p className="mt-1 text-sm text-burgundy-900/50" dir="ltr">
            {user.email}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={logout}>
          <LogOut size={15} />
          Ø®Ø±ÙˆØ¬
        </Button>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all ${
              tab === id
                ? 'bg-burgundy-700 text-white shadow-lg shadow-burgundy-700/25'
                : 'bg-white text-burgundy-900/60 hover:bg-cream-100'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Ø§Ù„Ø·Ù„Ø¨Ø§Øª', value: orders.length, icon: ShoppingBag, color: 'from-burgundy-700 to-burgundy-500' },
              { label: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø´ØªØ±ÙŠØ§Øª', value: `${formatPrice(totalRevenue)} Ø¬.Ù…`, icon: Star, color: 'from-vanilla-600 to-vanilla-400' },
              { label: 'Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª ÙÙŠ Ø§Ù„Ù…ØªØ¬Ø±', value: products.length, icon: LayoutDashboard, color: 'from-emerald-600 to-emerald-400' },
              { label: 'Ø¹Ù†Ø§ØµØ± Ø§Ù„Ù…ÙØ¶Ù„Ø©', value: wishlist.length, icon: Heart, color: 'from-rose-500 to-rose-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-3xl border border-vanilla-100 bg-white p-5 shadow-sm">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white`}>
                  <Icon size={18} />
                </div>
                <p className="text-sm text-burgundy-900/50">{label}</p>
                <p className="text-xl font-black text-burgundy-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-black text-burgundy-950">
                Ø£Ø­Ø¯Ø« Ø·Ù„Ø¨Ø§ØªÙƒ
              </h2>
              {orders.length === 0 ? (
                <p className="text-sm text-burgundy-900/40">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø¨Ø¹Ø¯.</p>
              ) : (
                <>
                  {orders.slice(0, 4).some((o) => o.status === 'ØªÙ… Ø§Ù„ØªØ³Ù„ÙŠÙ…') && (
                    <p className="mb-3 rounded-2xl bg-emerald-50 p-3 text-center text-sm font-black text-emerald-700">
                      ðŸŽ‰ ÙŠØ§ Ù‡Ù„Ø§! Ø·Ù„Ø¨Ùƒ Ø§ØªÙˆØµÙ‘Ù„ Ø¨Ø³Ù„Ø§Ù… â€” Ù…ØªØ´ÙƒØ±ÙŠÙ† Ù„Ø«Ù‚ØªÙƒ ÙÙŠ ÙØ§Ù†ÙŠÙ„ÙŠØ§Ù†Ùˆ
                    </p>
                  )}
                  <ul className="space-y-3">
                    {orders.slice(0, 4).map((o) => (
                    <li key={o.id} className="flex items-center justify-between rounded-2xl bg-cream-50/60 p-3">
                      <div>
                        <p className="text-sm font-black text-burgundy-950" dir="ltr">
                          <Link
                            to={`/track?order=${o.id}`}
                            className="text-burgundy-700 hover:underline"
                          >
                            {o.id}
                          </Link>{' '}
                          <span className="text-[11px] font-bold text-burgundy-900/40">
                            ØªØ§Ø¨Ø¹
                          </span>
                        </p>
                        <p className="text-[11px] text-burgundy-900/40">
                          {formatDate(o.created_at || o.date)} Â· {o.shippingInfo?.name || ''}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-burgundy-900">
                          {formatPrice(o.total)} Ø¬.Ù…
                        </p>
                        <Badge>{statusText(o.status)}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
                </>
              )}
              <button
                onClick={() => setTab('orders')}
                className="mt-4 text-sm font-black text-burgundy-700 hover:underline"
              >
                Ø¹Ø±Ø¶ ÙƒÙ„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª â†
              </button>
            </div>

            <div className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-black text-burgundy-950">
                Ø§Ù„Ø£ÙØ¶Ù„ ØªÙ‚ÙŠÙŠÙ…Ø§Ù‹
              </h2>
              <ul className="space-y-3">
                {bestProducts.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-vanilla-100 text-xs font-black text-burgundy-700">
                      {i + 1}
                    </span>
                    <img src={p.image} alt="" className="h-10 w-10 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-black text-burgundy-950">{p.name}</p>
                      <RatingStars value={p.rating} size={12} />
                    </div>
                    <span className="text-sm font-black text-burgundy-900">
                      {formatPrice(p.price)} Ø¬.Ù…
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª"
              description="Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„ØªÙŠ ØªÙÙ†Ø´Ø£ Ù…Ù† ØµÙØ­Ø© Ø¥ØªÙ…Ø§Ù… Ø§Ù„Ø´Ø±Ø§Ø¡ Ø³ØªØ¸Ù‡Ø± Ù‡Ù†Ø§."
            />
          ) : (
            orders.map((o) => (
              <div key={o.id} className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-burgundy-950" dir="ltr">
                      Ø·Ù„Ø¨ Ø±Ù‚Ù… {o.id}
                    </p>
                    <p className="text-[11px] text-burgundy-900/40">
                      {formatDate(o.created_at || o.date)} Â· {o.payment_method || o.paymentMethod === 'instapay' ? 'Ø§Ù†Ø³ØªØ§ Ø¨Ø§ÙŠ' : o.payment_method || o.paymentMethod === 'vodafone' ? 'ÙÙˆØ¯Ø§ÙÙˆÙ† ÙƒØ§Ø´' : o.payment_method || o.paymentMethod === 'fawry' ? 'ÙÙˆØ¯Ø§ÙÙˆÙ† ÙƒØ§Ø´ / Ø§Ù†Ø³ØªØ§ Ø¨Ø§ÙŠ' : o.payment_method || o.paymentMethod === 'cod' ? 'Ø¹Ù†Ø¯ Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù…' : 'ÙˆØ§ØªØ³Ø§Ø¨'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-burgundy-900">
                      {formatPrice(o.total)} Ø¬.Ù…
                    </span>
                    <Badge>{statusText(o.status)}</Badge>
                  </div>
                  {o.status === 'ØªÙ… Ø§Ù„ØªØ³Ù„ÙŠÙ…' && (
                    <p className="basis-full rounded-2xl bg-emerald-50 p-3 text-center text-sm font-black text-emerald-700">
                      ðŸŽ‰ ÙŠØ§ Ù‡Ù„Ø§! Ø·Ù„Ø¨Ùƒ Ø§ØªÙˆØµÙ‘Ù„ Ø¨Ø³Ù„Ø§Ù… â€” Ù…ØªØ´ÙƒØ±ÙŠÙ† Ù„Ø«Ù‚ØªÙƒ ÙÙŠ ÙØ§Ù†ÙŠÙ„ÙŠØ§Ù†Ùˆ
                    </p>
                  )}
                </div>
                <ul className="space-y-2">
                  {o.items.map((item) => (
                    <li key={item.id || item.name} className="flex items-center gap-3">
                      {item.image ? (
                        <img src={item.image} alt="" className="h-10 w-10 rounded-xl object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-100 text-xs font-black text-burgundy-700">
                          {String(item.name || 'ØŸ').slice(0, 1)}
                        </span>
                      )}
                      <span className="flex-1 text-sm font-bold text-burgundy-950">
                        {item.name} <span className="text-xs text-burgundy-900/40">Ã— {item.quantity}</span>
                      </span>
                      <span className="text-sm font-black text-burgundy-900">
                        {formatPrice(item.price * item.quantity)} Ø¬.Ù…
                      </span>
                    </li>
                  ))}
                </ul>
                {o.status === 'ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ø¯ÙØ¹' && (
                  <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-xs font-bold leading-relaxed text-emerald-700">
                    ðŸŽ‰ Ø´ÙƒØ±Ø§Ù‹ Ù„Ø«Ù‚ØªÙƒ ÙÙŠ ÙØ§Ù†ÙŠÙ„ÙŠØ§Ù†Ùˆ! ÙˆØµÙ„ØªÙ†Ø§ Ø¯ÙØ¹ØªÙƒ ÙˆØ¨Ø¯Ø£Ù†Ø§ ØªØ¬Ù‡ÙŠØ² Ø·Ù„Ø¨Ùƒ ðŸŽ
                  </p>
                )}
                {o.shippingInfo && (
                  <p className="mt-3 border-t border-vanilla-50 pt-3 text-[11px] text-burgundy-900/40">
                    ðŸ“ Ø§Ù„ØªÙˆØµÙŠÙ„ Ø¥Ù„Ù‰: {o.shippingInfo.name} Â· {o.shippingInfo.city || 'â€”'} Â· {o.shippingInfo.address}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'wishlist' && (
        <div className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-black text-burgundy-950">
            Ø¹Ù†Ø§ØµØ±Ùƒ Ø§Ù„Ù…ÙØ¶Ù„Ø© ({wishlistProducts.length})
          </h2>
          {wishlistProducts.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¹Ù†Ø§ØµØ± Ù…ÙØ¶Ù„Ø©"
              description="Ø£Ø¶Ù Ù…Ù†ØªØ¬Ø§Øª Ø¥Ù„Ù‰ Ø§Ù„Ù…ÙØ¶Ù„Ø© Ù…Ù† ØµÙØ­Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlistProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-vanilla-100 p-3 hover:border-burgundy-200"
                >
                  <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-burgundy-950">{p.name}</p>
                    <p className="text-sm font-black text-burgundy-700">
                      {formatPrice(p.price)} Ø¬.Ù…
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'settings' && (
        <div className="rounded-3xl border border-vanilla-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-black text-burgundy-950">Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">Ø§Ù„Ø§Ø³Ù…</label>
              <input
                value={profile.name}
                onChange={(e) => setProfile((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-2xl border border-vanilla-200 bg-cream-50 px-4 py-3 text-sm font-bold outline-none focus:border-burgundy-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-burgundy-900">Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ</label>
              <input
                value={profile.email}
                onChange={(e) => setProfile((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-2xl border border-vanilla-200 bg-cream-50 px-4 py-3 text-sm font-bold outline-none focus:border-burgundy-400"
              />
            </div>
            <Button onClick={() => toast.success('ØªÙ… Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª')}>
              Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}