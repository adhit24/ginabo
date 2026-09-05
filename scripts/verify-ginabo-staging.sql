-- Jalankan di Supabase SQL Editor project Ginabo STAGING.

-- 1. Migration history
SELECT version, name
FROM supabase_migrations.schema_migrations
WHERE version IN ('007', '008', '009', '010')
ORDER BY version;

-- 2. Tabel/kolom penting
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'orders' AND column_name IN ('payment_fee', 'shipping_weight_grams', 'checkout_idempotency_key', 'inventory_decremented_at'))
    OR (table_name = 'payments' AND column_name IN ('provider_transaction_id', 'gross_amount', 'invoice_number', 'checkout_url', 'raw_notification'))
    OR table_name = 'customer_events'
  )
ORDER BY table_name, column_name;

-- 3. RPC fulfillment
SELECT routine_schema, routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'fulfill_paid_order';

-- 4. RLS customer_events
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relname = 'customer_events';

-- 5. Analytics views
SELECT table_schema, table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('customer_rfm_summary', 'product_affinity_summary');
