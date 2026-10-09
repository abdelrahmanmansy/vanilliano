-- ============================================================
-- تأمين قاعدة البيانات — ترحيل 2026-10-08
-- شغّل الملف ده كله مرة واحدة في: Supabase Dashboard -> SQL Editor -> Run
-- (آمن للتكرار)
--
-- اللي بيعمله:
--   1) صلاحيات الأدمن بقت لإيميل صاحب المتجر بس (مش لأي حد مسجل دخول)
--   2) قفل الدوال اللي كانت بتكشف بيانات العملاء (موبايل/إيميل/عنوان)
--   3) توكن "كل طلباتك" بقى سري (ملح عشوائي على السيرفر) بدل sha256 للموبايل
--   4) منع الزوار من: تصفير المخزون، انتحال صفة المتجر في المحادثة،
--      الموافقة على تقييماتهم بنفسهم، قراءة قائمة الـVIP، تعديل إشعارات التنظيف
--   5) خصم المخزون بقى trigger واحد على الطلب (بدل الخصم المكرر من المتصفح)
-- ============================================================

-- ------------------------------------------------------------
-- (0) مخطط خاص مش ظاهر في الـAPI: الأدمنز + الأسرار
-- ------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.admins (
  email text primary key
);

insert into private.admins (email)
values ('abdelrahmanahmedmansy@gmail.com')
on conflict (email) do nothing;

create table if not exists private.app_secrets (
  key text primary key,
  value text not null
);

-- ملح عشوائي (حوالي 244 بت) لتوكن العميل — بيتولد مرة واحدة ومحدش يشوفه
insert into private.app_secrets (key, value)
values (
  'customer_token_salt',
  replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
)
on conflict (key) do nothing;

-- هل المستخدم الحالي هو صاحب المتجر؟
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public, private as $$
  select exists (
    select 1 from private.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- توكن العميل = sha256(ملح سري | أرقام الموبايل)
create or replace function private.phone_token(p_phone text)
returns text
language sql stable security definer set search_path = public, private as $$
  select case
    when regexp_replace(coalesce(p_phone, ''), '\D', '', 'g') = '' then null
    else encode(sha256(convert_to(
      (select value from private.app_secrets where key = 'customer_token_salt')
        || '|' || regexp_replace(p_phone, '\D', '', 'g'),
      'UTF8')), 'hex')
  end;
$$;

revoke all on function private.phone_token(text) from public;

-- هل الطلب موجود؟ (definer عشان الزائر مش بيقدر يقرا جدول orders)
create or replace function public.order_exists(p_id text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.orders where id = p_id);
$$;

revoke all on function public.order_exists(text) from public;
grant execute on function public.order_exists(text) to anon, authenticated;

-- ------------------------------------------------------------
-- (1) مسح كل السياسات القديمة على الجداول دي وإعادة بنائها
-- ------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'products', 'categories', 'reviews', 'orders', 'activity', 'messages',
        'order_messages', 'store_settings', 'cleanup_notices'
      )
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- ---- المنتجات والأقسام: الكل يقرا، الأدمن بس يكتب
create policy "public read products" on public.products for select using (true);
create policy "admin manage products" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

create policy "public read categories" on public.categories for select using (true);
create policy "admin manage categories" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.products, public.categories from anon, authenticated;
grant select on table public.products, public.categories to anon, authenticated;
grant insert, update, delete on table public.products, public.categories to authenticated;

-- ---- التقييمات: الزائر يشوف الموافَق عليه بس، ويضيف تقييم "غير موافَق"
create policy "public read approved reviews" on public.reviews for select
  using (approved = true or public.is_admin());
create policy "public submit review" on public.reviews for insert
  with check (
    approved = false
    and char_length(coalesce(name, '')) <= 80
    and char_length("text") between 1 and 2000
  );
create policy "admin manage reviews" on public.reviews for all
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.reviews from anon, authenticated;
grant select, insert on table public.reviews to anon, authenticated;
grant update, delete on table public.reviews to authenticated;

-- ---- الطلبات: الزائر يضيف طلب جديد بس (من غير ما يقرا أو يعدل)
create policy "public place order" on public.orders for insert
  with check (
    coalesce(status, 'جديد') in ('جديد', 'بانتظار التأكيد')
    and coalesce(total, 0) >= 0
    and coalesce(discount, 0) >= 0
    and completed_at is null
  );
create policy "admin manage orders" on public.orders for all
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.orders from anon, authenticated;
grant insert on table public.orders to anon, authenticated;
grant select, update, delete on table public.orders to authenticated;

-- ---- سجل النشاط: الزائر يضيف بس، الأدمن يقرا ويمسح
create policy "public add activity" on public.activity for insert
  with check (char_length(label) <= 500);
