-- profiles had SELECT/UPDATE policies for `authenticated` but no INSERT
-- policy. Client-side signup/Google-login both call .upsert() on profiles,
-- and Postgres requires the INSERT policy to pass for INSERT ... ON
-- CONFLICT DO UPDATE even when the row already exists — so every upsert
-- was rejected by RLS ("new row violates row-level security policy").

CREATE POLICY "profiles: users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());
