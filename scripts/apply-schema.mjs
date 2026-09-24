import { readFile } from 'node:fs/promises'

const REF = 'cjhcohxkhgglxqgmuntt'
const PAT = process.env.SUPABASE_MANAGEMENT_PAT
if (!PAT) throw new Error('Set SUPABASE_MANAGEMENT_PAT env var (Management API PAT)')
const sql = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8')

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql }),
})
const text = await res.text()
if (!res.ok) throw new Error(`Supabase API ${res.status}: ${text.slice(0, 500)}`)
console.log('schema applied OK:', text || '[ok]')