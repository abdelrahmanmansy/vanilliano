import { createClient } from '@supabase/supabase-js'

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

  async getTopSellers(maxCount = 8) {
    if (!client) return { data: [], error: null }
    const { data, error } = await client.rpc('top_sellers', { max_count: maxCount })
    return { data: data || [], error }
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

  async addOrder(order) {
    if (!client) return
    try {
      await client.from('orders').insert({
        id: order.id,
        name: order.shippingInfo?.name || null,
        email: order.shippingInfo?.email || null,
        phone: order.shippingInfo?.phone || null,
        city: order.shippingInfo?.city || null,
        address: order.shippingInfo?.address || order.shippingInfo?.branch || null,
        payment_method: order.paymentMethod || null,
        items: order.items || null,
        total: order.total != null ? order.total : null,
        note: order.shippingInfo?.notes || null,
        status: order.status || 'جديد',
      })
    } catch {
      /* ignore */
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
}