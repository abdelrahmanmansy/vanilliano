import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const client = createClient(url, anonKey)

async function run(promise) {
  const { data, error } = await promise
  if (error) throw new Error(error.message)
  return data
}

export const adminService = {
  getProducts() {
    return run(client.from('products').select('*').order('name', { ascending: true }))
  },

  upsertProduct(product) {
    return run(
      client.from('products').upsert(
        { ...product, price: product.price ? Number(product.price) : null, oldPrice: product.oldPrice ? Number(product.oldPrice) : null, discount: product.discount ? Number(product.discount) : 0 },
        { onConflict: 'id' },
      ),
    )
  },

  deleteProduct(id) {
    return run(client.from('products').delete().eq('id', id))
  },

  getOrders() {
    return run(client.from('orders').select('*').order('created_at', { ascending: false }))
  },

  createOrder(order) {
    return run(client.from('orders').insert(order).select('id'))
  },

  updateOrder(id, patch) {
    return run(client.from('orders').update(patch).eq('id', id))
  },

  getTopSellers(maxCount = 100) {
    return run(client.rpc('top_sellers', { max_count: maxCount }))
  },

  addActivity(kind, label, meta) {
    return run(client.from('activity').insert({ kind, label, meta: meta || null }))
  },

  getReviews() {
    return run(client.from('reviews').select('*').order('created_at', { ascending: false }))
  },

  updateReview(id, patch) {
    return run(client.from('reviews').update(patch).eq('id', id))
  },

  deleteReview(id) {
    return run(client.from('reviews').delete().eq('id', id))
  },

  getMessages() {
    return run(client.from('messages').select('*').order('created_at', { ascending: false }))
  },

  updateMessage(id, patch) {
    return run(client.from('messages').update(patch).eq('id', id))
  },

  getActivity() {
    return run(client.from('activity').select('*').order('created_at', { ascending: false }).limit(200))
  },
}