create policy "admin manage activity" on public.activity for all
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.activity from anon, authenticated;
grant insert on table public.activity to anon, authenticated;
grant select, delete on table public.activity to authenticated;

-- ---- رسائل التواصل
create policy "public send message" on public.messages for insert
  with check (replied = false and reply is null and char_length(message) <= 5000);
create policy "admin manage messages" on public.messages for all
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.messages from anon, authenticated;
grant insert on table public.messages to anon, authenticated;
grant select, update, delete on table public.messages to authenticated;

-- ---- محادثة الطلب: العميل يبعت كـ customer بس وعلى طلب موجود فعلاً
create policy "customer send order message" on public.order_messages for insert
  with check (
    sender = 'customer'
    and seen = false
    and char_length(body) between 1 and 2000
    and public.order_exists(order_id)
  );
create policy "admin manage order messages" on public.order_messages for all
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.order_messages from anon, authenticated;
grant insert on table public.order_messages to anon, authenticated;
grant select, update, delete on table public.order_messages to authenticated;

-- ---- إعدادات المتجر: الكل يقرا ماعدا قائمة الـVIP
create policy "public read store settings" on public.store_settings for select
  using (key <> 'vip_customers' or public.is_admin());
create policy "admin manage store settings" on public.store_settings for all
  using (public.is_admin()) with check (public.is_admin());

revoke all on table public.store_settings from anon, authenticated;
grant select on table public.store_settings to anon, authenticated;
grant insert, update, delete on table public.store_settings to authenticated;

-- ---- إشعارات التنظيف: للأدمن بس
do $$
begin
  if to_regclass('public.cleanup_notices') is not null then
    execute 'create policy "admin manage cleanup notices" on public.cleanup_notices for all
             using (public.is_admin()) with check (public.is_admin())';
    execute 'revoke all on table public.cleanup_notices from anon, authenticated';
    execute 'grant select, update on table public.cleanup_notices to authenticated';
  end if;
end $$;

-- ---- صور الأقسام في Storage: الرفع/التعديل/الحذف للأدمن بس
drop policy if exists "authenticated upload categories images" on storage.objects;
drop policy if exists "authenticated update categories images" on storage.objects;
drop policy if exists "authenticated delete categories images" on storage.objects;
drop policy if exists "admin upload categories images" on storage.objects;
drop policy if exists "admin update categories images" on storage.objects;
drop policy if exists "admin delete categories images" on storage.objects;

create policy "admin upload categories images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'categories' and public.is_admin());
create policy "admin update categories images" on storage.objects
  for update to authenticated
  using (bucket_id = 'categories' and public.is_admin())
  with check (bucket_id = 'categories' and public.is_admin());
create policy "admin delete categories images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'categories' and public.is_admin());

-- ------------------------------------------------------------
-- (2) المخزون: خصم واحد بس عن طريق trigger على إضافة الطلب
--     (المتصفح ما بقاش بينادي decrement_stock — كان بيخصم مرتين)
-- ------------------------------------------------------------
drop trigger if exists trg_decrement_stock on public.orders;
drop function if exists public.decrement_stock();

create or replace function public.orders_decrement_stock()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  item jsonb;
  q int;
begin
  if NEW.items is null or jsonb_typeof(NEW.items) <> 'array' then
    return NEW;
  end if;
  for item in select * from jsonb_array_elements(NEW.items)
  loop
    begin
      q := coalesce((item ->> 'quantity')::int, 0);
    exception when others then
      q := 0;
    end;
    if q between 1 and 1000 then
      update public.products
         set qty = greatest(coalesce(qty, 0) - q, 0)
       where id = item ->> 'id';
    end if;
  end loop;
  return NEW;
end;
$$;

drop trigger if exists trg_orders_decrement_stock on public.orders;
create trigger trg_orders_decrement_stock
  after insert on public.orders
  for each row execute function public.orders_decrement_stock();

-- الدالة القديمة: للأدمن بس (مش للزوار)
do $$
begin
  if to_regprocedure('public.decrement_stock(text, integer)') is not null then
    execute 'revoke execute on function public.decrement_stock(text, integer) from public, anon, authenticated';
  end if;
end $$;

-- ------------------------------------------------------------
-- (3) دوال التتبع — من غير كشف بيانات العملاء
-- ------------------------------------------------------------

-- "طلباتي بالإيميل" — كانت بتجيب طلبات أي إيميل. اتشالت.
drop function if exists public.my_orders(text);

