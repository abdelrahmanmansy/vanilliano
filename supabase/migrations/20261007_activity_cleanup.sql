-- ============================================================
-- تنظيف سجل النشاط تلقائياً كل 90 يوم + رسالة تعريفية قبل الحذف
-- ترحيل 2026-10-07
-- آلية العمل:
--   1) دالة cleanup_activity() تحسب الأحداث الأقدم من 90 يوم
--   2) تسجّل إشعاراً (cleanup_notices) أولاً — "الرسالة التعريفية"
--   3) بعدها تحذف الأحداث القديمة
--   4) pg_cron يشغّلها يومياً؛ اللوحة تعرض الإشعار + زر إرسال على واتساب
-- ============================================================

create table if not exists public.cleanup_notices (
  id bigint generated always as identity primary key,
  batch_count integer not null default 0,
  batch_date text,
  created_at timestamptz not null default now(),
  seen boolean not null default false
);

alter table public.cleanup_notices enable row level security;

drop policy if exists cleanup_notices_anon_read on public.cleanup_notices;
create policy cleanup_notices_anon_read on public.cleanup_notices
  for select using (true);

drop policy if exists cleanup_notices_anon_update on public.cleanup_notices;
create policy cleanup_notices_anon_update on public.cleanup_notices
  for update using (true) with check (true);

-- الإشعارات تُنشأ من دالة definer فقط (لا إدراج مباشر)
drop policy if exists cleanup_notices_definer_write on public.cleanup_notices;
create policy cleanup_notices_definer_write on public.cleanup_notices
  for insert with check (false);

create or replace function public.cleanup_activity()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cutoff timestamptz := now() - interval '90 days';
  v_count integer;
begin
  select count(*) into v_count
    from public.activity
   where created_at < v_cutoff
     and coalesce(kind, '') <> 'cleanup_notice';

  if v_count > 0 then
    insert into public.cleanup_notices (batch_count, batch_date)
    values (v_count, to_char(v_cutoff, 'YYYY-MM-DD'));

    delete from public.activity
     where created_at < v_cutoff
       and coalesce(kind, '') <> 'cleanup_notice';
  end if;

  return v_count;
end;
$$;

-- تنقية الجدولة وإعادة تثبيتها (قابلة للتكرار بأمان)
select cron.unschedule(jobid) from cron.job where jobname = 'activity-cleanup-daily';
select cron.schedule('activity-cleanup-daily', '30 3 * * *', 'select public.cleanup_activity();');