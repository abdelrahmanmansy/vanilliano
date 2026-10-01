-- Vanilliano - Ù…Ø®Ø·Ø· Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª Supabase
-- Ø´ØºÙ‘Ù„ Ø¯Ù‡ ÙÙŠ Supabase Dashboard -> SQL Editor Ø«Ù… Run

create table if not exists public.products (
  "id" text primary key,
  "name" text not null,
  "category" text,
  "price" numeric,
  "oldPrice" numeric,
  "rating" numeric,
  "reviews" integer,
  "stock" text,
  "image" text,
  "badge" text,
  "description" text,
  "highlights" jsonb,
  "discount" numeric
);

alter table public.products enable row level security;

-- Ø£ÙŠ Ø´Ø®Øµ (Ø§Ù„Ø²ÙˆØ§Ø±) ÙŠÙ‚Ø¯Ø± ÙŠÙ‚Ø±Ø£ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª
drop policy if exists "public can view products" on public.products;
create policy "public can view products" on public.products
  for select using (true);

-- ØµØ§Ø­Ø¨ Ø§Ù„Ù…ØªØ¬Ø± (Ø§Ù„Ù…Ø³Ø¬Ù„ Ø¯Ø®ÙˆÙ„Ù‡) ÙŠÙ‚Ø¯Ø± ÙŠØ¶ÙŠÙ/ÙŠØ¹Ø¯Ù‘Ù„/ÙŠÙ…Ø³Ø­
drop policy if exists "authenticated manage products" on public.products;
create policy "authenticated manage products" on public.products
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

grant select on table public.products to anon, authenticated;
grant insert, update, delete on table public.products to authenticated;

-- ============================================================
-- Ø¢Ø±Ø§Ø¡ Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ (reviews)
-- ============================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Ø¹Ù…ÙŠÙ„ ÙØ§Ù†ÙŠÙ„ÙŠØ§Ù†Ùˆ',
  text text not null,
  rating smallint not null default 5 check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- Ø§Ù„Ø²ÙˆØ§Ø± ÙŠÙ‚Ø±Ø£ÙˆÙ† ÙˆÙŠØ¶ÙŠÙÙˆÙ† Ø±Ø£ÙŠØ§Ù‹ (ÙÙˆØ±Ù… Ø§Ù„Ø­ÙˆØ§Ø± Ø§Ù„Ø¹Ø§Ù…)
drop policy if exists "public can view reviews" on public.reviews;
create policy "public can view reviews" on public.reviews
  for select using (true);

drop policy if exists "public can insert reviews" on public.reviews;
create policy "public can insert reviews" on public.reviews
  for insert with check (true);

grant select, insert on table public.reviews to anon, authenticated;

-- ØµØ§Ø­Ø¨ Ø§Ù„Ù…ØªØ¬Ø± Ø¨ÙŠÙˆØ§ÙÙ‚/ÙŠØ¹Ø¯Ù„/ÙŠÙ…Ø³Ø­ Ø§Ù„Ø¢Ø±Ø§Ø¡ Ù…Ù† Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…
drop policy if exists "auth can moderate reviews" on public.reviews;
create policy "auth can moderate reviews" on public.reviews
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

grant update, delete on table public.reviews to authenticated;

create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

-- Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø¹Ø±Ø¶ Ø§Ù„Ø±Ø£ÙŠ Ù‚Ø¨Ù„ Ø§Ù„Ù†Ø´Ø± (Ù‚ÙŠØ§Ø³Ø§Ù‹ Ø¹Ù„Ù‰ Ø·Ù„Ø¨Ùƒ)
alter table public.reviews add column if not exists "approved" boolean not null default false;

-- ============================================================
-- Ø§Ù„Ø·Ù„Ø¨Ø§Øª (orders)
-- ============================================================
create table if not exists public.orders (
  "id" text primary key,
  "name" text,
  "email" text,
  "phone" text,
  "city" text,
  "address" text,
  "payment_method" text,
  "items" jsonb,
  "total" numeric,
  "note" text,
  "status" text not null default 'Ø¬Ø¯ÙŠØ¯',
  "source" text,
  "created_at" timestamptz not null default now(),
  "completed_at" timestamptz
);

