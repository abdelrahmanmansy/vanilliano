-- ============================================================
-- خصم المخزون تلقائياً عند تسجيل الطلب: ترحيل 2026-10-06
-- الهدف: أول ما يُسجَّل طلب (من المتجر أو من لوحة التحكم)،
-- يقل `qty` المنتج بقيمة `quantity` الموجودة في items.
-- => المخزون مربوط بالطلبات مباشرة في قاعدة البيانات.
-- ============================================================

create or replace function public.decrement_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
begin
  if NEW.items is null or jsonb_array_length(NEW.items) = 0 then
    return NEW;
  end if;

  for item in select * from jsonb_array_elements(NEW.items)
  loop
    update public.products
      set qty = greatest(coalesce(qty, 0) - coalesce((item->>'quantity')::int, 0), 0)
     where id = item->>'id';
  end loop;

  return NEW;
end;
$$;

drop trigger if exists trg_decrement_stock on public.orders;
create trigger trg_decrement_stock
  after insert on public.orders
  for each row execute function public.decrement_stock();