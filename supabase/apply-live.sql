-- ============================================================
-- فانيليانو — تنشيط «تتبع الطلب» + «المحادثة» عبر الموقع
-- شغّل هذا الملف كاملاً مرة واحدة في:
--   Supabase Dashboard -> SQL Editor -> الصق -> Run
-- ============================================================

-- (1) جدول محادثة الطلب (الرسائل بين العميل وصاحب المتجر)
create table if not exists public.order_messages (
  id uuid primary key default gen_random_uuid(),
  "order_id" text not null,
  "sender" text not null check ("sender" in ('merchant', 'customer')),
  "body" text not null,
  "seen" boolean not null default false,
  "created_at" timestamptz not null default now()
);

alter table public.order_messages enable row level security;

drop policy if exists "anyone can insert order_messages" on public.order_messages;
create policy "anyone can insert order_messages" on public.order_messages
  for insert with check (true);

drop policy if exists "auth can manage order_messages" on public.order_messages;
create policy "auth can manage order_messages" on public.order_messages
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

grant select, insert, update, delete on table public.order_messages to anon, authenticated;

create index if not exists order_messages_order_idx on public.order_messages (order_id, created_at asc);

-- (2) قراءة آمنة لرسائل طلب معين (للزائر العادي)
create or replace function public.order_messages_for(p_order_id text)
returns table (
  id uuid,
  order_id text,
  sender text,
  body text,
  seen boolean,
  created_at timestamptz
)
language sql security definer stable as $$
  select m.id, m.order_id, m.sender, m.body, m.seen, m.created_at
  from public.order_messages m
  where m.order_id = p_order_id
  order by m.created_at asc;
$$;

revoke all on function public.order_messages_for(text) from public;
grant execute on function public.order_messages_for(text) to anon, authenticated;

-- (3) تتبع الطلب برقمه (للزائر العادي — من أي جهاز)
create or replace function public.track_order(p_id text)
returns table (
  id text,
  created_at timestamptz,
  items jsonb,
  total numeric,
  status text,
  payment_method text,
  note text,
  name text,
  city text,
  address text
)
language sql security definer stable as $$
  select o.id, o.created_at, o.items, o.total, o.status, o.payment_method, o.note,
         o.name, o.city, o.address
  from public.orders o
  where o.id = p_id
  limit 1;
$$;

revoke all on function public.track_order(text) from public;
grant execute on function public.track_order(text) to anon, authenticated;