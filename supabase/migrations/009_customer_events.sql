CREATE TABLE IF NOT EXISTS public.customer_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  anonymous_session_id TEXT,
  event_name TEXT NOT NULL CHECK (event_name IN ('product_viewed','search_submitted','add_to_cart','remove_from_cart','checkout_started','checkout_completed','payment_failed')),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_events_profile_time ON public.customer_events(profile_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_events_session_time ON public.customer_events(anonymous_session_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_events_name_time ON public.customer_events(event_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_events_product ON public.customer_events(product_id, occurred_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_events_dedupe ON public.customer_events(anonymous_session_id, event_id) WHERE anonymous_session_id IS NOT NULL;

ALTER TABLE public.customer_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer events insert via service role" ON public.customer_events FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "customer events own read" ON public.customer_events FOR SELECT USING (profile_id = auth.uid());
