-- ============================================================
-- (1) جدول الأقسام — عشان الأقسام تتدارك وتتضاف من الداشبورد
-- ============================================================
create table if not exists public.categories (
  id text primary key,
  slug text not null unique,
  name text not null,
  tagline text default '',
  description text default '',
  icon text default 'Sparkles',
  image text default '',
  color text default '#db8c33',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "public can view categories" on public.categories;
create policy "public can view categories" on public.categories
  for select using (true);

drop policy if exists "authenticated manage categories" on public.categories;
create policy "authenticated manage categories" on public.categories
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

grant select on table public.categories to anon, authenticated;
grant insert, update, delete on table public.categories to authenticated;

-- ترتيب العرض في الموقع
create index if not exists categories_sort_idx on public.categories (sort_order asc);

-- ============================================================
-- (2) كمية المخزون لكل منتج — صفر = غير متوفر
-- ============================================================
alter table public.products add column if not exists qty integer;

-- ============================================================
-- (3) ترحيل الأقسام الخمسة الحالية من src/data/categories.js
-- ============================================================
insert into public.categories (id, slug, name, tagline, description, icon, image, color, sort_order)
values
  ('baking', 'baking-supplies', 'خامات الحلويات والكيك', 'خامات أصلية لصنع ألذ الحلويات',
   'كل ما تحتاجه لتحضير الكيك والحلويات: طحين خاص، كريمة، شوكولاتة، ألوان طعام، قوالب وأدوات التزيين.',
   'Cake', '/vanilliano/images/categories/baking-supplies.jpg', '#db8c33', 1),
  ('candy', 'candy-sweets', 'الكاندي والحلويات', 'كنز من السكاكر والحلويات الفاخرة',
   'تشكيلة واسعة من الكاندي، الجيلي، المارشميلو، اللولي والدراج الفاخر لتزيين حلوياتك وصناديقك.',
   'Candy', '/vanilliano/images/categories/candy-sweets.jpg', '#c64e60', 2),
  ('birthday', 'birthday', 'مستلزمات أعياد الميلاد', 'اجعل يوم ميلادك يوماً لا يُنسى',
   'زينات، بالونات، شموع مميزة، تيجان وأدوات تزيين طاولة تجعل حفلة الميلاد أجمل وأمتع.',
   'PartyPopper', '/vanilliano/images/categories/birthday.jpg', '#c64e60', 3),
  ('party', 'party-supplies', 'مستلزمات الحفلات', 'كل ما يجعل حفلتك ممتعة ومميزة',
   'أدوات مائدة تجريبية أنيقة، بالونات، رولات خلفيات، مغناطيسات وألعاب حفلات بجودة عالية.',
   'Sparkles', '/vanilliano/images/categories/party-supplies.jpg', '#e4a44f', 4),
  ('packaging', 'packaging-gifts', 'التغليف والهدايا', 'صناديق وأشرطة تغليف تليق بمنتجاتك',
   'صناديق كيك وهدايا، أكياس شفافة، شرائط ساتان، كروت هدايا وأدوات تغليف احترافية.',
   'Gift', '/vanilliano/images/categories/packaging-gifts.jpg', '#a35920', 5)
on conflict (id) do nothing;

-- ============================================================
-- (4) إعطاء كل منتج كمية افتراضية مبنية على حالته الحالية
--     (in = 50 | limited = 5 | out = 0) عشان مفيش منتج يفضل فاضي
-- ============================================================
update public.products
set qty = case
  when qty is not null then qty
  when stock = 'out' then 0
  when stock = 'limited' then 5
  else 50
end
where qty is null;

-- ============================================================
-- (5) دالة: هل الكمية المطلوبة متوفرة؟ (للاستعمال في السلة)
-- ============================================================
create or replace function public.product_qty(p_id text)
returns integer
language sql stable security definer set search_path = public as $$
  select coalesce((select qty from public.products where id = p_id), 50);
$$;

revoke all on function public.product_qty(text) from public;
grant execute on function public.product_qty(text) to anon, authenticated;
