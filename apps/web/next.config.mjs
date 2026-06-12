// ─── Security headers applied at the Next.js layer (Vercel also sets these) ──
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(self), payment=(self "https://app.midtrans.com" "https://app.sandbox.midtrans.com")',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // ─── Image domains ───────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // Cloudflare R2 custom domain
      { protocol: 'https', hostname: 'media.ginabo.id' },
      // Cloudflare R2 direct storage URL
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      // Supabase storage (project-specific)
      { protocol: 'https', hostname: 'lvmyjtzfohlorocrjvcx.supabase.co' },
      // Generic Supabase project storage
      { protocol: 'https', hostname: '*.supabase.co' },
      // General CDNs / dev assets
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'www.figma.com' },
    ],
  },

  // ─── HTTP headers ────────────────────────────────────────────────────────────
  async headers() {
    return [
      // Security headers on every route
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
      // Product pages — short Next.js cache, longer Cloudflare CDN cache
      {
        source: '/shop/:slug*',
        headers: [
          { key: 'Cloudflare-CDN-Cache-Control', value: 'public, max-age=3600' },
          { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=3600' },
        ],
      },
      // Shop listing — slightly shorter cache
      {
        source: '/shop',
        headers: [
          { key: 'Cloudflare-CDN-Cache-Control', value: 'public, max-age=300' },
          { key: 'Cache-Control', value: 'public, max-age=30, stale-while-revalidate=300' },
        ],
      },
      // API routes — never cache
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
      // Static assets produced by Next.js build — cache forever (content-hashed)
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // ─── Webpack tweaks ──────────────────────────────────────────────────────────
  webpack: (config, { dev, isServer }) => {
    // Disable cache + minification in dev for faster rebuilds
    if (dev) {
      config.cache = false;
      config.optimization = {
        ...config.optimization,
        minimize: false,
        splitChunks: false,
      };
    }

    // Optional: bundle-analyzer (set ANALYZE=true before next build)
    if (!dev && !isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = /** @type {any} */ (
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('@next/bundle-analyzer')
      )({ enabled: true });
      config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
  },
};

export default nextConfig;
