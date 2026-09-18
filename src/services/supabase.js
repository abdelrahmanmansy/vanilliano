import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const configured = Boolean(url && anonKey)

const client = configured ? createClient(url, anonKey) : null

export const supabaseService = {
  isConfigured() {
    return configured
  },

  getClient() {
    return client
  },

  async getProducts() {
    if (!client) return { data: null, error: { message: 'Supabase غير مهيأ' } }
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('name', { ascending: true })
    return { data: data || null, error }
  },

  async saveProduct(product) {
    if (!client) return { data: null, error: { message: 'Supabase غير مهيأ' } }
    const { data, error } = await client.from('products').upsert(product)
    return { data, error }
  },

  async deleteProduct(id) {
    if (!client) return { data: null, error: { message: 'Supabase غير مهيأ' } }
    const { data, error } = await client
      .from('products')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  async signInAdmin(email, password) {
    if (!client) return { data: null, error: { message: 'Supabase غير مهيأ' } }
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signOutAdmin() {
    if (!client) return
    await client.auth.signOut()
  },

  getAdminSession() {
    if (!client) return null
    return client.auth.getSession()
  },
}