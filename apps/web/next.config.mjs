const nextConfig = {
  experimental: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" }
    ]
  }
};

export default nextConfig;
