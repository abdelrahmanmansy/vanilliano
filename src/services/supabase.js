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

  async getReviews() {
    if (!client) return { data: [], error: null }
    const { data, error } = await client
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    return { data: data || [], error }
  },

  async addReview({ name, text, rating }) {
    if (!client) return { data: null, error: { message: 'Supabase غير مهيأ' } }
    const { data, error } = await client
      .from('reviews')
      .insert({ name, text, rating })
    return { data, error }
  },
}