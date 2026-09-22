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