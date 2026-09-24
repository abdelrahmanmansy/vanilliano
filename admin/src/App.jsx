import { useEffect, useState } from 'react'
import { client, adminService } from './adminService'
import { categories as CATEGORIES } from '../../src/data/categories'
import { calculateDiscount, formatPrice } from '../../src/utils/format'

const OWNER_EMAIL = 'abdelrahmanahmedmansy@gmail.com'

const ORDER_STATUSES = ['جديد', 'قيد التجهيز', 'تم التسليم', 'ملغي']
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
  const [tab, setTab] = useState('overview')

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

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'products', label: 'المنتجات', icon: '🧁' },
    { id: 'bestsellers', label: 'الأكثر مبيعاً', icon: '🏆' },
    { id: 'orders', label: 'الطلبات', icon: '🛒' },
    { id: 'reviews', label: 'آراء العملاء', icon: '⭐' },
    { id: 'messages', label: 'الرسائل', icon: '✉️' },
    { id: 'activity', label: 'النشاط', icon: '🕓' },
  ]

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          فانيليانو
          <span>لوحة الإدارة</span>
        </div>
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
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
        {tab === 'overview' && <Overview />}
        {tab === 'products' && <Products />}
        {tab === 'bestsellers' && <BestSellers />}
        {tab === 'orders' && <Orders />}
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

function Overview() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [messages, setMessages] = useState([])
  const [activity, setActivity] = useState([])

  useEffect(() => {
    Promise.all([
      adminService.getProducts(),
      adminService.getOrders(),
      adminService.getReviews(),
      adminService.getMessages(),
      adminService.getActivity(),
    ])
      .then(([p, o, r, m, a]) => { setProducts(p); setOrders(o); setReviews(r); setMessages(m); setActivity(a) })
      .catch(() => {})
  }, [])

  const pendingReviews = reviews.filter((r) => !r.approved).length
  const unreadMessages = messages.filter((m) => !m.replied).length
  const newOrders = orders.filter((o) => o.status === 'جديد' || o.status === 'قيد التجهيز').length
  const totalSales = orders
    .filter((o) => o.status === 'تم التسليم')
    .reduce((s, o) => s + Number(o.total || 0), 0)

  const stats = [
    { lbl: 'المنتجات', num: products.length },
    { lbl: 'طلبات جديدة/قيد التجهيز', num: newOrders },
    { lbl: 'مبيعات مؤكدة (ج.م)', num: formatPrice(totalSales) },
    { lbl: 'آراء بانتظار الموافقة', num: pendingReviews },
    { lbl: 'رسائل بلا رد', num: unreadMessages },
    { lbl: 'عمليات دخول/خروج مسجلة', num: activity.filter((a) => a.kind === 'login' || a.kind === 'logout').length },
  ]

  return (
    <>
      <h1>نظرة عامة</h1>
      <p className="sub">ملخص نشاط المتجر الآن</p>

      <div className="stats mb">
        {stats.map((s) => (
          <div className="stat" key={s.lbl}>
            <div className="lbl">{s.lbl}</div>
            <div className="num">{s.num}</div>
          </div>
        ))}
      </div>

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
                  <td className="bold">{o.id}</td>
                  <td>{o.name}</td>
                  <td dir="ltr">{o.phone}</td>
                  <td className="bold">{formatPrice(o.total)} ج.م</td>
                  <td><span className={`badge ${o.status === 'تم التسليم' ? 'green' : o.status === 'ملغي' ? 'red' : 'gold'}`}>{o.status}</span></td>
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
              <tr><th>الصورة</th><th>الاسم</th><th>القسم</th><th>السعر</th><th>القديم</th><th>الخصم</th><th>المخزون</th><th>شارة</th><th></th></tr>
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
                    <td>{disc > 0 ? <span className="badge red">خصم {disc}%</span> : '—'}</td>
                    <td>
                      <span className={`badge ${p.stock === 'out' ? 'red' : p.stock === 'limited' ? 'gold' : 'green'}`}>
                        {p.stock === 'out' ? 'غير متوفر' : p.stock === 'limited' ? 'محدود' : 'متوفر'}
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

function ProductForm({ product, onSave, onCancel }) {
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
      const discount = calculateDiscount(price, oldPrice)
      await onSave({ ...form, id: form.id || `p${Date.now()}`, price, oldPrice, discount, rating: form.rating || 5, reviews: form.reviews || 0, highlights: form.highlights || [] })
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
            {CATEGORIES.map((c) => (
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
          <label>المخزون</label>
          <select value={form.stock} onChange={(e) => set('stock', e.target.value)}>
            {STOCK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
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

function Orders() {
  const { data: orders, loading, error, refresh } = useLoad(() => adminService.getOrders())
  const { data: products } = useLoad(() => adminService.getProducts())
  const [savingId, setSavingId] = useState('')
  const [flash, setFlash] = useState('')
  const [showPurchase, setShowPurchase] = useState(false)

  function notify(msg) {
    setFlash(msg)
    clearTimeout(window.__adminOrdersFlashTimer)
    window.__adminOrdersFlashTimer = setTimeout(() => setFlash(''), 4000)
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
        ) : (orders || []).length === 0 ? (
          <div className="empty">لا توجد طلبات بعد</div>
        ) : (
          <table>
            <thead>
              <tr><th>رقم</th><th>الاسم</th><th>الجوال</th><th>العنوان</th><th>الدفع</th><th>المنتجات</th><th>الإجمالي</th><th>الحالة</th><th>التاريخ</th></tr>
            </thead>
            <tbody>
              {(orders || []).map((o) => (
                <tr key={o.id}>
                  <td className="bold">{o.id}</td>
                  <td>{o.name}</td>
                  <td dir="ltr">{o.phone}</td>
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
                      <span className={`badge ${o.status === 'تم التسليم' ? 'green' : o.status === 'ملغي' ? 'red' : 'gold'}`}>{o.status}</span>
                      <select value={o.status} disabled={savingId === o.id} onChange={(e) => setStatus(o, e.target.value)}>
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </td>
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

function PurchaseForm({ products, onSave, onCancel }) {
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [payment, setPayment] = useState('cod')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const chosen = products.find((p) => p.id === productId)
  const total = chosen ? Number(chosen.price || 0) * Number(qty || 0) : 0

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
          <input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
          <div className="bold" style={{ padding: '9px 0', fontSize: 18 }}>{formatPrice(total)} ج.م</div>
        </div>
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

  return (
    <>
      <h1>سجل النشاط</h1>
      <p className="sub">كل ما جرى في المتجر: دخول، خروج، شراء، آراء، رسائل</p>
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