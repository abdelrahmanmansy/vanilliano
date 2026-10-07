select 'decrement_stock_fn' as item, count(*)::text as v from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='decrement_stock'
union all select 'cleanup_activity_fn', count(*)::text from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='cleanup_activity'
union all select 'cleanup_cron_active', count(*)::text from cron.job where jobname='activity-cleanup-daily' and active
union all select 'cron_schedule', schedule from cron.job where jobname='activity-cleanup-daily'
union all select 'orders.discount', count(*)::text from information_schema.columns where table_schema='public' and table_name='orders' and column_name='discount'
union all select 'orders.subtotal', count(*)::text from information_schema.columns where table_schema='public' and table_name='orders' and column_name='subtotal'
union all select 'rls.activity', count(*)::text from pg_tables where schemaname='public' and tablename='activity' and rowsecurity
union all select 'rls.cleanup_notices', count(*)::text from pg_tables where schemaname='public' and tablename='cleanup_notices' and rowsecurity
union all select 'rls.store_settings', count(*)::text from pg_tables where schemaname='public' and tablename='store_settings' and rowsecurity
union all select 'rls.products', count(*)::text from pg_tables where schemaname='public' and tablename='products' and rowsecurity
union all select 'rls.orders', count(*)::text from pg_tables where schemaname='public' and tablename='orders' and rowsecurity
