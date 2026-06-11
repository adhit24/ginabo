const nextConfig = {
  experimental: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "www.figma.com" },
    ]
  },
  async headers() {
    return [
      {
        source: '/shop/:slug*',
        headers: [
          { key: 'Cloudflare-CDN-Cache-Control', value: 'public, max-age=3600' },
          { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=3600' },
        ],
      },
      {
        source: '/shop',
        headers: [
          { key: 'Cloudflare-CDN-Cache-Control', value: 'public, max-age=300' },
          { key: 'Cache-Control', value: 'public, max-age=30, stale-while-revalidate=300' },
        ],
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      config.optimization = {
        ...config.optimization,
        minimize: false,
        splitChunks: false,
      };
    }
    return config;
  },
};

export default nextConfig;
