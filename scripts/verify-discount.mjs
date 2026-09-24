import { createClient } from '@supabase/supabase-js'

const anon = createClient('https://cjhcohxkhgglxqgmuntt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaGNvaHhraGdnbHhxZ211bnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNzg4MzQsImV4cCI6MjEwNTY1NDgzNH0.5-V0L72ypCgIB8akl8_maKNkGrovEp9gZEj4GDx4flA')
const owner = createClient('https://cjhcohxkhgglxqgmuntt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaGNvaHhraGdnbHhxZ211bnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNzg4MzQsImV4cCI6MjEwNTY1NDgzNH0.5-V0L72ypCgIB8akl8_maKNkGrovEp9gZEj4GDx4flA')
await owner.auth.signInWithPassword({ email: 'abdelrahmanahmedmansy@gmail.com', password: 'Van1d4061147!' })

const q = async (email) => {
  const { data, error } = await anon.rpc('first_order_discount', { p_email: email })
  if (error) throw error
  return Number(data)
}

console.log('1) زائر/إيميل جديد →', await q('brand-new@example.com'), '(المتوقع 26)')

await owner.from('orders').insert({ id: 'DISC-TEST-1', name: 'تست', email: 'has-order@example.com', status: 'جديد' })
console.log('2) إيميل عنده طلب →', await q('has-order@example.com'), '(المتوقع 0)')
console.log('3) email فاضل →', await q(''), '(المتوقع 0)')
console.log('4) case-insensitive →', await q('HAS-ORDER@example.com'), '(المتوقع 0)')
await owner.from('orders').delete().eq('id', 'DISC-TEST-1')
console.log('5) تنظيف ✅')