alter table public.orders add column if not exists source text;

alter table public.orders enable row level security;

drop policy if exists "anon can create orders" on public.orders;
create policy "anon can create orders" on public.orders
  for insert with check (true);

drop policy if exists "auth can manage orders" on public.orders;
create policy "auth can manage orders" on public.orders
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

grant insert on table public.orders to anon, authenticated;
grant select, update, delete on table public.orders to authenticated;

create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ============================================================
-- Ø³Ø¬Ù„ Ø§Ù„Ù†Ø´Ø§Ø· (activity)
-- ============================================================
create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  "kind" text not null,
  "label" text not null,
  "meta" jsonb,
  "created_at" timestamptz not null default now()
);

alter table public.activity enable row level security;

drop policy if exists "anon can add activity" on public.activity;
create policy "anon can add activity" on public.activity
  for insert with check (true);

drop policy if exists "auth can view activity" on public.activity;
create policy "auth can view activity" on public.activity
  for select using (auth.uid() is not null);

grant insert on table public.activity to anon, authenticated;
grant select, delete on table public.activity to authenticated;

create index if not exists activity_created_at_idx on public.activity (created_at desc);

-- ============================================================
-- Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„ØªÙˆØ§ØµÙ„ (messages)
-- ============================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  "name" text not null,
  "email" text,
  "phone" text,
  "subject" text,
  "message" text not null,
  "replied" boolean not null default false,
  "reply" text,
  "replied_at" timestamptz,
  "created_at" timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "anon can send messages" on public.messages;
create policy "anon can send messages" on public.messages
  for insert with check (true);

drop policy if exists "auth can manage messages" on public.messages;
create policy "auth can manage messages" on public.messages
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

grant insert on table public.messages to anon, authenticated;
grant select, update, delete on table public.messages to authenticated;

create index if not exists messages_created_at_idx on public.messages (created_at desc);

-- ============================================================
-- Ø§Ù„Ø£ÙƒØ«Ø± Ù…Ø¨ÙŠØ¹Ø§Ù‹ (top_sellers) â€” Ø¯Ø§Ù„Ø© Ø¢Ù…Ù†Ø© Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ø²Ø§Ø¦Ø±
-- Ø¨ØªØ­Ø³Ø¨ Ø§Ù„ÙƒÙ…ÙŠØ§Øª ÙˆØ§Ù„Ø¥ÙŠØ±Ø§Ø¯Ø§Øª Ù…Ù† Ø§Ù„Ø·Ù„Ø¨Ø§ØªØŒ ÙˆØ§Ù„Ø£ÙˆÙ†Ø± Ø¨Ø§ÙŠØ¨Ø§ Ø¹Ù† RLS
-- ============================================================
create or replace function public.top_sellers(max_count int default 8)
returns table (
  product_id text,
  product_name text,
  qty bigint,
  total numeric
)
language sql security definer stable as $$
  with exploded as (
    select o.status,
           j.value as it
    from public.orders o,
    lateral jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) as j(value)
  )
  select
    it->>'id' as product_id,
    it->>'name' as product_name,
    sum((it->>'quantity')::int)::bigint as qty,
    sum((it->>'quantity')::int * coalesce((it->>'price')::numeric, 0)) as total
  from exploded
  where status is distinct from 'Ù…Ù„ØºÙŠ'
  group by it->>'id', it->>'name'
  order by qty desc
  limit max_count;
$$;

revoke all on function public.top_sellers(int) from public;
grant execute on function public.top_sellers(int) to anon, authenticated;

