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
    const qty = product.qty === '' || product.qty === null || product.qty === undefined
      ? null
      : Math.max(0, Math.floor(Number(product.qty)))
    return run(
      client.from('products').upsert(
        {
          ...product,
          qty,
          price: product.price ? Number(product.price) : null,
          oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
          discount: product.discount ? Number(product.discount) : 0,
        },
        { onConflict: 'id' },
      ),
    )
  },

  deleteProduct(id) {
    return run(client.from('products').delete().eq('id', id))
  },

  // ===== الأقسام =====
  getCategories() {
    return run(client.from('categories').select('*').order('sort_order', { ascending: true }))
  },

  upsertCategory(category) {
    return run(
      client.from('categories').upsert(
        {
          ...category,
          sort_order: Number(category.sort_order) || 0,
        },
        { onConflict: 'id' },
      ),
    )
  },

  async deleteCategory(id) {
    const { count } = await run(
      client.from('products').select('id', { count: 'exact', head: true }).eq('category', id),
    )
    if (count > 0) {
      throw new Error(`موجود ${count} منتج في القسم ده — انقلهم لقسم تاني الأول`)
    }
    return run(client.from('categories').delete().eq('id', id))
  },

  // رفع صورة القسم للـStorage وإرجاع الرابط العام
  async uploadCategoryImage(file, categoryId) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    // مفتاح لاتيني بس — Supabase Storage يرفض المفاتيح اللي فيها حروف عربية
    const key = String(categoryId).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'category'
    const path = `${key}-${Date.now()}.${ext}`
    const { error } = await client.storage
      .from('categories')
      .upload(path, file, { upsert: true, cacheControl: '31536000' })
    if (error) throw new Error(error.message)
    const { data } = client.storage.from('categories').getPublicUrl(path)
    return data.publicUrl
  },

  async deleteCategoryImage(url) {
    const marker = '/object/public/categories/'
    const i = url.indexOf(marker)
    if (i === -1) return
    const path = decodeURIComponent(url.slice(i + marker.length))
    await client.storage.from('categories').remove([path])
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

  listOrderMessages(orderId) {
    return run(
      client
        .from('order_messages')
        .select('*')
        .eq('order_id', String(orderId))
        .order('created_at', { ascending: true }),
    )
  },

  getAllOrderMessages() {
    return run(
      client
        .from('order_messages')
        .select('*')
        .order('created_at', { ascending: false }),
    )
  },

  addOrderMessage(orderId, sender, body) {
    return run(
      client
        .from('order_messages')
        .insert({ order_id: String(orderId), sender, body })
        .select('*'),
    )
  },

  markOrderMessagesSeen(orderId) {
    return run(
      client
        .from('order_messages')
        .update({ seen: true })
        .eq('order_id', String(orderId))
        .eq('sender', 'customer'),
    )
  },
}