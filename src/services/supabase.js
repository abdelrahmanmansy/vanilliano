import { createClient } from '@supabase/supabase-js'
import { readStoredToken } from '../utils/token'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const configured = Boolean(url && anonKey)

const client = configured ? createClient(url, anonKey) : null

export const supabaseService = {
  isConfigured() {
    return configured
  },

  async getProducts() {
    if (!client) return { data: null, error: { message: 'Supabase غير مهيأ' } }
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('name', { ascending: true })
    return { data: data || null, error }
  },

  async getCategories() {
    if (!client) return { data: null, error: { message: 'Supabase غير مهيأ' } }
    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    return { data: data || null, error }
  },

  async getStoreSettings() {
    if (!client) return { data: [], error: null }
    const { data, error } = await client.from('store_settings').select('*')
    return { data: data || [], error }
  },

  async getTopSellers(maxCount = 8) {
    if (!client) return { data: [], error: null }
    const { data, error } = await client.rpc('top_sellers', { max_count: maxCount })
    return { data: data || [], error }
  },

  async firstOrderDiscount(email) {
    if (!client || !email) return 0
    const { data, error } = await client.rpc('first_order_discount', { p_email: email })
    if (error) {
      console.error('first_order_discount:', error.message)
      return 0
    }
    return Number(data) || 0
  },

  // طلبات العميل الحالي: بالتوكن السري المحفوظ على جهازه (مش بالإيميل —
  // أي حد كان يقدر يكتب أي إيميل ويشوف طلبات صاحبه)
  async getMyOrders() {
    const token = readStoredToken()
    if (!client || !token) return { data: [], error: null }
    const { data, error } = await client.rpc('orders_by_token', { p_token: token })
    return { data: data || [], error }
  },

  // لازم الموبايل + رقم طلب واحد على الأقل من نفس الموبايل
  async getOrdersByPhone(phone, orderId) {
    if (!client || !phone || !orderId) return { data: [], error: null }
    const { data, error } = await client.rpc('orders_by_phone', {
      p_phone: String(phone),
      p_order_id: String(orderId).trim(),
    })
    return { data: data || [], error }
  },

  // توكن "كل طلباتك" — السيرفر بيدّيه بس لو رقم الطلب والموبايل متطابقين
  async customerToken(orderId, phone) {
    if (!client || !orderId || !phone) return ''
    const { data, error } = await client.rpc('customer_token', {
      p_order_id: String(orderId).trim(),
      p_phone: String(phone),
    })
    if (error) return ''
    return typeof data === 'string' ? data : ''
  },

  async vipPerks(email) {
    const none = { freeShipping: false, discount: 0 }
    if (!client || !email) return none
    const { data, error } = await client.rpc('vip_perks', { p_email: String(email) })
    if (error || !data) return none
    return { freeShipping: Boolean(data.freeShipping), discount: Number(data.discount) || 0 }
  },

  async getOrdersByToken(token) {
    if (!client || !token) return { data: [], error: null }
    const { data, error } = await client.rpc('orders_by_token', { p_token: String(token) })
    return { data: data || [], error }
  },

  async setOrderSource(id, source) {
    if (!client || !id || !source) return
    try {
      await client.rpc('set_order_source', { p_id: String(id), p_source: String(source) })
    } catch {
      /* ignore */
    }
  },

  async trackOrder(id) {
    if (!client || !id) return { data: null, error: null }
    const { data, error } = await client.rpc('track_order', { p_id: String(id).trim() })
    return { data: (data || [])[0] || null, error }
  },

  async getReviews() {
    if (!client) return { data: [], error: null }
    const { data, error } = await client
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(50)
    return { data: data || [], error }
  },

  async addReview({ name, text, rating }) {
    if (!client) return { data: null, error: { message: 'Supabase غير مهيأ' } }
    const { data, error } = await client
      .from('reviews')
      .insert({ name, text, rating, approved: false })
    return { data, error }
  },

  async addActivity({ kind, label, meta }) {
    if (!client) return
    try {
      await client.from('activity').insert({ kind, label, meta: meta || null })
    } catch {
      /* ignore */
    }
  },

  // بيرجّع { error } عشان الطلب مايضيعش في صمت لو التسجيل فشل.
  // المخزون بيتخصم تلقائياً في قاعدة البيانات (trigger) أول ما الطلب يتسجل.
  async addOrder(order) {
    if (!client) return { error: { message: 'Supabase غير مهيأ' } }
    try {
      const { error } = await client.from('orders').insert({
        id: order.id,
        name: order.shippingInfo?.name || null,
        email: order.shippingInfo?.email || null,
        phone: order.shippingInfo?.phone || null,
        city: order.shippingInfo?.city || null,
        address: order.shippingInfo?.address || order.shippingInfo?.branch || null,
        payment_method: order.paymentMethod || null,
        items: order.items || null,
        total: order.total != null ? order.total : null,
        discount: order.discount != null ? order.discount : 0,
        note: order.shippingInfo?.notes || null,
        status: order.status || 'جديد',
        source: order.source || null,
      })
      if (error) console.error('addOrder:', error.message)
      return { error }
    } catch (e) {
      console.error('addOrder:', e)
      return { error: { message: String(e?.message || e) } }
    }
  },

  async addMessage({ name, email, phone, subject, message }) {
    if (!client) return { data: null, error: { message: 'Supabase غير مهيأ' } }
    const { data, error } = await client.from('messages').insert({
      name,
      email: email || null,
      phone: phone || null,
      subject: subject || null,
      message,
    })
    return { data, error }
  },

  async saveOrderMessage(orderId, sender, body) {
    if (!client || !orderId || !body) return { data: null, error: { message: 'Supabase غير مهيأ' } }
    const { data, error } = await client.from('order_messages').insert({
      order_id: String(orderId),
      sender,
      body,
    })
    return { data, error }
  },

  async getOrderMessages(orderId) {
    if (!client || !orderId) return { data: [], error: { message: 'Supabase غير مهيأ' } }
    const { data, error } = await client.rpc('order_messages_for', { p_order_id: String(orderId) })
    return { data: data || [], error }
  },
}