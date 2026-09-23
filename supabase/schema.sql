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

create index if not exists reviews_created_at_idx on public.reviews (created_at desc);