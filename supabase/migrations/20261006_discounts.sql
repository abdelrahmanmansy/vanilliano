-- ============================================================
-- خصم الطلبات: ترحيل 2026-10-06
-- 1) عمود discount في orders (يُستخدم للخصم اليدوي + التلقائي)
-- 2) جدول store_settings لتفعيل "خصم عند حد مبلغ" تلقائي على المتجر
-- ============================================================

alter table public.orders add column if not exists discount numeric not null default 0;
alter table public.orders add column if not exists subtotal numeric;

create table if not exists public.store_settings (
  "key" text primary key,
  "value" jsonb not null default '{}'::jsonb,
  "updated_at" timestamptz not null default now()
);

alter table public.store_settings enable row level security;

drop policy if exists "anon can read store settings" on public.store_settings;
create policy "anon can read store settings" on public.store_settings
  for select using (true);

drop policy if exists "auth can manage store settings" on public.store_settings;
create policy "auth can manage store settings" on public.store_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');