-- ============================================================
-- Ø®ØµÙ… Ø£ÙˆÙ„ Ø·Ù„Ø¨ Ù„Ù„Ø¹Ø¶Ùˆ Ø§Ù„Ù…Ø³Ø¬Ù„ â€” Ø¯Ø§Ù„Ø© Ø¢Ù…Ù†Ø© Ù„Ù„Ø²Ø§Ø¦Ø±
-- Ø¨ØªØ±Ø¬Ø¹ 26 Ù„Ùˆ Ø§Ù„Ø£ÙŠÙ…ÙŠÙ„ Ù…Ø§ Ø¹Ù†Ø¯Ù‡ÙˆØ´ Ø·Ù„Ø¨Ø§Øª Ù‚Ø¨Ù„Ù‡ (ØºÙŠØ± Ù…Ù„ØºÙŠ) Ùˆ 0 ØºÙŠØ± ÙƒØ¯Ù‡
-- ============================================================
create or replace function public.first_order_discount(p_email text)
returns numeric
language sql security definer stable as $$
  select case
    when p_email is null or btrim(p_email) = '' then 0
    when exists (
      select 1 from public.orders
      where lower(email) = lower(btrim(p_email))
        and status is distinct from 'Ù…Ù„ØºÙŠ'
    ) then 0
    else 26
  end;
$$;

revoke all on function public.first_order_discount(text) from public;
grant execute on function public.first_order_discount(text) to anon, authenticated;

-- ============================================================
-- Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¹Ù…ÙŠÙ„ (Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø£ÙˆØ±Ø¯Ø±Ø§Øª Ø¨Ø§Ù„Ø¨Ø±ÙŠØ¯) â€” Ø¯Ø§Ù„Ø© Ø¢Ù…Ù†Ø© Ù„Ù„Ø²Ø§Ø¦Ø±
-- Ø¨ØªØ±Ø¬Ø¹ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¹Ù…ÙŠÙ„ Ø¨Ø§Ø³Ù…Ù‡ ÙˆØ§Ù„Ù…Ù†ØªØ¬Ø§Øª ÙˆØ§Ù„Ø¥Ø¬Ù…Ø§Ù„ÙŠ ÙˆØ§Ù„Ø­Ø§Ù„Ø© Ø¨Ø³
-- (Ù…Ù† ØºÙŠØ± Ù…ÙˆØ¨Ø§ÙŠÙ„/Ø¹Ù†ÙˆØ§Ù† ÙƒØ§Ù…Ù„ Ù„ØªÙ‚Ù„ÙŠÙ„ Ø§Ù„ØªØ¹Ø±Ø¶)
-- ============================================================
create or replace function public.my_orders(p_email text)
returns table (
  id text,
  created_at timestamptz,
  items jsonb,
  total numeric,
  status text,
  payment_method text,
  note text
)
language sql security definer stable as $$
  select o.id, o.created_at, o.items, o.total, o.status, o.payment_method, o.note
  from public.orders o
  where o.email is not null
    and btrim(o.email) <> ''
    and lower(o.email) = lower(btrim(p_email))
  order by o.created_at desc;
$$;

revoke all on function public.my_orders(text) from public;
grant execute on function public.my_orders(text) to anon, authenticated;
-- ============================================================
-- ORDER TRACKING BY ORDER NUMBER (public, works for guests too)
-- ============================================================
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

-- ============================================================
-- Ù…Ø­Ø§Ø¯Ø«Ø© Ø§Ù„Ø·Ù„Ø¨ (order_messages) â€” Ø±Ø³Ø§ÙŠÙ„ Ø¹Ø¨Ø± Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø¨Ø§Ù„Ø§ØªØ¬Ø§Ù‡ÙŠÙ†
-- Ø§Ù„Ø¹Ù…ÙŠÙ„ (anon) ÙŠØ¨Ø¹Øª ÙˆÙŠÙ‚Ø±Ø§ Ø¨Ø±Ù‚Ù… Ø§Ù„Ø·Ù„Ø¨ Ø¹Ø¨Ø± Ø¯Ø§Ù„Ø© Ø¢Ù…Ù†Ø©ØŒ
-- ÙˆØµØ§Ø­Ø¨ Ø§Ù„Ù…ØªØ¬Ø± (authenticated) ÙŠÙ‚Ø±Ø§ ÙˆÙŠÙƒØªØ¨ Ù…Ø¨Ø§Ø´Ø±Ø©
-- ============================================================
create table if not exists public.order_messages (
  id uuid primary key default gen_random_uuid(),
  "order_id" text not null,
  "sender" text not null check ("sender" in ('merchant', 'customer')),
  "body" text not null,
  "seen" boolean not null default false,
  "created_at" timestamptz not null default now()
);

