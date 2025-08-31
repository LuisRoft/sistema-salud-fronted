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
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: true, // Disable image optimization if not needed
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Cambiado de DENY a SAMEORIGIN para permitir iframes
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://developer.biodigital.com https://human.biodigital.com https://assets-human.biodigital.com",
              "style-src 'self' 'unsafe-inline' https://human.biodigital.com https://assets-human.biodigital.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://human.biodigital.com https://assets-human.biodigital.com",
              "connect-src 'self' https://apis.biodigital.com https://human.biodigital.com https://assets-human.biodigital.com wss://assets-human.biodigital.com https://wily-tawsha-luxtar-7eb4e29c.koyeb.app",
              "frame-src 'self' https://human.biodigital.com",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'"
            ].join('; ')
          },
        ],
      },
    ];
  },
};

export default nextConfig;
