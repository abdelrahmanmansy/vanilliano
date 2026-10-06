-- سياسات الوصول لصور الأقسام في Supabase Storage
-- الـbucket عام (public) للعرض، والرفع/التعديل/الحذف للمدير فقط.

drop policy if exists "public read categories images" on storage.objects;
create policy "public read categories images" on storage.objects
  for select using (bucket_id = 'categories');

drop policy if exists "authenticated upload categories images" on storage.objects;
create policy "authenticated upload categories images" on storage.objects
  for insert to authenticated with check (bucket_id = 'categories');

drop policy if exists "authenticated update categories images" on storage.objects;
create policy "authenticated update categories images" on storage.objects
  for update to authenticated
  using (bucket_id = 'categories')
  with check (bucket_id = 'categories');

drop policy if exists "authenticated delete categories images" on storage.objects;
create policy "authenticated delete categories images" on storage.objects
  for delete to authenticated using (bucket_id = 'categories');

select polname, polcmd from pg_policy
 where polrelid = 'storage.objects'::regclass
 order by polname;
