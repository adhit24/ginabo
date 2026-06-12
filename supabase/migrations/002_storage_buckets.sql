-- ============================================================
-- Ginabo Skincare — Storage Buckets & Policies
-- Migration: 002_storage_buckets.sql
-- Project: lvmyjtzfohlorocrjvcx (ginabo.id)
-- Created: 2026-06-12
-- ============================================================
--
-- NOTE ON CLOUDFLARE R2 + SUPABASE STORAGE
-- =========================================
-- Ginabo uses Cloudflare R2 as the primary CDN/storage backend.
-- Supabase Storage buckets defined here act as the metadata layer
-- for file management (permissions, signed URLs).
--
-- Cloudflare R2 Bucket Configuration (done in Cloudflare Dashboard):
--
--   Bucket Name        Access        Purpose
--   ──────────────────────────────────────────────────────────
--   ginabo-products    Public        Product images (CDN served)
--   ginabo-reviews     Public        Customer review photos
--   ginabo-avatars     Public        User profile photos
--   ginabo-assets      Public        Brand assets, banners
--   ginabo-docs        Private       KTP images, NPWP docs (resellers)
--   ginabo-challenge   Public        21-day challenge progress photos
--
-- Cloudflare R2 Public URL Pattern:
--   https://pub-<hash>.r2.dev/<bucket>/<path>
--   or custom domain: https://assets.ginabo.id/<path>
--
-- Environment variables to set in Supabase Edge Functions:
--   R2_ACCOUNT_ID        = <Cloudflare Account ID>
--   R2_ACCESS_KEY_ID     = <R2 Access Key>
--   R2_SECRET_ACCESS_KEY = <R2 Secret Key>
--   R2_PUBLIC_URL        = https://assets.ginabo.id
--   R2_BUCKET_PRODUCTS   = ginabo-products
--   R2_BUCKET_REVIEWS    = ginabo-reviews
--   R2_BUCKET_AVATARS    = ginabo-avatars
--   R2_BUCKET_ASSETS     = ginabo-assets
--   R2_BUCKET_DOCS       = ginabo-docs
--   R2_BUCKET_CHALLENGE  = ginabo-challenge
--
-- ============================================================

-- ============================================================
-- SUPABASE STORAGE BUCKETS
-- (Supabase manages these; files are synced/proxied to R2
--  via Edge Functions or direct S3-compatible upload)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    (
        'product-images',
        'product-images',
        TRUE,
        5242880,        -- 5 MB max
        ARRAY['image/jpeg','image/png','image/webp','image/gif']
    ),
    (
        'review-photos',
        'review-photos',
        TRUE,
        5242880,        -- 5 MB max
        ARRAY['image/jpeg','image/png','image/webp']
    ),
    (
        'user-avatars',
        'user-avatars',
        TRUE,
        2097152,        -- 2 MB max
        ARRAY['image/jpeg','image/png','image/webp']
    ),
    (
        'brand-assets',
        'brand-assets',
        TRUE,
        10485760,       -- 10 MB max
        ARRAY['image/jpeg','image/png','image/webp','image/svg+xml','application/pdf']
    ),
    (
        'reseller-docs',
        'reseller-docs',
        FALSE,          -- PRIVATE — KTP/NPWP documents
        10485760,       -- 10 MB max
        ARRAY['image/jpeg','image/png','application/pdf']
    ),
    (
        'challenge-photos',
        'challenge-photos',
        TRUE,
        8388608,        -- 8 MB max
        ARRAY['image/jpeg','image/png','image/webp']
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================

-- --------------------------------------------------------
-- product-images (public bucket — admin write, public read)
-- --------------------------------------------------------

CREATE POLICY "product-images: public read"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'product-images');

CREATE POLICY "product-images: admin insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'product-images'
        AND public.is_admin()
    );

CREATE POLICY "product-images: admin update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "product-images: admin delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "product-images: service role full access"
    ON storage.objects FOR ALL
    TO service_role
    USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

-- --------------------------------------------------------
-- review-photos (authenticated upload, public read)
-- --------------------------------------------------------

CREATE POLICY "review-photos: public read"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'review-photos');

CREATE POLICY "review-photos: authenticated upload own folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'review-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "review-photos: users can delete own"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'review-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "review-photos: service role full access"
    ON storage.objects FOR ALL
    TO service_role
    USING (bucket_id = 'review-photos') WITH CHECK (bucket_id = 'review-photos');

