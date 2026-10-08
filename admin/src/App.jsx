import { useEffect, useState } from 'react'
import { client, adminService } from './adminService'
import { categories as STATIC_CATEGORIES } from '../../src/data/categories'
import { calculateDiscount, formatPrice, digitsOnly } from '../../src/utils/format'
import { phoneToken } from '../../src/utils/token'
import { siteUrl } from '../../src/utils/asset'

const OWNER_EMAIL = 'abdelrahmanahmedmansy@gmail.com'

const ORDER_STATUSES = ['جديد', 'بانتظار التأكيد', 'تم استلام الدفع', 'قيد التجهيز', 'تم التسليم', 'ملغي']
const STOCK_OPTIONS = [
  { value: 'in', label: 'متوفر' },
  { value: 'limited', label: 'الكمية محدودة' },
  { value: 'out', label: 'غير متوفر' },
]
const BADGE_OPTIONS = [
  { value: '', label: 'بدون شارة' },
  { value: 'new', label: 'جديد' },
  { value: 'bestseller', label: 'الأكثر مبيعاً' },
  { value: 'offer', label: 'عرض' },
]

const KIND_LABELS = {
  purchase: 'شراء',
  login: 'دخول',
  logout: 'خروج',
  review: 'رأي',
  message: 'رسالة',
}

const SOURCE_LABELS = {
  wa: 'واتساب',
  ig: 'إنستغرام',
  fb: 'فيسبوك',
  search: 'بحث',
  site: 'مباشر',
  other: 'أخرى',
}
const sourceLabel = (code) => SOURCE_LABELS[code] || code || '—'
const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const deliveryChatMsg = (name) =>
  `وصل طلبك بالسلامة يا ${name} 💛\n` +
  `طلبك وصل بمواعيده وكله تمام. 🧁🎈\n` +
  `نشكرك من القلب على ثقتك في فانيليانو، ونتمنى أن يحوز طلبك على كامل رضاك.\n` +
  `شكراً لذوقك الغالي، وبنستناك في كل طلب… لأن أحلى التجارب بتتكرر دايماً مع فانيليانو 💛`

const omKey = (orderId) => `vanilliano_om_${orderId}`

const readLocalChat = (orderId) => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(omKey(orderId)) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

const writeLocalChat = (orderId, list) => {
  try {
    window.localStorage.setItem(omKey(orderId), JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

const byDate = (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)

const assetURL = (src) => {
  if (!src || typeof src !== 'string') return src
  const base = import.meta.env.BASE_URL || '/'
  if (src.startsWith('http') || src.startsWith(base) || src.startsWith('/vanilliano/')) return src
  if (src.startsWith('/')) return base.replace(/\/$/, '') + src
  return src
}

function Flash({ msg }) {
  if (!msg) return null
  return (
    <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
      {msg}
    </div>
  )
}

const emptyProduct = {
  id: '',
  name: '',
  category: 'baking',
  price: '',
  oldPrice: '',
  discount: 0,
  stock: 'in',
  qty: '',
  badge: '',
  image: '',
  description: '',
}

function Stars({ n = 5 }) {
  return (
    <span style={{ color: 'var(--gold)', letterSpacing: 2, fontSize: 13 }}>
      {'★'.repeat(n)}
      <span style={{ color: '#ddd' }}>{'★'.repeat(5 - n)}</span>
    </span>
  )
}

export default function AdminApp() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    client.auth.getSession().then(({ data }) => {
      const u = data.session?.user
      setUser(u && u.email === OWNER_EMAIL ? u : null)
      if (u && u.email !== OWNER_EMAIL) client.auth.signOut()
    })
  }, [])

  if (user === undefined) {
    return (
      <div className="login">
        <div className="box">
          <p style={{ textAlign: 'center', color: 'var(--muted)' }}>جارٍ التحقق من الجلسة…</p>
        </div>
      </div>
    )
  }

  return user ? (
    <Shell user={user} onLogout={() => { client.auth.signOut(); setUser(null) }} />
  ) : (
    <Login onLogin={setUser} />
  )
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
      if (data.user.email !== OWNER_EMAIL) {
        await client.auth.signOut()
        throw new Error('هذا الحساب ليس حساب صاحب المتجر')
      }
      onLogin(data.user)
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <form className="box" onSubmit={submit}>
        <h1>لوحة إدارة فانيليانو</h1>
        <p className="sub muted">لوحة التحكم في متجر فانيليانو — تقدر تعدّل من هنا فوراً</p>
        {err && <div className="err">{err}</div>}
        <div className="field">
          <label>البريد الإلكتروني</label>
          <input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@email.com" required />
        </div>
        <div className="field">
          <label>كلمة المرور</label>
          <input type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <button className="btn primary" disabled={busy}>
          {busy ? 'جارٍ الدخول…' : 'تسجيل الدخول'}
        </button>
      </form>
    </div>
  )
}

function Shell({ user, onLogout }) {
  const [tab, setTab] = useState('overview')
  const [highlightId, setHighlightId] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const openOrder = (id) => {
    setHighlightId(id)
    setTab('orders')
  }

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('order')
    if (q) {
      setHighlightId(q)
      setTab('orders')
    }
  }, [])

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'products', label: 'المنتجات', icon: '🧁' },
    { id: 'categories', label: 'الأقسام', icon: '🗂️' },
    { id: 'discounts', label: 'الخصومات', icon: '🏷️' },
    { id: 'announcement', label: 'الإعلانات', icon: '📣' },
    { id: 'bestsellers', label: 'الأكثر مبيعاً', icon: '🏆' },
    { id: 'orders', label: 'الطلبات', icon: '🛒' },
    { id: 'reviews', label: 'آراء العملاء', icon: '⭐' },
    { id: 'messages', label: 'الرسائل', icon: '✉️' },
    { id: 'activity', label: 'النشاط', icon: '🕓' },
  ]

  return (
    <div className="app">
      <header className="mobile-bar">
        <div className="brand">
          فانيليانو
          <span>لوحة الإدارة</span>
        </div>
        <button
          className="hamburger"
          aria-label="القائمة"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="ham-line" />
          <span className="ham-line" />
          <span className="ham-line" />
        </button>
      </header>

      {menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} />}

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          فانيليانو
          <span>لوحة الإدارة</span>
        </div>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => {
              setTab(t.id)
              setMenuOpen(false)
            }}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
        <div className="footer">
          <div style={{ marginBottom: 8, fontSize: 11 }}>{user.email}</div>
          <button onClick={onLogout} style={{ justifyContent: 'center', background: 'rgba(255,255,255,.1)', width: '100%' }}>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="main">
        {tab === 'overview' && <Overview onOpenOrder={openOrder} />}
        {tab === 'products' && <Products />}
        {tab === 'categories' && <Categories />}
        {tab === 'discounts' && <Discounts />}
        {tab === 'announcement' && <AnnouncementEditor />}
        {tab === 'bestsellers' && <BestSellers />}
        {tab === 'orders' && <Orders highlightId={highlightId} />}
        {tab === 'reviews' && <Reviews />}
        {tab === 'messages' && <Messages />}
        {tab === 'activity' && <Activity />}
      </main>
    </div>
  )
}

function useLoad(loader) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      setData(await loader())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, error, refresh }
}

function Loading() {
  return <div className="empty">جارٍ التحميل…</div>
}

function ErrorBox({ error }) {
  if (!error) return null
  return <div className="err" style={{ color: 'var(--red)' }}>{error}</div>
}

