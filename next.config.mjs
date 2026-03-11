/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      'lucide-react',
      'recharts',
      'date-fns',
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vg-bunny-cdn.b-cdn.net; style-src 'self' 'unsafe-inline' https://vg-bunny-cdn.b-cdn.net https://fonts.googleapis.com; img-src 'self' blob: data: https:; font-src 'self' data: https://vg-bunny-cdn.b-cdn.net https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com https://vg-bunny-cdn.b-cdn.net https://na-cloudflare.vg-stuff.com https://eu-gcp-api.vg-stuff.com https://na-gcp-api.vg-stuff.com wss://na-gcp-api.vg-stuff.com https://firestore.googleapis.com https://voiceglow.org https://*.r2.dev; media-src 'self' https://*.r2.dev; worker-src 'self' blob:; frame-ancestors 'none';",
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // NOTA: Cross-Origin headers deshabilitados temporalmente por compatibilidad con VoiceGlow
          // Se pueden habilitar cuando VoiceGlow soporte CORP/CORS apropiadamente
          // {
          //   key: 'Cross-Origin-Embedder-Policy',
          //   value: 'require-corp',
          // },
          // {
          //   key: 'Cross-Origin-Opener-Policy',
          //   value: 'same-origin-allow-popups',
          // },
          // {
          //   key: 'Cross-Origin-Resource-Policy',
          //   value: 'same-origin',
          // },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || 'https://portal-chia.gov.co',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ]
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
  },

  // Compression
  compress: true,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV !== 'production',
  },

  // ESLint - Removed as it's no longer supported in Next.js 16+

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/tramites',
        permanent: true,
      },
    ]
  },

  // Rewrites for API
  async rewrites() {
    return [
      {
        source: '/api/n8n/:path*',
        destination: 'https://your-n8n-instance.com/:path*',
      },
    ]
  },
}

export default nextConfig