-- --------------------------------------------------------
-- user-avatars (user upload to own folder, public read)
-- --------------------------------------------------------

CREATE POLICY "user-avatars: public read"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'user-avatars');

CREATE POLICY "user-avatars: users can upload own avatar"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'user-avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "user-avatars: users can update own avatar"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'user-avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "user-avatars: users can delete own avatar"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'user-avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "user-avatars: service role full access"
    ON storage.objects FOR ALL
    TO service_role
    USING (bucket_id = 'user-avatars') WITH CHECK (bucket_id = 'user-avatars');

-- --------------------------------------------------------
-- brand-assets (admin only write, public read)
-- --------------------------------------------------------

CREATE POLICY "brand-assets: public read"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'brand-assets');

CREATE POLICY "brand-assets: admin write"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'brand-assets' AND public.is_admin());

CREATE POLICY "brand-assets: admin update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'brand-assets' AND public.is_admin());

CREATE POLICY "brand-assets: admin delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'brand-assets' AND public.is_admin());

CREATE POLICY "brand-assets: service role full access"
    ON storage.objects FOR ALL
    TO service_role
    USING (bucket_id = 'brand-assets') WITH CHECK (bucket_id = 'brand-assets');

-- --------------------------------------------------------
-- reseller-docs (PRIVATE — signed URLs only)
-- Resellers upload to their own folder; admins can read all
-- --------------------------------------------------------

CREATE POLICY "reseller-docs: resellers upload own docs"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'reseller-docs'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "reseller-docs: resellers view own docs"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'reseller-docs'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "reseller-docs: admins can view all"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'reseller-docs' AND public.is_admin());

CREATE POLICY "reseller-docs: admins can delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'reseller-docs' AND public.is_admin());

CREATE POLICY "reseller-docs: service role full access"
    ON storage.objects FOR ALL
    TO service_role
    USING (bucket_id = 'reseller-docs') WITH CHECK (bucket_id = 'reseller-docs');

-- --------------------------------------------------------
-- challenge-photos (users upload to own folder, public read)
-- --------------------------------------------------------

CREATE POLICY "challenge-photos: public read"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'challenge-photos');

CREATE POLICY "challenge-photos: users upload own"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'challenge-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "challenge-photos: users update own"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'challenge-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "challenge-photos: users delete own"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'challenge-photos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "challenge-photos: service role full access"
    ON storage.objects FOR ALL
    TO service_role
    USING (bucket_id = 'challenge-photos') WITH CHECK (bucket_id = 'challenge-photos');

-- ============================================================
-- CLOUDFLARE R2 SETUP NOTES (execute in Cloudflare Dashboard)
-- ============================================================
--
-- 1. Create R2 buckets listed above in your Cloudflare account
--    Account ID: see cloudflare-credentials.md
--
-- 2. For each public bucket, enable "Public Access" and set
--    a custom domain under R2 bucket settings:
--    Example: assets.ginabo.id -> R2 public URL
--
-- 3. Create an API token with R2:Edit permissions:
--    Dashboard -> My Profile -> API Tokens -> Create Token
--    - Permission: R2:Edit (specific account)
--    - Copy Access Key ID and Secret Access Key
--
-- 4. Set CORS policy on each public bucket:
--    [
--      {
--        "AllowedOrigins": ["https://ginabo.id", "https://www.ginabo.id"],
--        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
--        "AllowedHeaders": ["*"],
--        "MaxAgeSeconds": 3600
--      }
--    ]
--
-- 5. File path conventions in R2:
--    products/   -> <product-id>/<timestamp>-<slug>.<ext>
--    reviews/    -> <user-id>/<review-id>-<n>.<ext>
--    avatars/    -> <user-id>/avatar.<ext>
--    assets/     -> banners/<name>.<ext> | logos/<name>.<ext>
--    docs/       -> <user-id>/ktp.<ext> | <user-id>/npwp.<ext>
--    challenge/  -> <user-id>/<registration-id>/day-<n>.<ext>
--
-- 6. Upload from Next.js via S3-compatible client:
--    npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
--
--    const s3 = new S3Client({
--      region: "auto",
--      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
--      credentials: {
--        accessKeyId: process.env.R2_ACCESS_KEY_ID,
--        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
--      },
--    });
--
-- 7. Generate pre-signed URLs for private bucket (reseller-docs):
--    const command = new GetObjectCommand({ Bucket: "ginabo-docs", Key: path });
--    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
--
-- ============================================================
-- END OF MIGRATION 002
-- ============================================================
