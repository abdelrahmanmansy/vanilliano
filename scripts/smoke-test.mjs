import '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

const url = 'https://cjhcohxkhgglxqgmuntt.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqaGNvaHhraGdnbHhxZ211bnR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNzg4MzQsImV4cCI6MjEwNTY1NDgzNH0.5-V0L72ypCgIB8akl8_maKNkGrovEp9gZEj4GDx4flA'
const OWNER_EMAIL = 'abdelrahmanahmedmansy@gmail.com'
const OWNER_PASS = process.env.OWNER_PASS
if (!OWNER_PASS) { console.log('set OWNER_PASS env var'); process.exit(1) }

const anon = createClient(url, anonKey)
const MARK = `اختبار-${Date.now()}`

// تطهير بقايا أي تشغيل سابق (لو وجدت)
await anon.from('orders').delete().eq('id', 'TEST-1')
await anon.from('activity').delete().eq('label', 'اختبار آلي')
await anon.from('messages').delete().eq('name', 'تست الآلي')

// 1) anon يضيف رأي غير موافَق
const { data: ins, error: insErr } = await anon
  .from('reviews')
  .insert({ name: 'تست الآلي', text: MARK, rating: 5, approved: false })
  .select('*')
if (insErr) { console.log('INSERT FAIL', insErr.message); process.exit(1) }
const rid = ins[0].id
console.log('1) إدراج رأي (بانتظار الموافقة) OK')

// 2) anon يقرأ فقط الموافَق عليه -> لازم ما يظهرش
const { data: pub } = await anon
  .from('reviews').select('*').eq('approved', true)
console.log('2) الرأي مخفي عن الموقع؟', !pub.some((r) => r.id === rid) ? 'نعم ✅' : 'لا ❌')

// 3) صاحب المتجر يسجل دخول (session مُوثّق) ويوافق
const { data: sgn, error: authErr } = await anon.auth.signInWithPassword({ email: OWNER_EMAIL, password: OWNER_PASS })
if (authErr) { console.log('LOGIN FAIL', authErr.message); process.exit(1) }
console.log('3) تسجيل دخول صاحب المتجر OK:', sgn.user.email)

const { data: upd, error: updErr } = await anon
  .from('reviews').update({ approved: true }).eq('id', rid).select('*')
if (updErr) { console.log('APPROVE FAIL', updErr.message); process.exit(1) }
console.log('4) موافقة صاحب المتجر OK, approved =', upd[0].approved)

// 4) anon يقرأ تاني -> لازم يظهر
const { data: pub2 } = await anon
  .from('reviews').select('*').eq('approved', true)
console.log('5) الرأي ظهر في الموقع؟', pub2.some((r) => r.id === rid) ? 'نعم ✅' : 'لا ❌')

// 5) حذف الرأي التجريبي
await anon.from('reviews').delete().eq('id', rid)
console.log('6) حذف الرأي التجريبي ✅')

// 7) anon يدرج في الطلبات/النشاط/الرسائل
for (const [tbl, row] of [
  ['orders', { id: 'TEST-1', name: 'تست الآلي', total: 99, status: 'جديد' }],
  ['activity', { kind: 'login', label: 'اختبار آلي' }],
  ['messages', { name: 'تست الآلي', message: MARK }],
]) {
  const { error: e } = await anon.from(tbl).insert(row)
  console.log(`7${tbl}) anon يدرج في ${tbl}:`, e ? 'خطأ ❌ ' + e.message : 'OK ✅')
}

// 8) client مجهول جديد بدون جلسة -> لازم بيانات الاختبار تفضل مخفية عنه
const guest = createClient(url, anonKey)
for (const tbl of ['orders', 'activity', 'messages']) {
  const { data, error } = await guest.from(tbl).select('*')
  const leaked = (data || []).some((r) => r.id === 'TEST-1' || r.label === 'اختبار آلي' || r.name === 'تست الآلي' || r.message === MARK)
  console.log(`8) ضيف مش شايف بيانات اختبار في ${tbl}؟`, !leaked && !error ? 'نعم ✅' : 'لا ❌ تسريب!')
}

// 9) تطهير نهائي
await anon.from('orders').delete().eq('id', 'TEST-1')
await anon.from('activity').delete().eq('label', 'اختبار آلي')
await anon.from('messages').delete().eq('name', 'تست الآلي')
console.log('9) تنظيف بيانات الاختبار ✅')