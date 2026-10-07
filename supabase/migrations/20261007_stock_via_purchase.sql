-- ============================================================
-- ربط المخزون بالطلبات: ترحيل 2026-10-07
-- دالة decrement_stock تنقص كمية المنتج بأمان (بحد أدنى صفر)
-- security definer حتى تشتغل من المتجر واللوحة (دور anon)
-- ============================================================

create or replace function public.decrement_stock(p_id text, p_qty integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining integer;
begin
  update products
     set qty = greatest(coalesce(qty, 0) - greatest(coalesce(p_qty, 0), 0), 0)
   where id = p_id
  returning qty into v_remaining;
  return coalesce(v_remaining, 0);
end;
$$;

revoke execute on function public.decrement_stock(text, integer) from public;
grant execute on function public.decrement_stock(text, integer) to anon, authenticated;