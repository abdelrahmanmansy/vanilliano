-- ============================================================
--  فانيليانو: إعداد قاعدة بيانات Supabase
--  انفّذ هذا الملف مرة واحدة من: Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1) جدول المنتجات
create table if not exists public.products (
  id text primary key,
  name text not null default '',
  category text not null default 'baking',
  price numeric not null default 0,
  "oldPrice" numeric default 0,
  rating numeric default 4.5,
  reviews integer default 0,
  stock text default 'in',
  badge text,
  image text,
  description text,
  highlights jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) تفعيل Row Level Security
alter table public.products enable row level security;

-- 3) صاحب المتجر فقط هو المخوّل بالكتابة (هو اللي مسجّل كـ authenticated user في Supabase Auth)
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
  on public.products for select
  using (true);

drop policy if exists "products_insert_owner" on public.products;
create policy "products_insert_owner"
  on public.products for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "products_update_owner" on public.products;
create policy "products_update_owner"
  on public.products for update
  using (auth.role() = 'authenticated');

drop policy if exists "products_delete_owner" on public.products;
create policy "products_delete_owner"
  on public.products for delete
  using (auth.role() = 'authenticated');

-- 4) إنشاء حساب صاحب المتجر (اختياري — يمكن إنشاؤه من Authentication -> Users)
-- insert into auth.users ... يتم من لوحة التحكم مباشرة أو من صفحة التسجيل.

-- 5) تحديث updated_at تلقائياً
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();