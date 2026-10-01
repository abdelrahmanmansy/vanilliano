import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PackageSearch, Loader2 } from 'lucide-react'
import { supabaseService } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { formatPrice, formatDate } from '../utils/format'
import { STORAGE_KEYS } from '../utils/constants'
import { detectOrderSource } from '../utils/source'
import Button from '../components/ui/Button'

const PHONE_KEY = 'vanilliano_phone'

const stripPhone = (p) => String(p || '').replace(/\D/g, '')

const readStoredPhone = () => {
  try {
    return window.localStorage.getItem(PHONE_KEY) || ''
  } catch {
    return ''
  }
}

const saveStoredPhone = (phone) => {
  try {
    window.localStorage.setItem(PHONE_KEY, String(phone || ''))
  } catch {
    /* ignore */
  }
}

const findAllLocal = () => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.orders) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

const findLocalById = (id) => findAllLocal().find((o) => o.id === id)

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

const mergeChat = (...groups) => {
  const seen = new Set()
  const out = []
  for (const g of groups) {
    for (const m of g || []) {
      if (m && !seen.has(m.id)) {
        seen.add(m.id)
        out.push(m)
      }
    }
  }
  return out.sort(byDate)
}

const MILESTONES = [
  { label: 'تم استلام الطلب', emoji: '📦' },
  { label: 'تم استلام الدفعة', emoji: '💸' },
  { label: 'الطلب يتجهز', emoji: '🎁' },
  { label: 'وصل ليك بسلام 💛', emoji: '🎉' },
]

const doneCountFor = (status) => {
  switch (status) {
    case 'تم التسليم':
      return 4
    case 'قيد التجهيز':
      return 3
    case 'تم استلام الدفع':
      return 2
    case 'ملغي':
      return -1
    default:
      return 1
  }
}

const whereFor = (s) => {
  switch (s) {
    case 'جديد':
    case 'بانتظار التأكيد':
      return 'لسه معانا في المخزن وبنجهّزه'
    case 'تم استلام الدفع':
      return 'الدفعة اتأكدت والطلب هيتجهز'
    case 'قيد التجهيز':
      return 'بيتجهز دلوقتي في المخزن وبانغلّفهولك'
    case 'تم التسليم':
      return 'وصل ليك خلاص ✓'
    default:
      return '—'
  }
}

const etaFor = (s) => {
  switch (s) {
    case 'جديد':
    case 'بانتظار التأكيد':
      return 'خلال ٢٤–٤٨ ساعة من تأكيد الطلب'
    case 'تم استلام الدفع':
      return 'خلال ٤٨ ساعة من تأكيد الدفعة'
    case 'قيد التجهيز':
      return 'بيتطلق للشحن خلال ٢٤ ساعة'
    case 'تم التسليم':
      return 'دلوقتي خلاص 🎉'
    default:
      return '—'
  }
}

const friendlyStatus = (s) => {
  switch (s) {
    case 'جديد':
    case 'بانتظار التأكيد':
      return 'استلمنا طلبك وبنراجعه'
    case 'تم استلام الدفع':
      return 'الدفعة وصلت، هنتواصل معاك'
    case 'قيد التجهيز':
      return 'الطلب بيتجهز دلوقتي'
    case 'تم التسليم':
      return '🎉 وصل طلبك بالسلامة! نحب نشكرك من القلب، ونتمنى أن يحوز طلبك على كامل رضاك 💛'
    case 'ملغي':
      return 'الطلب اتلغي'
    default:
      return s || '—'
  }
}

