import { createServer } from 'vite'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SB_URL
const serviceKey = process.env.SB_SERVICE

if (!url || !serviceKey) {
  console.error('Missing SB_URL / SB_SERVICE')
  process.exit(1)
}

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

let mod
try {
  mod = await server.ssrLoadModule('/src/data/products.js')
} catch (e) {
  console.error('SSR load failed:', e.message)
  process.exit(1)
}

const list = (mod.products || []).map((p) => ({
  ...p,
  image: p.image && !p.image.startsWith('http') && p.image.startsWith('/images/')
    ? '/vanilliano' + p.image
    : p.image,
}))

const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

let created = 0
for (let i = 0; i < list.length; i += 200) {
  const chunk = list.slice(i, i + 200)
  const { error } = await sb.from('products').upsert(chunk)
  if (error) {
    console.error('Upsert error:', error.message)
    process.exit(1)
  }
  created += chunk.length
}

const email = process.env.SB_ADMIN_EMAIL
const pass = process.env.SB_ADMIN_PASS
let authInfo = 'no user requested'
if (email && pass) {
  const { data: existing } = await sb.auth.admin.listUsers({ perPage: 1000 })
  const found = existing?.users?.find((u) => u.email === email)
  if (found) {
    authInfo = `user exists (${email}), set password`
    const { error } = await sb.auth.admin.updateUserById(found.id, { password: pass })
    if (error) authInfo = `set password failed: ${error.message}`
  } else {
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password: pass,
      email_confirm: true,
    })
    authInfo = error ? `create failed: ${error.message}` : `created (${email})`
  }
}

console.log(JSON.stringify({ seeded: created, totalImageSample: list[0]?.image, authInfo }))
await server.close()