alter table public.order_messages enable row level security;

-- Ø£ÙŠ Ø´Ø®Øµ ÙŠØ¨Ø¹Øª Ø±Ø³Ø§Ù„Ø© Ø¹Ù„Ù‰ Ø·Ù„Ø¨ (Ø§Ù„Ø¹Ù…ÙŠÙ„)
drop policy if exists "anyone can insert order_messages" on public.order_messages;
create policy "anyone can insert order_messages" on public.order_messages
  for insert with check (true);

-- ØµØ§Ø­Ø¨ Ø§Ù„Ù…ØªØ¬Ø± Ø§Ù„Ù…Ø³Ø¬Ù„ ÙŠÙ‚Ø±Ø§ ÙˆÙŠØ¹Ø¯Ù„ (Ø´ÙˆÙ/Ø­Ø°Ù) Ø±Ø³Ø§ÙŠÙ„
drop policy if exists "auth can manage order_messages" on public.order_messages;
create policy "auth can manage order_messages" on public.order_messages
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

grant select, insert, update, delete on table public.order_messages to anon, authenticated;

create index if not exists order_messages_order_idx on public.order_messages (order_id, created_at asc);

-- Ù‚Ø±Ø§Ø¡Ø© Ø±Ø³Ø§ÙŠÙ„ Ø·Ù„Ø¨ Ù…Ø¹ÙŠÙ† Ø¨Ø£Ù…Ø§Ù† Ù„Ù„Ø²Ø§Ø¦Ø± Ø§Ù„Ø¹Ø§Ø¯ÙŠ (Ø¨ÙŠØ³ÙƒØ³Ù„ ØªØ±Ø§Ø¨Ø· RLS)
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

-- Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¹Ù…ÙŠÙ„ Ø¨Ø§Ù„Ø±Ù‚Ù… (Ù…Ù† ØºÙŠØ± Ù…Ø§ ÙŠÙƒØªØ¨ Ø±Ù‚Ù… Ø§Ù„Ø·Ù„Ø¨) + ØªØ³Ø¬ÙŠÙ„ Ù…ØµØ¯Ø± Ø§Ù„Ø²ÙŠØ§Ø±Ø©
create or replace function public.orders_by_phone(p_phone text)
returns setof public.orders
language sql security definer stable set search_path = public as $$
  select *
  from public.orders o
  where regexp_replace(coalesce(o.phone, ''), '\D', '', 'g') =
        regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')
  order by o.created_at desc;
$$;

revoke all on function public.orders_by_phone(text) from public;
grant execute on function public.orders_by_phone(text) to anon, authenticated;

create or replace function public.set_order_source(p_id text, p_source text)
returns setof public.orders
language sql security definer set search_path = public as $$
  update public.orders o
  set source = coalesce(nullif(p_source, ''), o.source)
  where o.id = p_id
    and (o.source is null or o.source = '')
  returning o.*;
$$;

revoke all on function public.set_order_source(text, text) from public;
grant execute on function public.set_order_source(text, text) to anon, authenticated;

-- لينك شخصي للعميل: توكن من الموبايل يفتح كل طلباته من غير كتابة
create or replace function public.orders_by_token(p_token text)
returns setof public.orders
language sql security definer stable set search_path = public as $$
  select *
  from public.orders o
  where encode(sha256(convert_to('vanilliano|' || regexp_replace(coalesce(o.phone, ''), '\D', '', 'g'), 'UTF8')), 'hex') = lower(coalesce(p_token, ''))
  order by o.created_at desc;
$$;

revoke all on function public.orders_by_token(text) from public;
grant execute on function public.orders_by_token(text) to anon, authenticated;


