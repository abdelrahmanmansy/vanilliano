-- Vanilliano - مخطط قاعدة بيانات Supabase
-- شغّل ده في Supabase Dashboard -> SQL Editor ثم Run

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

-- أي شخص (الزوار) يقدر يقرأ المنتجات
drop policy if exists "public can view products" on public.products;
create policy "public can view products" on public.products
  for select using (true);

-- صاحب المتجر (المسجل دخوله) يقدر يضيف/يعدّل/يمسح
drop policy if exists "authenticated manage products" on public.products;
create policy "authenticated manage products" on public.products
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

grant select on table public.products to anon, authenticated;
grant insert, update, delete on table public.products to authenticated;

-- ============================================================
-- آراء العملاء (reviews)
-- ============================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'عميل فانيليانو',
  text text not null,
  rating smallint not null default 5 check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- الزوار يقرأون ويضيفون رأياً (فورم الحوار العام)
drop policy if exists "public can view reviews" on public.reviews;
create policy "public can view reviews" on public.reviews
  for select using (true);

drop policy if exists "public can insert reviews" on public.reviews;
create policy "public can insert reviews" on public.reviews
  for insert with check (true);

grant select, insert on table public.reviews to anon, authenticated;

-- صاحب المتجر بيوافق/يعدل/يمسح الآراء من لوحة التحكم
drop policy if exists "auth can moderate reviews" on public.reviews;
create policy "auth can moderate reviews" on public.reviews
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

grant update, delete on table public.reviews to authenticated;

create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

-- الموافقة على عرض الرأي قبل النشر (قياساً على طلبك)
alter table public.reviews add column if not exists "approved" boolean not null default false;

-- ============================================================
-- الطلبات (orders)
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
  "status" text not null default 'جديد',
  "created_at" timestamptz not null default now(),
  "completed_at" timestamptz
);

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
-- سجل النشاط (activity)
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
-- رسائل التواصل (messages)
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
-- الأكثر مبيعاً (top_sellers) — دالة آمنة لقراءة الزائر
-- بتحسب الكميات والإيرادات من الطلبات، والأونر بايبا عن RLS
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
  where status is distinct from 'ملغي'
  group by it->>'id', it->>'name'
  order by qty desc
  limit max_count;
$$;

revoke all on function public.top_sellers(int) from public;
grant execute on function public.top_sellers(int) to anon, authenticated;

-- ============================================================
-- خصم أول طلب للعضو المسجل — دالة آمنة للزائر
-- بترجع 26 لو الأيميل ما عندهوش طلبات قبله (غير ملغي) و 0 غير كده
-- ============================================================
create or replace function public.first_order_discount(p_email text)
returns numeric
language sql security definer stable as $$
  select case
    when p_email is null or btrim(p_email) = '' then 0
    when exists (
      select 1 from public.orders
      where lower(email) = lower(btrim(p_email))
        and status is distinct from 'ملغي'
    ) then 0
    else 26
  end;
$$;

revoke all on function public.first_order_discount(text) from public;
grant execute on function public.first_order_discount(text) to anon, authenticated;

-- ============================================================
-- طلبات العميل (قائمة الأوردرات بالبريد) — دالة آمنة للزائر
-- بترجع طلبات العميل باسمه والمنتجات والإجمالي والحالة بس
-- (من غير موبايل/عنوان كامل لتقليل التعرض)
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