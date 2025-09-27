/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for better deployment compatibility
  output: 'standalone',
  
  // Optimize images
  images: {
    domains: [
      'supabase.com', 
      'your-supabase-project.supabase.co',
      'images.unsplash.com',
      'picsum.photos'
    ],
    unoptimized: true // For static export compatibility
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },

  // Environment variables available to client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Webpack configuration for better builds
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },

  // Experimental features
  experimental: {
    // Enable server components optimizations
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },

  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health',
      },
    ];
  }
};

module.exports = nextConfig;