-- "طلباتي بالموبايل" — بقت محتاجة الموبايل + رقم طلب واحد على الأقل من نفس الموبايل
drop function if exists public.orders_by_phone(text);
create or replace function public.orders_by_phone(p_phone text, p_order_id text)
returns setof public.orders
language sql stable security definer set search_path = public as $$
  select o.*
  from public.orders o
  where regexp_replace(coalesce(p_phone, ''), '\D', '', 'g') <> ''
    and regexp_replace(coalesce(o.phone, ''), '\D', '', 'g') =
        regexp_replace(p_phone, '\D', '', 'g')
    and exists (
      select 1 from public.orders k
      where k.id = btrim(coalesce(p_order_id, ''))
        and regexp_replace(coalesce(k.phone, ''), '\D', '', 'g') =
            regexp_replace(p_phone, '\D', '', 'g')
    )
  order by o.created_at desc;
$$;

revoke all on function public.orders_by_phone(text, text) from public;
grant execute on function public.orders_by_phone(text, text) to anon, authenticated;

-- "كل طلباتك" بالتوكن السري
create or replace function public.orders_by_token(p_token text)
returns setof public.orders
language sql stable security definer set search_path = public, private as $$
  select o.*
  from public.orders o
  where char_length(coalesce(p_token, '')) = 64
    and private.phone_token(o.phone) = lower(p_token)
  order by o.created_at desc;
$$;

revoke all on function public.orders_by_token(text) from public;
grant execute on function public.orders_by_token(text) to anon, authenticated;

-- العميل ياخد توكنه بعد ما يعمل طلب (لازم يعرف رقم الطلب + الموبايل بتاعه)
create or replace function public.customer_token(p_order_id text, p_phone text)
returns text
language sql stable security definer set search_path = public, private as $$
  select private.phone_token(o.phone)
  from public.orders o
  where o.id = btrim(coalesce(p_order_id, ''))
    and regexp_replace(coalesce(p_phone, ''), '\D', '', 'g') <> ''
    and regexp_replace(coalesce(o.phone, ''), '\D', '', 'g') =
        regexp_replace(p_phone, '\D', '', 'g')
  limit 1;
$$;

revoke all on function public.customer_token(text, text) from public;
grant execute on function public.customer_token(text, text) to anon, authenticated;

-- لوحة التحكم: توكن أي عميل من موبايله (للأدمن بس)
create or replace function public.admin_customer_token(p_phone text)
returns text
language plpgsql stable security definer set search_path = public, private as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  return private.phone_token(p_phone);
end;
$$;

revoke all on function public.admin_customer_token(text) from public;
grant execute on function public.admin_customer_token(text) to authenticated;

-- تتبع برقم الطلب: من غير العنوان، والاسم الأول بس
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
language sql stable security definer set search_path = public as $$
  select o.id, o.created_at, o.items, o.total, o.status, o.payment_method, o.note,
         split_part(btrim(coalesce(o.name, '')), ' ', 1) as name,
         o.city,
         null::text as address
  from public.orders o
  where o.id = btrim(coalesce(p_id, ''))
  limit 1;
$$;

revoke all on function public.track_order(text) from public;
grant execute on function public.track_order(text) to anon, authenticated;

create or replace function public.order_messages_for(p_order_id text)
returns table (
  id uuid,
  order_id text,
  sender text,
  body text,
  seen boolean,
  created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select m.id, m.order_id, m.sender, m.body, m.seen, m.created_at
  from public.order_messages m
  where m.order_id = btrim(coalesce(p_order_id, ''))
  order by m.created_at asc;
$$;

revoke all on function public.order_messages_for(text) from public;
grant execute on function public.order_messages_for(text) to anon, authenticated;

-- ------------------------------------------------------------
-- (4) مزايا الـVIP: الزائر يعرف مزايا الإيميل اللي كتبه بس (مش القائمة كلها)
-- ------------------------------------------------------------
create or replace function public.vip_perks(p_email text)
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce((
    select jsonb_build_object(
      'freeShipping', coalesce((v ->> 'freeShipping')::boolean, false),
      'discount', least(greatest(coalesce((v ->> 'discount')::numeric, 0), 0), 100)
    )
    from public.store_settings s,
         lateral jsonb_array_elements(
           case when jsonb_typeof(s.value) = 'array' then s.value else '[]'::jsonb end
         ) v
    where s.key = 'vip_customers'
      and btrim(coalesce(p_email, '')) <> ''
      and lower(btrim(v ->> 'email')) = lower(btrim(p_email))
    limit 1
  ), '{"freeShipping": false, "discount": 0}'::jsonb);
$$;

revoke all on function public.vip_perks(text) from public;
grant execute on function public.vip_perks(text) to anon, authenticated;

-- ------------------------------------------------------------
-- (5) باقي الدوال الـdefiner: تثبيت search_path
-- ------------------------------------------------------------
alter function public.top_sellers(int) set search_path = public;
alter function public.first_order_discount(text) set search_path = public;