export default function Track() {
  const [params] = useSearchParams()
  const { user } = useAuth()
  const [query, setQuery] = useState(params.get('order') || '')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [chat, setChat] = useState([])
  const [chatText, setChatText] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [phone, setPhone] = useState('')
  const [myOrders, setMyOrders] = useState([])
  const [lookup, setLookup] = useState('idle')

  const loadChat = async (id) => {
    setChatLoading(true)
    const local = readLocalChat(id)
    const { data } = await supabaseService.getOrderMessages(id)
    const merged = mergeChat(local, data)
    writeLocalChat(id, merged)
    setChat(merged)
    setChatLoading(false)
  }

  const sendChat = async () => {
    const body = chatText.trim()
    if (!body || !order) return
    setSending(true)
    const localMsg = {
      id: 'local-' + Date.now(),
      order_id: order.id,
      sender: 'customer',
      body,
      seen: false,
      created_at: new Date().toISOString(),
    }
    writeLocalChat(order.id, mergeChat(readLocalChat(order.id), [localMsg]))
    setChat(mergeChat(chat, [localMsg]))
    setChatText('')
    const { data, error } = await supabaseService.saveOrderMessage(order.id, 'customer', body)
    if (!error && data && data.length) {
      writeLocalChat(order.id, data)
      setChat(data)
    }
    setSending(false)
  }

  const load = async (rawId) => {
    const id = String(rawId || '').trim()
    if (!id) return
    setLoading(true)
    setNotFound(false)
    setOrder(null)

    let found = findLocalById(id)

    if (!found && user?.email) {
      const { data: list } = await supabaseService.getMyOrders(user.email)
      const mine = (list || []).find((o) => o.id === id)
      if (mine) found = mine
    }

    if (!found) {
      const { data } = await supabaseService.trackOrder(id)
      if (data) found = data
    }

    setLoading(false)
    if (found) {
      setOrder(found)
      loadChat(id)
      if (found.phone) {
        saveStoredPhone(found.phone)
        setPhone((cur) => (stripPhone(cur) ? cur : found.phone))
      }
      supabaseService.setOrderSource(id, detectOrderSource())
    } else {
      setNotFound(true)
    }
  }

  const loadMyOrders = async (phoneStr) => {
    const p = stripPhone(phoneStr)
    if (!p) return
    setLookup('loading')
    const { data } = await supabaseService.getOrdersByPhone(p)
    const list = Array.isArray(data) ? data.sort(byDate).reverse() : []
    setMyOrders(list)
    setLookup(list.length ? 'done' : 'empty')
    if (list.length) saveStoredPhone(phoneStr)
  }

  const openFromList = (o) => {
    const id = String(o.id || '')
    if (!id) return
    const src = detectOrderSource()
    window.history.replaceState(null, '', `?order=${id}`)
    setQuery(id)
    setMyOrders([])
    setLookup('idle')
    setNotFound(false)
    setOrder(o)
    loadChat(id)
    supabaseService.setOrderSource(id, src)
  }

  useEffect(() => {
    const id = params.get('order')
    if (id) load(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get('order')])

  useEffect(() => {
    if (params.get('order')) return
    const stored = readStoredPhone()
    if (stripPhone(stored)) {
      setPhone(stored)
      loadMyOrders(stored)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get('order')])

  const items = Array.isArray(order?.items) ? order.items : []
  const done = doneCountFor(order?.status)
  const cancelled = done === -1

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <div className="rounded-[2rem] border border-vanilla-100 bg-white p-6 shadow-sm md:p-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-vanilla-100">
            <PackageSearch size={30} className="text-burgundy-700" />
          </div>
          <h1 className="text-2xl font-black text-burgundy-950">تتبع طلبك</h1>
          <p className="mt-2 text-sm text-burgundy-900/60">
            اكتب رقم الطلب اللي وصلك، أو خش على «طلباتي» برقم موبايلك واختار طلبك على طول
          </p>
        </div>

        {!order && (
          <div className="mb-5 rounded-2xl border border-vanilla-100 bg-cream-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">🧾</span>
              <div>
                <p className="text-sm font-black text-burgundy-950">طلباتي</p>
                <p className="text-[11px] text-burgundy-900/50">
                  لو طلبت من فانيليانو قبل كده، اكتب موبايلك وهتشوف كل طلباتك من غير ما تدور على
                  أرقام الطلبات
                </p>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                loadMyOrders(phone)
              }}
              className="flex gap-2"
            >
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الموبايل (مثال 01012345678)"
                dir="ltr"
                className="w-full rounded-2xl border border-vanilla-200 bg-white px-4 py-3 text-sm font-bold text-right text-burgundy-950 outline-none transition-colors focus:border-burgundy-400"
              />
              <Button type="submit" size="lg" variant="dark" loading={lookup === 'loading'}>
                {lookup === 'loading' ? 'بيعاين...' : 'عرض طلباتي'}
              </Button>
            </form>

            {lookup === 'empty' && (
              <p className="mt-3 rounded-2xl bg-white p-3 text-center text-xs font-bold text-burgundy-900/50">
                مفيش طلبات تحت الرقم ده 🙁 — تأكد من الرقم، أو جاوب على واتساب لو محتاج مساعدة.
              </p>
            )}

            {lookup === 'done' && myOrders.length > 0 && (
              <ul className="mt-3 space-y-2">
                {myOrders.map((o) => (
                  <li key={o.id}>
                    <button
                      onClick={() => openFromList(o)}
                      className="flex w-full items-center justify-between gap-2 rounded-2xl bg-white p-3 text-right transition-colors hover:bg-vanilla-50"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-black text-burgundy-950" dir="ltr">
                          {o.id}
                        </span>
                        <span className="block text-[11px] font-bold text-burgundy-900/45">
                          {formatDate(o.created_at || o.date)}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-vanilla-100 px-2 py-1 text-[11px] font-black text-burgundy-800">
                          {o.status}
                        </span>
                        <span className="text-xs font-black text-burgundy-900">
                          {formatPrice(o.total)} ج.م
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            load(query)
          }}
          className="mb-2 flex gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="رقم الطلب (مثال VNL-123456)"
            dir="ltr"
            className="w-full rounded-2xl border border-vanilla-200 bg-cream-50 px-4 py-3 text-sm font-bold text-right text-burgundy-950 outline-none transition-colors focus:border-burgundy-400"
          />
          <Button type="submit" size="lg" variant="dark" loading={loading}>
            {loading ? 'بيعاين...' : 'تتبع'}
          </Button>
        </form>

        {notFound && (
          <p className="rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600">
            ملقيناش طلب بالرقم ده 🙁 — اتأكد من رقم الطلب، أو راسلنا على واتساب
            ونساعدك فوراً.
          </p>
        )}

        {order && (
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cream-50 p-4">
              <div>
                <p className="text-[11px] text-burgundy-900/40">رقم الطلب</p>
                <p className="text-sm font-black text-burgundy-950" dir="ltr">
                  {order.id}
                </p>
              </div>
              <div className="text-left">
                <p className="text-[11px] text-burgundy-900/40">التاريخ</p>
                <p className="text-sm font-black text-burgundy-950">
                  {formatDate(order.created_at || order.date)}
                </p>
              </div>
              <div className="text-left">
                <p className="text-[11px] text-burgundy-900/40">الإجمالي</p>
                <p className="text-sm font-black text-burgundy-900">
                  {formatPrice(order.total)} ج.م
                </p>
              </div>
            </div>

            {!cancelled && (
              <div className="rounded-2xl bg-vanilla-50 p-4 text-sm">
                <p className="mb-2 font-black text-burgundy-950">
                  📍 فين طلبك دلوقتي؟{' '}
                  <span className="text-emerald-600">{whereFor(order.status)}</span>
                </p>
                <p className="font-black text-burgundy-950">
                  ⏰ هيوصلك امتى؟ <span className="text-burgundy-700">{etaFor(order.status)}</span>
                </p>
              </div>
            )}

            {cancelled ? (
              <div className="rounded-2xl bg-red-50 p-4 text-center text-sm font-black text-red-700">
                تم إلغاء هذا الطلب
              </div>
            ) : (
              <div className="space-y-3">
                {MILESTONES.map((m, i) => {
                  const isDone = i < done
                  const isCurrent = i === done - 1
                  return (
                    <div key={m.label} className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-vanilla-100 text-burgundy-300'
                        }`}
                      >
                        {isDone ? '✓' : m.emoji}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-black ${
                            isDone ? 'text-burgundy-950' : 'text-burgundy-900/35'
                          }`}
                        >
                          {m.label}
                        </p>
                        {isCurrent && done < 4 && (
                          <p className="text-[11px] font-bold text-emerald-600">
                            الحالة هنا دلوقتي
                          </p>
                        )}
                      </div>
                      <div
                        className={`h-1.5 flex-1 rounded-full ${
                          isDone ? 'bg-emerald-400/70' : 'bg-vanilla-100'
                        }`}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            <p className="rounded-2xl bg-emerald-50 p-4 text-center text-sm font-black text-emerald-700">
              {friendlyStatus(order.status)}
            </p>

            <div className="rounded-2xl border border-vanilla-100 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg">💬</span>
                <div>
                  <p className="text-sm font-black text-burgundy-950">كلم صاحب المتجر</p>
                  <p className="text-[11px] text-burgundy-900/40">
                    رسايلك بتوصل له في الداشبورد فوراً، وردّه يظهر هنا مباشرة
                  </p>
                </div>
              </div>
              <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
                {chatLoading ? (
                  <p className="text-center text-xs font-bold text-burgundy-900/35">جارِ تحميل المحادثة…</p>
                ) : chat.length === 0 ? (
                  <p className="text-center text-xs font-bold text-burgundy-900/35">
                    مفيش رسايل بعد — اسأل أي حاجة عن طلبك
                  </p>
                ) : (
                  chat.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender === 'merchant' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          m.sender === 'merchant'
                            ? 'bg-vanilla-100 text-burgundy-950'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        <p className="text-[10px] font-black opacity-60">
                          {m.sender === 'merchant' ? '🏪 فانيليانو' : 'أنت'}
                        </p>
                        <p className="whitespace-pre-wrap font-bold">{m.body}</p>
                        <p className="mt-1 text-[10px] opacity-50">
                          {formatDate(m.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendChat()
                }}
                className="flex gap-2"
              >
                <textarea
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="اكتب رسالتك…"
                  rows={2}
                  className="w-full rounded-2xl border border-vanilla-200 bg-cream-50 px-4 py-2 text-sm font-bold text-burgundy-950 outline-none transition-colors focus:border-burgundy-400"
                />
                <Button type="submit" size="lg" variant="dark" loading={sending}>
                  {sending ? '...' : 'إرسال'}
                </Button>
              </form>
            </div>

            <div>
              <p className="mb-3 text-sm font-black text-burgundy-950">تفاصيل الطلب</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id || item.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-bold text-burgundy-950">
                      {item.image ? (
                        <img src={item.image} alt="" className="h-9 w-9 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-100 text-xs font-black text-burgundy-700">
                          {String(item.name || '؟').slice(0, 1)}
                        </span>
                      )}
                      {item.name}{' '}
                      <span className="text-xs text-burgundy-900/40">× {item.quantity}</span>
                    </span>
                    <span className="font-black text-burgundy-900">
                      {formatPrice(item.price * item.quantity)} ج.م
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {(order.city || order.address) && (
              <p className="border-t border-vanilla-50 pt-3 text-[11px] text-burgundy-900/40">
                📍 التوصيل إلى: {order.name || ''} · {order.city || '—'} ·{' '}
                {order.address || ''}
              </p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/contact" className="flex-1">
                <Button fullWidth variant="outline">سؤال عن الطلب؟ تواصل معنا</Button>
              </Link>
              <Link to="/products" className="flex-1">
                <Button fullWidth>متابعة التسوق</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}