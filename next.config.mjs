/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.cloudflare.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    // sharp's libvips-cpp.so is loaded via dlopen at runtime, which
    // Next.js's static file tracer can't detect — without this, Vercel
    // drops it from the deployed function and sharp throws ERR_DLOPEN_FAILED.
    outputFileTracingIncludes: {
      '/api/seller/listings/**': [
        './node_modules/@img/sharp-libvips-linux-x64/**/*',
        './node_modules/@img/sharp-linux-x64/**/*',
      ],
    },
  },
}

export default nextConfig;