function CleanupNoticeBanner() {
  const [notice, setNotice] = useState(null)
  const [ownerPhone, setOwnerPhone] = useState('')
  const [phoneDraft, setPhoneDraft] = useState('')
  const [askPhone, setAskPhone] = useState(false)
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([adminService.getCleanupNotices(), adminService.getStoreSettings()])
      .then(([notices, settings]) => {
        if (!alive) return
        const latest = Array.isArray(notices) ? notices[0] : null
        const phone = (settings || []).find((s) => s.key === 'owner_phone')?.value
        if (latest && !latest.seen) setNotice(latest)
        if (phone) setOwnerPhone(String(phone))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  if (!notice) return null

  const waMessage = () =>
    `🔔 *تنبيه التنظيف التلقائي — سجل النشاط*\n` +
    `تم حذف *${notice.batch_count} حدث* أقدم من 90 يوم (قبل ${notice.batch_date}).\n` +
    `اللي فاضل كله حديث. أي حاجة مهمة كنت محتاج تحتفظ بيها لازم تتخزن في أقل من 90 يوم.`

  const openWa = (phone, popup) => {
    const url = `https://wa.me/2${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(waMessage())}`
    if (popup) {
      popup.location = url
      popup.focus()
    } else {
      window.open(url, '_blank')
    }
  }

  const sendWhatsApp = () => {
    if (!ownerPhone) {
      setAskPhone(true)
      return
    }
    openWa(ownerPhone, window.open('', '_blank'))
  }

  const savePhoneAndSend = async () => {
    const phone = phoneDraft.replace(/\D/g, '')
    if (phone.length < 8) return
    const popup = window.open('', '_blank')
    setBusy(true)
    try {
      await adminService.setStoreSetting('owner_phone', phone)
      setOwnerPhone(phone)
      setAskPhone(false)
      openWa(phone, popup)
    } catch (e) {
      if (popup) popup.close()
      setFlash('تعذر حفظ الرقم: ' + e.message)
      setTimeout(() => setFlash(''), 4000)
    } finally {
      setBusy(false)
    }
  }

  const hide = async () => {
    try {
      await adminService.markCleanupNoticeSeen(notice.id)
    } catch {
      /* تجاهل */
    }
    setNotice(null)
  }

  return (
    <div
      className="card"
      style={{
        border: '1px solid var(--line)',
        background: 'var(--cream)',
        boxShadow: 'none',
      }}
    >
      <div className="space mb" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="row" style={{ gap: 8, flex: 1, alignItems: 'center' }}>
          <span style={{ fontSize: 22 }}>🧹</span>
          <div>
            <div className="bold" style={{ fontSize: 14 }}>
              تم التنظيف التلقائي لسجل النشاط
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              اتشال <b style={{ color: 'var(--burgundy)' }}>{notice.batch_count} حدث</b> أقدم من 90 يوم
              ({notice.batch_date}). دي رسالة تعريفية تلقائية قبل الحذف.
            </div>
          </div>
        </div>

        {askPhone && (
          <div className="row" style={{ gap: 6, width: '100%', flexWrap: 'wrap' }}>
            <input
              dir="ltr"
              inputMode="numeric"
              placeholder="01xxxxxxxxx"
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              style={{ flex: 1, minWidth: 180 }}
            />
            <button className="btn primary small" onClick={savePhoneAndSend} disabled={busy}>
              حفظ الرقم وإرسال
            </button>
          </div>
        )}

        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          <button className="btn primary small" onClick={sendWhatsApp} disabled={busy}>
            📲 إرسال التنبيه على واتساب
          </button>
          <button className="btn small" onClick={hide} disabled={busy}>
            إخفاء
          </button>
          {flash && (
            <span style={{ color: 'var(--red)', fontSize: 12 }}>{flash}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function Overview({ onOpenOrder }) {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [messages, setMessages] = useState([])
  const [activity, setActivity] = useState([])
  const [vipList, setVipList] = useState([])
  const [showTopEmail, setShowTopEmail] = useState(false)
  const [vipFlash, setVipFlash] = useState('')
  const [vipPctInput, setVipPctInput] = useState('')

  useEffect(() => {
    Promise.all([
      adminService.getProducts(),
      adminService.getOrders(),
      adminService.getReviews(),
      adminService.getMessages(),
      adminService.getActivity(),
      adminService.getStoreSettings(),
    ])
      .then(([p, o, r, m, a, s]) => {
        setProducts(p)
        setOrders(o)
        setReviews(r)
        setMessages(m)
        setActivity(a)
        const vipRow = Array.isArray(s) ? s.find((row) => row.key === 'vip_customers') : null
        setVipList(Array.isArray(vipRow?.value) ? vipRow.value : [])
      })
      .catch(() => {})
  }, [])

  function notifyVip(msg) {
    setVipFlash(msg)
    clearTimeout(window.__adminVipTimer)
    window.__adminVipTimer = setTimeout(() => setVipFlash(''), 4500)
  }

  const pendingReviews = reviews.filter((r) => !r.approved).length
  const unreadMessages = messages.filter((m) => !m.replied).length
  const newOrders = orders.filter((o) => o.status === 'جديد' || o.status === 'قيد التجهيز').length
  const totalSales = orders
    .filter((o) => o.status === 'تم التسليم')
    .reduce((s, o) => s + Number(o.total || 0), 0)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  const monthSales = orders
    .filter((o) => {
      const d = new Date(o.created_at)
      return (
        (o.status === 'تم التسليم' || o.status === 'تم استلام الدفع') &&
        !Number.isNaN(d.getTime()) &&
        d >= monthStart &&
        d <= monthEnd
      )
    })
    .reduce((s, o) => s + Number(o.total || 0), 0)

  const stats = [
    { lbl: 'المنتجات', num: products.length },
    { lbl: 'طلبات جديدة/قيد التجهيز', num: newOrders },
    { lbl: 'مبيعات مؤكدة (ج.م)', num: formatPrice(totalSales) },
    {
      lbl: `مبيعات الشهر (${monthStart.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} → ${monthEnd.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}) ج.م`,
      num: formatPrice(monthSales),
    },
    { lbl: 'آراء بانتظار الموافقة', num: pendingReviews },
    { lbl: 'رسائل بلا رد', num: unreadMessages },
    { lbl: 'عمليات دخول/خروج مسجلة', num: activity.filter((a) => a.kind === 'login' || a.kind === 'logout').length },
  ]

  const byEmail = new Map()
  orders.forEach((o) => {
    const email = String(o.email || '').trim().toLowerCase()
    if (!email || o.status === 'ملغي') return
    const cur = byEmail.get(email) || {
      email: String(o.email).trim(),
      name: '',
      phone: '',
      orders: 0,
      spent: 0,
    }
    cur.orders += 1
    cur.spent += Number(o.total || 0)
    if (!cur.name && o.name) cur.name = String(o.name)
    if (!cur.phone && o.phone) cur.phone = String(o.phone)
    byEmail.set(email, cur)
  })
  const topCustomer =
    [...byEmail.values()].sort((a, b) => b.spent - a.spent)[0] || null
  const vipNow = topCustomer
    ? vipList.find(
        (v) => v && v.email && String(v.email).toLowerCase() === topCustomer.email.toLowerCase(),
      ) || null
    : null

  const saveVip = async (patch) => {
    if (!topCustomer) return
    const next = vipList.map((v) => ({ ...v }))
    const i = next.findIndex(
      (v) => String(v?.email || '').toLowerCase() === topCustomer.email.toLowerCase(),
    )
    const base = i >= 0 ? next[i] : { email: topCustomer.email }
    const merged = { ...base, ...patch }
    const hasPerk = Boolean(merged.freeShipping) || Number(merged.discount) > 0
    if (i >= 0) {
      if (hasPerk) next[i] = merged
      else next.splice(i, 1)
    } else if (hasPerk) {
      next.push(merged)
    }
    try {
      await adminService.setStoreSetting('vip_customers', next)
      setVipList(next)
      notifyVip(hasPerk ? 'تم تفعيل ميزة العميل المميز ✓' : 'تم إلغاء مزايا العميل المميز')
    } catch (e) {
      notifyVip('تعذر الحفظ: ' + e.message)
    }
  }

  return (
    <>
      <h1>نظرة عامة</h1>
      <p className="sub">ملخص نشاط المتجر الآن</p>

      <CleanupNoticeBanner />

      <div className="stats mb">
        {stats.map((s) => (
          <div className="stat" key={s.lbl}>
            <div className="lbl">{s.lbl}</div>
            <div className="num">{s.num}</div>
          </div>
        ))}
      </div>

      {topCustomer && (
        <div
          className="card mb"
          style={{ border: '1px solid #e8c98d', background: 'linear-gradient(135deg, #fffaf0, #fdf1dc)' }}
        >
          <div className="space mb">
            <div>
              <h2>⭐ العميل المميز</h2>
              <p className="sub">الأعلى إنفاقًا من العملاء المسجّلين بريدهم</p>
            </div>
            {vipFlash && (
              <span style={{ color: '#15803d', fontSize: 12, fontWeight: 800 }}>{vipFlash}</span>
            )}
          </div>
          <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div className="bold" style={{ fontSize: 16 }}>
                {topCustomer.name || '—'}
              </div>
              <div className="muted">
                {formatPrice(topCustomer.orders)} طلب · {formatPrice(topCustomer.spent)} ج.م إجمالي الإنفاق
              </div>
            </div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {showTopEmail ? (
                <a href={`mailto:${topCustomer.email}`} dir="ltr" className="bold" title="راسله بالبريد">
                  {topCustomer.email}
                </a>
              ) : (
                <button className="btn small" onClick={() => setShowTopEmail(true)}>
                  👤 اضغط لعرض البريد
                </button>
              )}
              <button
                className="btn small"
                onClick={() => {
                  navigator.clipboard?.writeText(topCustomer.email)
                  notifyVip('تم نسخ البريد ✓')
                }}
              >
                نسخ البريد
              </button>
              {topCustomer.phone && (
                <a
                  className="btn small"
                  href={`https://wa.me/2${String(topCustomer.phone).replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  title="راسله على واتساب"
                >
                  💬 واتساب
                </a>
              )}
            </div>
          </div>
          <div className="row" style={{ marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
            <button
              className={`btn small ${vipNow?.freeShipping ? 'primary' : ''}`}
              onClick={() =>
                saveVip({
                  freeShipping: !vipNow?.freeShipping,
                  discount: Number(vipNow?.discount) || 0,
                })
              }
            >
              {vipNow?.freeShipping ? '✓ شحن مجاني مُفعّل' : '🚚 منح شحن مجاني'}
            </button>
            <div className="row" style={{ gap: 6 }}>
              <input
                type="number"
                min="1"
                max="90"
                placeholder="%"
                value={vipPctInput}
                onChange={(e) => setVipPctInput(e.target.value)}
                style={{ width: 64 }}
              />
              <button
                className="btn small"
                onClick={() => {
                  const pct = Number(vipPctInput)
                  if (!(pct > 0)) {
                    notifyVip('اكتب نسبة الخصم الأول')
                    return
                  }
                  saveVip({
                    freeShipping: Boolean(vipNow?.freeShipping),
                    discount: Math.min(90, Math.round(pct)),
                  })
                }}
              >
                منح خصم %
              </button>
              {Number(vipNow?.discount) > 0 && (
                <button
                  className="btn small"
                  onClick={() =>
                    saveVip({
                      freeShipping: Boolean(vipNow?.freeShipping),
                      discount: 0,
                    })
                  }
                >
                  إلغاء الخصم ({vipNow.discount}%)
                </button>
              )}
            </div>
          </div>
          {vipNow && (
            <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>
              الميزة تُطبَّق تلقائيًا في صفحة إتمام الشراء بمجرد كتابة بريد العميل — يظهر
              سطر «عميل مميز» في الملخص وفي رسالة الواتساب.
            </p>
          )}
        </div>
      )}

      <div className="card">
        <div className="space mb">
          <h2>آخر الطلبات</h2>
          <span className="muted">{orders.length} طلب</span>
        </div>
        {orders.length === 0 ? (
          <div className="empty">لا توجد طلبات بعد</div>
        ) : (
          <table>
            <thead>
              <tr><th>رقم الطلب</th><th>الاسم</th><th>الجوال</th><th>الإجمالي</th><th>الحالة</th><th>التاريخ</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id}>
                  <td className="bold">
                    <button className="btn-link" onClick={() => onOpenOrder?.(o.id)}>
                      {o.id}
                    </button>
                  </td>
                  <td>{o.name}</td>
                  <td dir="ltr">
                    <a
                      href={`https://wa.me/2${String(o.phone || '').replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      title="افتح واتساب"
                      style={{ color: 'inherit' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {o.phone}
                    </a>
                  </td>
                  <td className="bold">{formatPrice(o.total)} ج.م</td>
                  <td><span className={`badge ${o.status === 'تم التسليم' || o.status === 'تم استلام الدفع' ? 'green' : o.status === 'ملغي' ? 'red' : 'gold'}`}>{o.status}</span></td>
                  <td className="muted">{fmtDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="space mb">
          <h2>آخر النشاط</h2>
          <span className="muted">{activity.length} حدث</span>
        </div>
        {activity.length === 0 ? (
          <div className="empty">لا يوجد نشاط بعد</div>
        ) : (
          <table>
            <thead>
              <tr><th>النوع</th><th>الحدث</th><th>الوقت</th></tr>
            </thead>
            <tbody>
              {activity.slice(0, 8).map((a) => (
                <tr key={a.id}>
                  <td><span className="badge gray">{KIND_LABELS[a.kind] || a.kind}</span></td>
                  <td>{a.label}</td>
                  <td className="muted">{fmtDate(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

function Products() {
  const { data: products, loading, error, refresh } = useLoad(() => adminService.getProducts())
  const { data: catList } = useLoad(() => adminService.getCategories())
  const CATEGORIES = catList && catList.length ? catList : STATIC_CATEGORIES
  const [editing, setEditing] = useState(null)
  const [flash, setFlash] = useState('')
  const [query, setQuery] = useState('')

  const filtered = (products || []).filter((p) => {
    if (!query.trim()) return true
    const q = query.trim().toLowerCase()
    const cat = CATEGORIES.find((c) => c.id === p.category)?.name || ''
    return (
      (p.name || '').toLowerCase().includes(q) ||
      cat.toLowerCase().includes(q) ||
      (p.id || '').toLowerCase().includes(q)
    )
  })

  function notify(msg) {
    setFlash(msg)
    clearTimeout(window.__adminFlashTimer)
    window.__adminFlashTimer = setTimeout(() => setFlash(''), 4000)
  }

  useEffect(() => {
    if (!editing) return
    const onKey = (e) => { if (e.key === 'Escape') setEditing(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing])

  async function save(product) {
    try {
      await adminService.upsertProduct(product)
      setEditing(null)
      await refresh()
      notify(product.id ? 'تم حفظ التعديلات وظهرت في المتجر ✓' : 'تمت إضافة المنتج الجديد وظهر في المتجر ✓')
    } catch (e) {
      notify('تعذر الحفظ: ' + e.message)
    }
  }

  async function remove(id) {
    if (!confirm('هل أنت متأكد من حذف المنتج؟')) return
    try {
      await adminService.deleteProduct(id)
      await refresh()
      notify('تم حذف المنتج ✓')
    } catch (e) {
      notify('تعذر الحذف: ' + e.message)
    }
  }

  return (
    <>
      <div className="space mb">
        <div>
          <h1>المنتجات</h1>
          <p className="sub">أضف، عدّل، أو احذف منتجات وعروض المتجر</p>
        </div>
        <button className="btn primary" onClick={() => setEditing({ ...emptyProduct })}>+ منتج جديد</button>
      </div>

      <Flash msg={flash} />
      <ErrorBox error={error} />
      <div className="card mb">
        <input
          placeholder="ابحث باسم المنتج أو القسم…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px', fontSize: 14 }}
        />
        <div className="muted mt">{filtered.length} منتج من أصل {products?.length || 0}</div>
      </div>
      {editing && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null) }}
        >
          <ProductForm
            key={editing.id || 'new'}
            product={editing}
            categories={CATEGORIES}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="card">
        {loading ? (
          <Loading />
        ) : (
          <table>
            <thead>
              <tr><th>الصورة</th><th>الاسم</th><th>القسم</th><th>السعر</th><th>القديم</th><th>الخصم</th><th>الكمية</th><th>المخزون</th><th>شارة</th><th></th></tr>
            </thead>
            <tbody>
              {(filtered || []).map((p) => {
                const cat = CATEGORIES.find((c) => c.id === p.category)
                const disc = calculateDiscount(p.price, p.oldPrice)
                return (
                  <tr key={p.id}>
                    <td>{p.image ? <img src={assetURL(p.image)} alt="" /> : '—'}</td>
                    <td className="bold">{p.name}</td>
                    <td>{cat ? cat.name : p.category}</td>
                    <td className="bold">{formatPrice(p.price)}</td>
                    <td className="muted">{p.oldPrice ? formatPrice(p.oldPrice) : '—'}</td>
                    <td>{(p.discount || disc) > 0 ? <span className="badge red">خصم {(p.discount || disc)}%</span> : '—'}</td>
                    <td>
                      <span className={`badge ${p.qty === 0 ? 'red' : (p.qty != null && p.qty <= 5) ? 'gold' : 'green'}`}>
                        {p.qty ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.stock === 'out' || p.qty === 0 ? 'red' : p.stock === 'limited' ? 'gold' : 'green'}`}>
                        {p.stock === 'out' || p.qty === 0 ? 'غير متوفر' : p.stock === 'limited' ? 'محدود' : 'متوفر'}
                      </span>
                    </td>
                    <td>{p.badge ? <span className="badge gray">{BADGE_OPTIONS.find((b) => b.value === p.badge)?.label || p.badge}</span> : '—'}</td>
                    <td>
                      <div className="row">
                        <button className="btn small" onClick={() => setEditing({ ...emptyProduct, ...p })}>تعديل</button>
                        <button className="btn small red" onClick={() => remove(p.id)}>حذف</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

function ProductForm({ product, categories = STATIC_CATEGORIES, onSave, onCancel }) {
  const [form, setForm] = useState(product)
  const [busy, setBusy] = useState(false)

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const price = Number(form.price)
      const oldPrice = form.oldPrice ? Number(form.oldPrice) : null
      const manualDiscount = form.discount === '' || form.discount === undefined || form.discount === null ? 0 : Math.max(0, Math.min(100, Math.floor(Number(form.discount))))
      const autoDiscount = calculateDiscount(price, oldPrice)
      const discount = autoDiscount > 0 ? autoDiscount : manualDiscount
      const qty = form.qty === '' || form.qty === undefined || form.qty === null
        ? null
        : Math.max(0, Math.floor(Number(form.qty)))
      await onSave({ ...form, id: form.id || `p${Date.now()}`, price, oldPrice, discount, qty, rating: form.rating || 5, reviews: form.reviews || 0, highlights: form.highlights || [] })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card modal-form" onSubmit={submit}>
      <div className="space mb">
        <h2>{product.id ? 'تعديل منتج' : 'منتج جديد'}</h2>
        <button type="button" className="btn small" onClick={onCancel}>إلغاء</button>
      </div>
      <div className="grid2">
        <div className="field">
          <label>اسم المنتج</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="field">
          <label>القسم</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>السعر (ج.م)</label>
          <input type="number" min="0" step="0.5" value={form.price} onChange={(e) => set('price', e.target.value)} required />
        </div>
        <div className="field">
          <label>السعر القديم (اختياري — يظهر كخصم)</label>
          <input type="number" min="0" step="0.5" value={form.oldPrice} onChange={(e) => set('oldPrice', e.target.value)} />
        </div>
        <div className="field">
          <label>الخصم % (اختياري)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            inputMode="numeric"
            value={form.discount ?? ''}
            onChange={(e) => set('discount', e.target.value)}
            placeholder="مثال: 20"
          />
          <span className="muted" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
            لو حددت نسبة الخصم هتظهر كبطاقة خصم على المنتج مباشرةً
          </span>
        </div>
        <div className="field">
          <label>المخزون</label>
          <select value={form.stock} onChange={(e) => set('stock', e.target.value)}>
            {STOCK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>الكمية المتوفرة (قطعة)</label>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={form.qty ?? ''}
            onChange={(e) => set('qty', e.target.value)}
            placeholder="مثال: 50"
          />
          <span className="muted" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
            العميل مش هيقدر يطلب أكتر من الرقم ده — و 0 = غير متوفر
          </span>
        </div>
        <div className="field">
          <label>الشارة</label>
          <select value={form.badge} onChange={(e) => set('badge', e.target.value)}>
            {BADGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label>رابط الصورة (مثال: /images/products/x.jpg)</label>
        <input dir="ltr" value={form.image} onChange={(e) => set('image', e.target.value)} />
      </div>
      <div className="field">
        <label>الوصف</label>
        <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="row">
        <button className="btn primary" disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ المنتج'}</button>
        <button type="button" className="btn" onClick={onCancel}>إلغاء</button>
      </div>
    </form>
  )
}

const emptyCategory = {
  id: '',
  slug: '',
  name: '',
  tagline: '',
  description: '',
  icon: 'Sparkles',
  image: '',
  color: '#db8c33',
  sort_order: 0,
}

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

function Categories() {
  const { data: categories, loading, error, refresh } = useLoad(() => adminService.getCategories())
  const { data: products } = useLoad(() => adminService.getProducts())
  const [editing, setEditing] = useState(null)
  const [flash, setFlash] = useState('')

  function notify(msg) {
    setFlash(msg)
    clearTimeout(window.__adminCatTimer)
    window.__adminCatTimer = setTimeout(() => setFlash(''), 4500)
  }

  useEffect(() => {
    if (!editing) return
    const onKey = (e) => { if (e.key === 'Escape') setEditing(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editing])

  const countIn = (id) => (products || []).filter((p) => p.category === id).length

  async function save(category) {
    try {
      await adminService.upsertCategory(category)
      setEditing(null)
      await refresh()
      notify(category.id ? 'تم حفظ تعديلات القسم ✓' : 'تمت إضافة القسم الجديد وظهر في المتجر ✓')
    } catch (e) {
      notify('تعذر الحفظ: ' + e.message)
    }
  }

  async function remove(cat) {
    const count = countIn(cat.id)
    if (count > 0) {
      notify(`القسم ده فيه ${count} منتج — انقلهم لقسم تاني الأول`)
      return
    }
    if (!confirm(`هل أنت متأكد من حذف قسم «${cat.name}»؟`)) return
    try {
      await adminService.deleteCategory(cat.id)
      await refresh()
      notify('تم حذف القسم ✓')
    } catch (e) {
      notify('تعذر الحذف: ' + e.message)
    }
  }

  return (
    <>
      <div className="space mb">
        <div>
          <h1>الأقسام</h1>
          <p className="sub">عدّل أسماء وصور الأقسام أو أضف أقساماً جديدة — بتظهر في الموقع فوراً</p>
        </div>
        <button className="btn primary" onClick={() => setEditing({ ...emptyCategory })}>+ قسم جديد</button>
      </div>

      <Flash msg={flash} />
      <ErrorBox error={error} />

      {editing && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null) }}
        >
          <CategoryForm
            key={editing.id || 'new'}
            category={editing}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="card">
        {loading ? (
          <Loading />
        ) : !categories || categories.length === 0 ? (
          <div className="empty">لا توجد أقسام بعد — اضغط «+ قسم جديد»</div>
        ) : (
          <table>
            <thead>
              <tr><th>الصورة</th><th>الاسم</th><th>الرابط</th><th>اللون</th><th>المنتجات</th><th>الترتيب</th><th></th></tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.image
                      ? <img src={assetURL(c.image)} alt="" style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 8 }} />
                      : '—'}
                  </td>
                  <td className="bold">{c.name}</td>
                  <td dir="ltr" className="muted">/category/{c.slug}</td>
                  <td>
                    <span className="badge gray" style={{ background: c.color, color: '#fff' }}>{c.color}</span>
                  </td>
                  <td>{countIn(c.id)}</td>
                  <td>{c.sort_order}</td>
                  <td>
                    <div className="row">
                      <button className="btn small" onClick={() => setEditing({ ...emptyCategory, ...c })}>تعديل</button>
                      <button className="btn small red" onClick={() => remove(c)}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

function CategoryForm({ category, onSave, onCancel }) {
  const [form, setForm] = useState(category)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(category.image || '')
  const [err, setErr] = useState('')

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function pickFile(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setErr('الملف لازم يكون صورة')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setErr('حجم الصورة أكبر من 5 ميجا')
      return
    }
    setErr('')
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result))
    reader.readAsDataURL(f)
  }

  async function submit(e) {
    e.preventDefault()
    setErr('')
    const slug = slugify(form.slug || form.name)
    if (!form.name.trim()) {
      setErr('اكتب اسم القسم')
      return
    }
    if (!slug) {
      setErr('اكتب رابط القسم (Slug)')
      return
    }
    const id = form.id || slug
    setBusy(true)
    try {
      let image = form.image || ''
      if (file) {
        setUploading(true)
        image = await adminService.uploadCategoryImage(file, id)
      }
      await onSave({
        ...form,
        id,
        slug,
        image,
        sort_order: Number(form.sort_order) || 0,
        tagline: form.tagline || '',
        description: form.description || '',
      })
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
      setUploading(false)
    }
  }

  async function clearImage() {
    if (form.image && form.image.startsWith('http')) {
      await adminService.deleteCategoryImage(form.image).catch(() => {})
    }
    setForm((f) => ({ ...f, image: '' }))
    setPreview('')
    setFile(null)
  }

  return (
    <form className="card modal-form" onSubmit={submit}>
      <div className="space mb">
        <h2>{category.id ? 'تعديل قسم' : 'قسم جديد'}</h2>
        <button type="button" className="btn small" onClick={onCancel}>إلغاء</button>
      </div>

      {err && <div className="err" style={{ marginBottom: 12 }}>{err}</div>}

      <div className="grid2">
        <div className="field">
          <label>اسم القسم</label>
          <input
            value={form.name}
            onChange={(e) => {
              set('name', e.target.value)
              if (!category.id && !form.slug) set('slug', slugify(e.target.value))
            }}
            required
          />
        </div>
        <div className="field">
          <label>الرابط (Slug)</label>
          <input dir="ltr" value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} placeholder="baking-supplies" />
        </div>
        <div className="field">
          <label>الوصف المختصر</label>
          <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="يظهر تحت اسم القسم" />
        </div>
        <div className="field">
          <label>الترتيب في الموقع</label>
          <input type="number" min="0" step="1" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)} />
        </div>
        <div className="field">
          <label>اللون</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="color"
              value={form.color || '#db8c33'}
              onChange={(e) => set('color', e.target.value)}
              style={{ width: 46, height: 36, padding: 2, border: '1px solid var(--line)', borderRadius: 8, background: 'none' }}
            />
            <input dir="ltr" value={form.color} onChange={(e) => set('color', e.target.value)} style={{ flex: 1 }} />
          </div>
        </div>
        <div className="field">
          <label>الأيقونة (اختياري)</label>
          <input dir="ltr" value={form.icon} onChange={(e) => set('icon', e.target.value)} placeholder="Sparkles" />
        </div>
      </div>

      <div className="field">
        <label>الوصف الكامل</label>
        <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>

      <div className="field">
        <label>صورة القسم</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {preview && (
            <img
              src={preview}
              alt=""
              style={{ width: 92, height: 92, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--line)' }}
            />
          )}
          <label className="btn small" style={{ cursor: 'pointer' }}>
            {preview ? 'تغيير الصورة' : 'رفع صورة'}
            <input type="file" accept="image/*" onChange={pickFile} style={{ display: 'none' }} />
          </label>
          {preview && (
            <button type="button" className="btn small red" onClick={clearImage}>إزالة الصورة</button>
          )}
        </div>
        <input
          dir="ltr"
          value={form.image}
          onChange={(e) => { set('image', e.target.value); setPreview(e.target.value) }}
          placeholder="أو الصق رابط صورة"
          style={{ marginTop: 8 }}
        />
        <span className="muted" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
          JPG / PNG / WebP — الحد الأقصى 5 ميجا
        </span>
      </div>

      <div className="row">
        <button className="btn primary" disabled={busy || uploading}>
          {busy ? (uploading ? 'جارٍ رفع الصورة…' : 'جارٍ الحفظ…') : 'حفظ القسم'}
        </button>
        <button type="button" className="btn" onClick={onCancel}>إلغاء</button>
      </div>
    </form>
  )
}

function Discounts() {
  const { data: settings, loading, error, refresh } = useLoad(() => adminService.getStoreSettings())
  const [enabled, setEnabled] = useState(false)
  const [threshold, setThreshold] = useState('')
  const [type, setType] = useState('percent')
  const [value, setValue] = useState('')
  const [flash, setFlash] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!settings) return
    const row = settings.find((s) => s.key === 'threshold_discount')
    const cfg = row?.value || {}
    setEnabled(Boolean(cfg.enabled))
    setThreshold(cfg.threshold ?? '')
    setType(cfg.type === 'amount' ? 'amount' : 'percent')
    setValue(cfg.value ?? '')
  }, [settings])

  function notify(msg) {
    setFlash(msg)
    clearTimeout(window.__adminDiscTimer)
    window.__adminDiscTimer = setTimeout(() => setFlash(''), 4500)
  }

  const save = async (e) => {
    e.preventDefault()
    const th = Number(threshold)
    const val = Number(value)
    if (enabled) {
      if (!th || th <= 0) {
        notify('اكتب الحد الأدنى للمبلغ (جنيه)')
        return
      }
      if (!val || val <= 0) {
        notify('اكتب قيمة الخصم')
        return
      }
      if (type === 'percent' && val > 100) {
        notify('نسبة الخصم أكبر من 100%')
        return
      }
    }
    setBusy(true)
    try {
      await adminService.setStoreSetting('threshold_discount', {
        enabled: Boolean(enabled),
        threshold: th || 0,
        type,
        value: val || 0,
      })
      await refresh()
      notify(enabled ? 'تم تفعيل خصم مبلغ مينيمم ✓' : 'تم إيقاف خصم المبلغ مينيمم (الكل هيشوف الأسعار العادية) ✓')
    } catch (e2) {
      notify('تعذر الحفظ: ' + e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="space mb">
        <div>
          <h1>الخصومات</h1>
          <p className="sub">تحكم في الخصومات التلقائية واليدوية في المتجر</p>
        </div>
      </div>

      <Flash msg={flash} />
      <ErrorBox error={error} />

      <div className="card">
        {loading ? (
          <Loading />
        ) : (
          <form onSubmit={save}>
            <div className="space" style={{ marginBottom: 14 }}>
              <h2 style={{ fontSize: 17 }}>خصم تلقائي عند حد المبلغ</h2>
              <label className="switch" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                <span className="muted bold" style={{ fontSize: 13 }}>{enabled ? 'مفعل ✓' : 'متوقف'}</span>
              </label>
            </div>
            <p className="muted" style={{ marginBottom: 14 }}>
              لو مجموع طلب العميل وصل للمبلغ اللي هتحدده، يتحسب له خصم تلقائي قبل الدفع. مثال: طلب +500 ج.م = خصم 10%.
            </p>
            <div className="grid3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="field">
                <label>الحد الأدنى للطلب (ج.م)</label>
                <input
                  dir="ltr"
                  type="number"
                  min="0"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="500"
                />
              </div>
              <div className="field">
                <label>نوع الخصم</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="percent">نسبة %</option>
                  <option value="amount">مبلغ ثابت (ج.م)</option>
                </select>
              </div>
              <div className="field">
                <label>قيمة الخصم</label>
                <input
                  dir="ltr"
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === 'percent' ? '10' : '50'}
                />
              </div>
            </div>
            <div className="row">
              <button className="btn primary" disabled={busy}>
                {busy ? 'جارٍ الحفظ…' : 'حفظ إعدادات الخصم'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: 17, marginBottom: 6 }}>خصم يدوي عند تسجيل عملية شراء</h2>
        <p className="muted" style={{ marginBottom: 4 }}>
          في شاشة «الطلبات → + تسجيل طلب جديد» تقدر تضيف خصماً (مبلغ أو نسبة) على أي طلب بيتسجل يدوياً.
        </p>
      </div>
    </>
  )
}

function AnnouncementEditor() {
  const { data: settings, loading, error, refresh } = useLoad(() => adminService.getStoreSettings())
  const [enabled, setEnabled] = useState(true)
  const [text, setText] = useState('')
  const [flash, setFlash] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!settings) return
    const row = settings.find((s) => s.key === 'announcement_bar')
    const cfg = row?.value
    if (!cfg) {
      setEnabled(true)
      setText('')
      return
    }
    setEnabled(Boolean(cfg.enabled))
    setText((Array.isArray(cfg.items) ? cfg.items : []).join('\n'))
  }, [settings])

  function notify(msg) {
    setFlash(msg)
    clearTimeout(window.__adminAnnTimer)
    window.__adminAnnTimer = setTimeout(() => setFlash(''), 4500)
  }

  const previewItems = text
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean)

  const save = async () => {
    if (enabled && previewItems.length === 0) {
      notify('اكتب رسالة واحدة على الأقل، أو اقفل الشريط')
      return
    }
    setBusy(true)
    try {
      await adminService.setStoreSetting('announcement_bar', {
        enabled: Boolean(enabled),
        items: previewItems,
      })
      await refresh()
      notify(enabled ? 'تم نشر الشريط الإعلاني ✓' : 'تم إيقاف الشريط — الشكل الافتراضي رجع ✓')
    } catch (e) {
      notify('تعذر الحفظ: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="space mb">
        <div>
          <h1>شريط الإعلانات العلوي</h1>
          <p className="sub">اللي بيظهر فوق الموقع على طول — اكتب اللي انت عايزه فيه</p>
        </div>
      </div>

      <Flash msg={flash} />
      <ErrorBox error={error} />

      <div className="card">
        {loading ? (
          <Loading />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              save()
            }}
          >
            <div className="space" style={{ marginBottom: 12 }}>
              <label className="row" style={{ gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                <span className="bold">تفعيل الشريط المخصص</span>
              </label>
              <p className="muted">
                كل سطر = رسالة. الرسائل تظهر جنب بعض في الشريط، والسطر الأول بيظهر على الموبايل.
                لو فضّيت الحقول أو قفلت الشريط، الموقع يرجع للرسائل الافتراضية (شحن مجاني… إلخ).
              </p>
            </div>
            <div className="field">
              <label>رسائل الشريط (سطر لكل رسالة)</label>
              <textarea
                dir="rtl"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={'شحن مجاني للطلبات فوق 300 ج.م\nخصم 10% على أول طلب بكود WELCOME10\nمنتجات أصلية 100%'}
              />
            </div>

            <div className="field">
              <label>معاينة</label>
              <div
                style={{
                  background: '#7c2d1f',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '9px 14px',
                  fontSize: 13,
                  display: 'flex',
                  gap: 18,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  overflow: 'hidden',
                }}
              >
                {(previewItems.length ? previewItems : ['(الشريط فاضي — هيرجع الافتراضي)']).map((t, i) => (
                  <span key={i}>🎁 {t}</span>
                ))}
              </div>
            </div>

            <div className="row">
              <button className="btn primary" disabled={busy}>
                {busy ? 'جارٍ الحفظ…' : 'حفظ ونشر الشريط'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

function BestSellers() {
  const { data: sellers, loading, error } = useLoad(() => adminService.getTopSellers(100))
  return (
    <>
      <h1>الأكثر مبيعاً</h1>
      <p className="sub">
        ترتيب المنتجات حسب عدد الكميات المباعة من الطلبات المسجلة — بيغذي قسم «الأكثر مبيعاً» في الموقع تلقائياً
      </p>
      <ErrorBox error={error} />
      <div className="card">
        {loading ? (
          <Loading />
        ) : !sellers || sellers.length === 0 ? (
          <div className="empty">لا توجد مبيعات مسجلة بعد — سجّل أول عملية شراء من تبويب الطلبات</div>
        ) : (
          <table>
            <thead>
              <tr><th>#</th><th>المنتج</th><th>الكمية المباعة</th><th>الإجمالي</th></tr>
            </thead>
            <tbody>
              {sellers.map((s, i) => (
                <tr key={s.product_id || i}>
                  <td className="bold">#{i + 1}</td>
                  <td className="bold">{s.product_name}</td>
                  <td>{s.qty} قطعة</td>
                  <td className="bold">{formatPrice(s.total)} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

function Orders({ highlightId }) {
  const { data: orders, loading, error, refresh } = useLoad(() => adminService.getOrders())
  const { data: products } = useLoad(() => adminService.getProducts())
  const [savingId, setSavingId] = useState('')
  const [flash, setFlash] = useState('')
  const [showPurchase, setShowPurchase] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [msgCounts, setMsgCounts] = useState({})

  async function loadMsgCounts() {
    try {
      const rows = (await adminService.getAllOrderMessages()) || []
      const map = {}
      for (const m of rows) {
        if (m.sender === 'customer' && !m.seen) map[m.order_id] = (map[m.order_id] || 0) + 1
      }
      setMsgCounts(map)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (highlightId) setSelectedId(highlightId)
    let alive = true
    const t = setTimeout(() => { if (alive) loadMsgCounts() }, 900)
    const iv = setInterval(() => { if (alive) loadMsgCounts() }, 30000)
    return () => { alive = false; clearTimeout(t); clearInterval(iv) }
  }, [highlightId, orders ? orders.length : 0])

  const selected = selectedId ? (orders || []).find((o) => o.id === selectedId) || null : null

function notify(msg) {
    setFlash(msg)
    clearTimeout(window.__adminOrdersFlashTimer)
    window.__adminOrdersFlashTimer = setTimeout(() => setFlash(''), 3000)
  }

  function copyOrderLink(id) {
    const url = `${window.location.origin}${window.location.pathname}?order=${id}`
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url)
    notify('نسخنا رابط الطلب — افتحه من موبايلك وهيوديك عليه فوراً')
  }

  useEffect(() => {
    if (!showPurchase) return
    const onKey = (e) => { if (e.key === 'Escape') setShowPurchase(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showPurchase])

  async function setStatus(order, status) {
    setSavingId(order.id)
    try {
      const patch = { status }
      if (status === 'تم التسليم' && !order.completed_at) patch.completed_at = new Date().toISOString()
      await adminService.updateOrder(order.id, patch)
      if (status === 'تم التسليم') {
        try {
          const row = await adminService.addOrderMessage(order.id, 'merchant', deliveryChatMsg(order.name || 'حبيبنا'))
          writeLocalChat(order.id, [...readLocalChat(order.id), ...(row || [])].sort(byDate))
        } catch {
          writeLocalChat(
            order.id,
            [...readLocalChat(order.id), {
              id: 'local-' + Date.now(),
              order_id: order.id,
              sender: 'merchant',
              body: deliveryChatMsg(order.name || 'حبيبنا'),
              seen: false,
              created_at: new Date().toISOString(),
            }].sort(byDate),
          )
        }
      }
      await refresh()
      notify('تم تحديث حالة الطلب ✓')
    } catch (e) {
      notify('تعذر التحديث: ' + e.message)
    } finally {
      setSavingId('')
    }
  }

  async function recordPurchase(order) {
    try {
      await adminService.createOrder(order)
      for (const item of Array.isArray(order.items) ? order.items : []) {
        try {
          await adminService.decrementStock(item.id, item.quantity)
        } catch {
          /* المتجر بياخد الكمية لو المنتج اتشال */
        }
      }
      await adminService.addActivity('purchase', `طلب مسجل من اللوحة ${order.id} — ${order.name} — ${formatPrice(order.total)} ج.م`)
      setShowPurchase(false)
      await refresh()
      notify('تم تسجيل عملية الشراء وظهرت في الأكثر مبيعاً ✓')
    } catch (e) {
      notify('تعذر التسجيل: ' + e.message)
    }
  }

  return (
    <>
      <div className="space mb">
        <div>
          <h1>الطلبات</h1>
          <p className="sub">تابع الطلبات وغيّر حالتها — تُسجَّل الطلبات هنا لحظة إرسال العميل</p>
        </div>
        <button className="btn primary" onClick={() => setShowPurchase(true)}>+ تسجيل شراء جديد</button>
      </div>
      <Flash msg={flash} />
      <ErrorBox error={error} />
      {showPurchase && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPurchase(false) }}
        >
          <PurchaseForm products={products || []} onSave={recordPurchase} onCancel={() => setShowPurchase(false)} />
        </div>
      )}
      <div className="card">
        {loading ? (
          <Loading />
        ) : selected ? (
          <OrderCard
            order={selected}
            savingId={savingId}
            onStatus={setStatus}
            onBack={() => setSelectedId('')}
            onCopy={copyOrderLink}
            onMessagesChanged={loadMsgCounts}
          />
        ) : (orders || []).length === 0 ? (
          <div className="empty">لا توجد طلبات بعد</div>
        ) : (
          <table>
            <thead>
              <tr><th>رقم</th><th>الاسم</th><th>الجوال</th><th>البريد</th><th>العنوان</th><th>الدفع</th><th>المنتجات</th><th>الإجمالي</th><th>الحالة</th><th>المصدر</th><th>التاريخ</th></tr>
            </thead>
            <tbody>
              {(orders || []).map((o) => (
                <tr key={o.id} id={`order-${o.id}`}>
                  <td className="bold">
                    <button className="btn-link" onClick={() => setSelectedId(o.id)}>
                      {o.id}
                    </button>
                    {msgCounts[o.id] > 0 && (
                      <span className="msg-badge" title={`${msgCounts[o.id]} رسالة جديدة من العميل`}>
                        💬 {msgCounts[o.id]}
                      </span>
                    )}
                    <button
                      className="copy-link"
                      onClick={() => copyOrderLink(o.id)}
                      title="نسخ رابط الطلب — افتحه من موبايلك وهيوديك عليه فوراً"
                    >
                      🔗
                    </button>
                  </td>
                  <td>{o.name}
                    {o.note?.includes('خصم أول طلب') && (
                      <div className="muted" style={{ fontSize: 11 }} title={o.note}>🎁 خصم أول طلب 26%</div>
                    )}
                  </td>
                  <td dir="ltr">
                    <a
                      href={`https://wa.me/2${String(o.phone || '').replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      title="افتح واتساب"
                      style={{ color: 'inherit' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {o.phone}
                    </a>
                  </td>
                  <td dir="ltr">
                    {o.email
                      ? <a href={`mailto:${o.email}`} title="راسل العميل" style={{ color: 'inherit' }}>{o.email}</a>
                      : '—'}
                  </td>
                  <td>{[o.city, o.address].filter(Boolean).join(' — ')}</td>
                  <td>{o.payment_method === 'cod' ? 'عند الاستلام' : o.payment_method === 'instapay' ? 'انستا باي' : o.payment_method === 'vodafone' ? 'فودافون كاش' : o.payment_method || '—'}</td>
                  <td>
                    {Array.isArray(o.items)
                      ? o.items.map((it, i) => (
                          <div key={i} className="muted">{it.name} × {it.quantity}</div>
                        ))
                      : '—'}
                  </td>
                  <td className="bold">{formatPrice(o.total)} ج.م</td>
                  <td>
                    <div className="row">
                      <span className={`badge ${o.status === 'تم التسليم' || o.status === 'تم استلام الدفع' ? 'green' : o.status === 'ملغي' ? 'red' : 'gold'}`}>{o.status}</span>
                      <select value={o.status} disabled={savingId === o.id} onChange={(e) => setStatus(o, e.target.value)}>
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="muted">{sourceLabel(o.source)}</td>
                  <td className="muted">{fmtDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

function CustomerTrackLink({ order }) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    let alive = true
    phoneToken(order?.phone).then((tok) => {
      if (alive && tok) setUrl(`${siteUrl('track')}?c=${tok}&ref=wa`)
    })
    return () => {
      alive = false
    }
  }, [order?.phone])

  if (!url) return null

  return (
    <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
      🧾 لينك «كل طلبات العميل» (يفتح طلباته من غير ما يكتب حاجة):{' '}
      <button
        type="button"
        onClick={() => {
          if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url)
          window.open(url, '_blank', 'noopener')
        }}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          color: '#7c3aed',
          fontWeight: 700,
          textDecoration: 'underline',
          cursor: 'pointer',
        }}
      >
        نسخ وفتح
      </button>
    </div>
  )
}

function OrderCard({ order, savingId, onStatus, onBack, onCopy, onMessagesChanged }) {
  const [msgs, setMsgs] = useState([])
  const [msgText, setMsgText] = useState('')
  const [msgBusy, setMsgBusy] = useState(false)
  const [msgLoading, setMsgLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setMsgLoading(true)
    setMsgs([])
    adminService
      .listOrderMessages(order.id)
      .then((rows) => {
        if (cancelled) return
        const merged = [...(rows || [])].sort(byDate)
        writeLocalChat(order.id, merged)
        setMsgs(merged)
        const hadUnseen = (rows || []).some((m) => m.sender === 'customer' && !m.seen)
        if (hadUnseen) {
          adminService.markOrderMessagesSeen(order.id).finally(() => onMessagesChanged && onMessagesChanged())
        }
      })
      .catch(() => {
        if (cancelled) return
        setMsgs(readLocalChat(order.id))
      })
      .finally(() => { if (!cancelled) setMsgLoading(false) })
    return () => { cancelled = true }
  }, [order.id])

  async function sendMsg() {
    const body = msgText.trim()
    if (!body) return
    setMsgBusy(true)
    try {
      const row = await adminService.addOrderMessage(order.id, 'merchant', body)
      const next = [...readLocalChat(order.id), ...(row || [])].sort(byDate)
      writeLocalChat(order.id, next)
      setMsgs(next)
      setMsgText('')
    } catch {
      const localMsg = {
        id: 'local-' + Date.now(),
        order_id: order.id,
        sender: 'merchant',
        body,
        seen: false,
        created_at: new Date().toISOString(),
      }
      const next = [...readLocalChat(order.id), localMsg].sort(byDate)
      writeLocalChat(order.id, next)
      setMsgs(next)
      setMsgText('')
    } finally {
      setMsgBusy(false)
    }
  }

  const payLabel = (m) =>
    m === 'cod' ? 'عند الاستلام' : m === 'instapay' ? 'انستا باي' : m === 'vodafone' ? 'فودافون كاش' : m || '—'
  const items = Array.isArray(order.items) ? order.items : []
  const wa = `https://wa.me/2${String(order.phone || '').replace(/\D/g, '')}`
  const badge = order.status === 'تم التسليم' || order.status === 'تم استلام الدفع' ? 'green' : order.status === 'ملغي' ? 'red' : 'gold'

  return (
    <div className="card">
      <div className="order-card">
        <div className="oc-head">
          <h2 style={{ margin: 0 }}>
            الطلب <span dir="ltr">{order.id}</span>
            <button className="copy-link" onClick={() => onCopy(order.id)} title="نسخ رابط الطلب">🔗</button>
          </h2>
          <button className="btn" onClick={onBack}>← رجوع لكل الطلبات</button>
        </div>

        <div className="detail-grid">
          <div className="kv"><b>العميل</b><span>{order.name || '—'}</span></div>
          <div className="kv"><b>الجوال (واتساب)</b><a href={wa} target="_blank" rel="noreferrer" dir="ltr">{order.phone || '—'} ✆</a></div>
          <div className="kv"><b>البريد</b>{order.email ? <a href={`mailto:${order.email}`} dir="ltr">{order.email}</a> : <span>—</span>}</div>
          <div className="kv"><b>العنوان</b><span>{[order.city, order.address].filter(Boolean).join(' — ') || '—'}</span></div>
          <div className="kv"><b>الدفع</b><span>{payLabel(order.payment_method)}</span></div>
          <div className="kv"><b>التاريخ</b><span>{fmtDate(order.created_at)}</span></div>
        </div>

        <h3 className="oc-sub">التفاصيل</h3>
        <table className="oc-items">
          <thead>
            <tr><th>المنتج</th><th>الكمية</th><th>السعر</th></tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>{it.name}</td>
                <td>× {it.quantity}</td>
                <td className="bold">{formatPrice(it.price)} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="oc-foot">
          <div>
            {order.subtotal != null && order.subtotal !== Number(order.total) && (
              <div className="muted" style={{ marginBottom: 2, fontSize: 12 }}>
                الإجمالي قبل الخصم: {formatPrice(order.subtotal)} ج.م
              </div>
            )}
            {Number(order.discount) > 0 && (
              <div className="muted" style={{ color: 'var(--green)', fontWeight: 700, marginBottom: 4 }}>
                الخصم: -{formatPrice(order.discount)} ج.م
              </div>
            )}
            <span className="muted">الإجمالي</span>{' '}
            <b className="bold" style={{ fontSize: 18 }}>{formatPrice(order.total)} ج.م</b>
          </div>
          <div className="row">
            <span className={`badge ${badge}`}>{order.status}</span>
            <select value={order.status} disabled={savingId === order.id} onChange={(e) => onStatus(order, e.target.value)}>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {order.note && <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>{order.note}</p>}

        {order.source && (
          <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
            🌐 العميل جاي من: <b style={{ color: '#7c3aed' }}>{sourceLabel(order.source)}</b>
          </p>
        )}

        <CustomerTrackLink order={order} />

        {order.status === 'تم التسليم' && (
          <DeliveryNotify
            order={order}
            onCopy={(txt) => {
              if (navigator.clipboard?.writeText) navigator.clipboard.writeText(txt)
            }}
          />
        )}

        <div style={{ marginTop: 18, borderTop: '1px solid #f3e8ff', paddingTop: 14 }}>
          <h3 className="oc-sub">💬 محادثة الطلب</h3>
          <p className="muted" style={{ fontSize: 12 }}>
            العميل بيشوف الرسايل دي جوه صفحة «تتبع طلبك» على الموقع فوراً — اكتب أي توضيح أو رد مقابل.
          </p>
          <div className="chat-box" style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {msgLoading ? (
              <p className="muted">جارِ تحميل المحادثة…</p>
            ) : msgs.length === 0 ? (
              <p className="muted">مفيش رسايل بعد — أول رسالة من العميل هتظهر هنا وفي التتبع.</p>
            ) : (
              msgs.map((m) => (
                <div
                  key={m.id}
                  style={{ display: 'flex', justifyContent: m.sender === 'merchant' ? 'flex-start' : 'flex-end' }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      background: m.sender === 'merchant' ? '#fef3c7' : '#e0f2fe',
                      border: '1px solid ' + (m.sender === 'merchant' ? '#fde68a' : '#bae6fd'),
                      borderRadius: 12,
                      padding: '8px 12px',
                      whiteSpace: 'pre-wrap',
                      fontSize: 13,
                    }}
                  >
                    <b style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>
                      {m.sender === 'merchant' ? '🏪 فانيليانو' : '🧑‍🤝‍🧑 العميل'}
                    </b>
                    {m.body}
                    <span className="muted" style={{ display: 'block', fontSize: 10, marginTop: 4 }}>{fmtDate(m.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="row" style={{ gap: 8, marginTop: 10, alignItems: 'flex-start' }}>
            <textarea
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="اكتب رد… هيظهر للعميل فوراً في صفحة تتبع طلبه"
              style={{ flex: 1, minHeight: 56, padding: 8, borderRadius: 8, border: '1px solid #d8b4fe' }}
            />
            <button className="btn primary" onClick={sendMsg} disabled={msgBusy}>
              إرسال 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeliveryNotify({ order, onCopy }) {
  const name = order.name || 'حبيبنا'
  const [token, setToken] = useState('')

  useEffect(() => {
    let alive = true
    phoneToken(order?.phone).then((t) => {
      if (alive) setToken(t || '')
    })
    return () => {
      alive = false
    }
  }, [order?.phone])

  const link = `${siteUrl('track')}?order=${order.id}&ref=wa${token ? `&c=${token}` : ''}`
  const allLink = token ? `${siteUrl('track')}?c=${token}&ref=wa` : ''
  const msg =
    `وصل طلبك بالسلامة يا ${name} 💛\n\n` +
    `طلبك رقم ${order.id} وصل بمواعيده وكله تمام. 🧁🎈\n\n` +
    `لمتابعة طلبك ومعرفة مكانه وموعد وصوله، افتح الرابط ده:\n${link}\n\n` +
    (allLink ? `ولو حبيت تشوف كل طلباتك على طول (من غير ما تكتب أي حاجة):\n${allLink}\n\n` : '') +
    `نشكرك من القلب على ثقتك في فانيليانو، ونتمنى أن يحوز طلبك على كامل رضاك.\n` +
    `شكراً لذوقك الغالي، وبنستناك في كل طلب… لأن أحلى التجارب بتتكرر دايماً مع فانيليانو 🧁\n` +
    `- فانيليانو`
  const subject = `طلبك ${order.id} وصل يا ${name} — تسلملي ذوقك 💛`
  const wa = `https://wa.me/2${String(order.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
  const mail = order.email
    ? `mailto:${order.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`
    : null

  return (
    <div className="notice">
      <div className="notice-head">🎉 الطلب اتوصّل — جاهز تبعت للعميل</div>
      <p className="notice-sub">
        العميل شاف «تم التسليم» فوراً في الموقع، والرسالة دي تساعدوه يعرف إن طلبه وصل.💛
      </p>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        <a className="btn green" href={wa} target="_blank" rel="noreferrer">
          أرسل على واتساب 🟢
        </a>
        {mail && (
          <a className="btn primary" href={mail} target="_blank" rel="noreferrer">
            أرسل بالإيميل ✉️
          </a>
        )}
        <a
          className="btn"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            onCopy(msg)
            alert('تم نسخ رسالة التوصيل — الصقها في واتساب')
          }}
          style={{ textDecoration: 'none' }}
        >
          نسخ الرسالة 📋
        </a>
      </div>
    </div>
  )
}

function PurchaseForm({ products, onSave, onCancel }) {
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [payment, setPayment] = useState('cod')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [discountEnabled, setDiscountEnabled] = useState(false)
  const [discountType, setDiscountType] = useState('amount')
  const [discountValue, setDiscountValue] = useState('')

  const chosen = products.find((p) => p.id === productId)
  const subtotal = chosen ? Number(chosen.price || 0) * Number(qty || 0) : 0
  const discountAmount = !discountEnabled
    ? 0
    : discountType === 'percent'
      ? Math.round((subtotal * Number(discountValue || 0)) / 100)
      : Number(discountValue || 0)
  const total = Math.max(subtotal - discountAmount, 0)

  async function submit(e) {
    e.preventDefault()
    if (!chosen) return
    if (!name.trim()) return
    setBusy(true)
    try {
      await onSave({
        id: `VNL-${Date.now().toString().slice(-6)}`,
        name: name.trim(),
        phone: phone.trim() || null,
        payment_method: payment,
        items: [{ id: chosen.id, name: chosen.name, price: Number(chosen.price), quantity: Number(qty) }],
        subtotal,
        discount: discountAmount,
        total,
        note: note.trim() || null,
        status: 'جديد',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card modal-form" onSubmit={submit}>
      <div className="space mb">
        <h2>تسجيل عملية شراء جديدة</h2>
        <button type="button" className="btn small" onClick={onCancel}>إلغاء</button>
      </div>
      <div className="grid2">
        <div className="field">
          <label>المنتج (اكتب للبحث)</label>
          <input list="admin-products" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="ابحث واختر المنتج…" required />
          <datalist id="admin-products">
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {formatPrice(p.price)} ج.م</option>
            ))}
          </datalist>
          {chosen && <div className="muted mt">مُختار: {chosen.name} ({formatPrice(chosen.price)} ج.م)</div>}
        </div>
        <div className="field">
          <label>الكمية</label>
          <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div className="field">
          <label>اسم العميل</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label>جوال العميل</label>
          <input
            dir="ltr"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(digitsOnly(e.target.value))}
            onPaste={(e) => {
              e.preventDefault()
              const text = (e.clipboardData || window.clipboardData).getData('text')
              setPhone(digitsOnly(phone + text))
            }}
          />
        </div>
        <div className="field">
          <label>طريقة الدفع</label>
          <select value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="cod">عند الاستلام</option>
            <option value="instapay">انستا باي</option>
            <option value="vodafone">فودافون كاش</option>
          </select>
        </div>
        <div className="field">
          <label>الإجمالي</label>
          <div className="bold" style={{ padding: '9px 0', fontSize: 18 }}>
            {discountEnabled && subtotal > discountAmount ? (
              <>
                <span className="muted" style={{ textDecoration: 'line-through', fontSize: 13 }}>{formatPrice(subtotal)}</span>{' '}
                {formatPrice(total)} ج.م
              </>
            ) : (
              formatPrice(total)
            )}{' '}
            {discountEnabled && subtotal > discountAmount ? <span className="muted">(قبل الخصم {formatPrice(subtotal)} ج.م)</span> : 'ج.م'}
          </div>
        </div>
      </div>

      <div className="card" style={{ boxShadow: 'none', background: 'var(--cream)', border: '1px dashed var(--line)' }}>
        <label className="row" style={{ gap: 8, cursor: 'pointer', marginBottom: 10 }}>
          <input type="checkbox" checked={discountEnabled} onChange={(e) => setDiscountEnabled(e.target.checked)} />
          <span className="bold">تفعيل خصم على الطلب ده</span>
        </label>
        {discountEnabled && (
          <div className="grid2">
            <div className="field">
              <label>نوع الخصم</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                <option value="amount">مبلغ ثابت (ج.م)</option>
                <option value="percent">نسبة %</option>
              </select>
            </div>
            <div className="field">
              <label>قيمة الخصم</label>
              <input
                dir="ltr"
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percent' ? '10' : '50'}
              />
              <span className="muted" style={{ display: 'block', marginTop: 4 }}>
                بيخصم {discountType === 'percent' ? `%${discountValue || 0} من الإجمالي` : `${formatPrice(Number(discountValue) || 0)} ج.م`} = -{formatPrice(discountAmount)} ج.م
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="field">
        <label>ملاحظات (اختياري)</label>
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="row">
        <button className="btn primary" disabled={busy || !chosen || !name.trim()}>
          {busy ? 'جارٍ التسجيل…' : 'حفظ عملية الشراء'}
        </button>
        <button type="button" className="btn" onClick={onCancel}>إلغاء</button>
      </div>
    </form>
  )
}

function Reviews() {
  const { data: reviews, loading, error, refresh } = useLoad(() => adminService.getReviews())
  const [busyId, setBusyId] = useState('')

  async function approve(r) {
    setBusyId(r.id)
    try {
      await adminService.updateReview(r.id, { approved: true })
      await refresh()
    } catch (e) {
      alert('تعذر التحديث: ' + e.message)
    } finally {
      setBusyId('')
    }
  }

  async function reject(r) {
    if (!confirm('هل تريد حذف هذا الرأي نهائياً؟')) return
    setBusyId(r.id)
    try {
      await adminService.deleteReview(r.id)
      await refresh()
    } catch (e) {
      alert('تعذر الحذف: ' + e.message)
    } finally {
      setBusyId('')
    }
  }

  const pending = (reviews || []).filter((r) => !r.approved)
  const approved = (reviews || []).filter((r) => r.approved)

  return (
    <>
      <h1>آراء العملاء</h1>
      <p className="sub">راجع الآراء قبل نشرها في الموقع — الموافقة تنشر الرأي فوراً</p>
      <ErrorBox error={error} />
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="card">
            <div className="space mb">
              <h2>بانتظار الموافقة</h2>
              <span className="badge gold">{pending.length}</span>
            </div>
            {pending.length === 0 ? (
              <div className="empty">لا توجد آراء جديدة</div>
            ) : (
              pending.map((r) => (
                <ReviewItem key={r.id} r={r} busy={busyId === r.id} onApprove={() => approve(r)} onReject={() => reject(r)} />
              ))
            )}
          </div>
          <div className="card">
            <div className="space mb">
              <h2>الآراء المنشورة</h2>
              <span className="badge green">{approved.length}</span>
            </div>
            {approved.length === 0 ? (
              <div className="empty">لا توجد آراء منشورة بعد</div>
            ) : (
              approved.map((r) => (
                <ReviewItem key={r.id} r={r} busy={busyId === r.id} onApprove={null} onReject={() => reject(r)} />
              ))
            )}
          </div>
        </>
      )}
    </>
  )
}

function ReviewItem({ r, busy, onApprove, onReject }) {
  return (
    <div className="msg-item">
      <div className="space mb">
        <div className="row">
          <span className="bold">{r.name}</span>
          <Stars n={Number(r.rating) || 5} />
          <span className="muted">{fmtDate(r.created_at)}</span>
        </div>
        <div className="row">
          {onApprove && (
            <button className="btn small green" disabled={busy} onClick={onApprove}>✓ موافقة ونشر</button>
          )}
          <button className="btn small red" disabled={busy} onClick={onReject}>حذف</button>
        </div>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>{r.text}</p>
      <div className="mt">
        <span className={`badge ${r.approved ? 'green' : 'gold'}`}>{r.approved ? 'منشور' : 'بانتظار الموافقة'}</span>
      </div>
    </div>
  )
}

function Messages() {
  const { data: messages, loading, error, refresh } = useLoad(() => adminService.getMessages())
  const [replies, setReplies] = useState({})
  const [busyId, setBusyId] = useState('')

  async function reply(m) {
    const text = (replies[m.id] || '').trim()
    if (!text) return
    setBusyId(m.id)
    try {
      await adminService.updateMessage(m.id, { replied: true, reply: text, replied_at: new Date().toISOString() })
      setReplies((r) => ({ ...r, [m.id]: '' }))
      await refresh()
    } catch (e) {
      alert('تعذر الإرسال: ' + e.message)
    } finally {
      setBusyId('')
    }
  }

  return (
    <>
      <h1>الرسائل</h1>
      <p className="sub">رسائل فورم التواصل — ردّ عليها من هنا</p>
      <ErrorBox error={error} />
      <div className="card">
        {loading ? (
          <Loading />
        ) : (messages || []).length === 0 ? (
          <div className="empty">لا توجد رسائل بعد</div>
        ) : (
          (messages || []).map((m) => (
            <div className={`msg-item ${m.replied ? 'replied' : ''}`} key={m.id}>
              <div className="space mb">
                <div className="row">
                  <span className="bold">{m.name}</span>
                  {m.email && <span className="muted" dir="ltr">{m.email}</span>}
                  {m.phone && <span className="muted" dir="ltr">{m.phone}</span>}
                  <span className="muted">{fmtDate(m.created_at)}</span>
                </div>
                <span className={`badge ${m.replied ? 'green' : 'gold'}`}>{m.replied ? 'تم الرد' : 'بانتظار الرد'}</span>
              </div>
              {m.subject && <div className="bold mb">{m.subject}</div>}
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>{m.message}</p>
              {m.replied ? (
                <div className="mt" style={{ background: '#fbfbf6', border: '1px solid var(--line)', borderRadius: 10, padding: 10 }}>
                  <div className="muted mb">ردك ({fmtDate(m.replied_at)}):</div>
                  <p style={{ fontSize: 14 }}>{m.reply}</p>
                </div>
              ) : (
                <div className="mt row">
                  <input
                    placeholder="اكتب ردك هنا…"
                    value={replies[m.id] || ''}
                    onChange={(e) => setReplies((r) => ({ ...r, [m.id]: e.target.value }))}
                    style={{ flex: 1, minWidth: 200, border: '1px solid var(--line)', borderRadius: 10, padding: '9px 12px', fontSize: 14 }}
                  />
                  <button className="btn primary" disabled={busyId === m.id} onClick={() => reply(m)}>
                    {busyId === m.id ? 'جارٍ الإرسال…' : 'إرسال الرد'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  )
}

function Activity() {
  const { data: activity, loading, error } = useLoad(() => adminService.getActivity())

  const escapeHtml = (s = '') =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  const reportTitle = 'سجل نشاط المتجر'
  const reportDate = new Date().toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const exportPdf = () => {
    const rows = (activity || [])
      .map(
        (a) => `<tr>
          <td class="kind">${escapeHtml(KIND_LABELS[a.kind] || a.kind)}</td>
          <td>${escapeHtml(a.label)}</td>
          <td class="time">${escapeHtml(fmtDate(a.created_at))}</td>
        </tr>`,
      )
      .join('')
    const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>${reportTitle}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #2d1b18; margin: 0; padding: 28px; }
  h1 { font-size: 20px; margin: 0 0 2px; }
  .meta { color: #7a6a66; font-size: 12px; margin-bottom: 18px; }
  .stats { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
  .stat { border: 1px solid #eadfd8; border-radius: 10px; padding: 6px 12px; font-size: 12px; background: #faf6f3; }
  .stat b { color: #7c2d1f; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border-bottom: 1px solid #eadfd8; padding: 7px 10px; text-align: right; vertical-align: top; }
  th { background: #f4ece7; font-size: 11px; color: #7a6a66; }
  td.time, td.kind { white-space: nowrap; }
  .kind { font-weight: 700; }
  @media print { body { padding: 10px; } }
</style>
</head>
<body>
  <h1>${reportTitle}</h1>
  <div class="meta">صدر في ${reportDate} — إجمالي ${(activity || []).length} حدث</div>
  <div class="stats">
    ${Object.entries(KIND_LABELS)
      .map(([k, l]) => {
        const c = (activity || []).filter((a) => a.kind === k).length
        return c ? `<div class="stat">${escapeHtml(l)}: <b>${c}</b></div>` : ''
      })
      .join('')}
  </div>
  <table>
    <thead><tr><th>النوع</th><th>الحدث</th><th>الوقت</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`
    const w = window.open('', '_blank', 'width=900,height=600')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    setTimeout(() => {
      w.focus()
      w.print()
    }, 350)
  }

  const exportCsv = () => {
    const sep = '\u060C'
    const esc = (s = '') => `"${String(s).replace(/"/g, '""')}"`
    const lines = [
      ['النوع', 'الحدث', 'الوقت']
        .map(esc)
        .join(sep),
      ...(activity || []).map((a) =>
        [KIND_LABELS[a.kind] || a.kind || '', a.label || '', fmtDate(a.created_at)]
          .map(esc)
          .join(sep),
      ),
    ]
    const csv = '\uFEFF' + lines.join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `activity-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="space mb">
        <div>
          <h1>سجل النشاط</h1>
          <p className="sub">كل ما جرى في المتجر: دخول، خروج، شراء، آراء، رسائل</p>
        </div>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <CleanupNoticeBanner />
          {(activity || []).length > 0 && (
            <div className="row">
              <button className="btn" onClick={exportPdf}>🖨️ تصدير PDF</button>
              <button className="btn" onClick={exportCsv}>📊 تصدير Excel</button>
            </div>
          )}
        </div>
      </div>
      <ErrorBox error={error} />
      <div className="card">
        {loading ? (
          <Loading />
        ) : (activity || []).length === 0 ? (
          <div className="empty">لا يوجد نشاط بعد</div>
        ) : (
          <table>
            <thead>
              <tr><th>النوع</th><th>الحدث</th><th>الوقت</th></tr>
            </thead>
            <tbody>
              {(activity || []).map((a) => (
                <tr key={a.id}>
                  <td><span className="badge gray">{KIND_LABELS[a.kind] || a.kind}</span></td>
                  <td>{a.label}</td>
                  <td className="muted">{fmtDate(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}