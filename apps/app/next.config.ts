import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maturoscope-staging.s3.eu-west-par.io.cloud.ovh.net',
      },
    ],
  },
  // Fix for Server Actions in development and production
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      // Allow server actions to be called from client
      allowedOrigins: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8000',
        'https://app.staging.synopp.io',
        'https://staging.synopp.io',
        'https://api.staging.synopp.io',
        // Also include without protocol for flexibility
        'localhost:3000',
        'localhost:3001',
        'localhost:8000',
        'app.staging.synopp.io',
        'staging.synopp.io',
        'api.staging.synopp.io',
        process.env.FRONTEND_URL,
        process.env.APP_URL,
        process.env.API_URL,
      ].filter(Boolean) as string[],
    },
    // Disable server components cache to prevent stale Server Actions
    // This helps with hot reload issues in development
    optimizePackageImports: [],
    // Disable static page generation for pages with Server Actions
    // This prevents the server from caching Server Actions incorrectly
    serverComponentsHmrCache: false,
  },
  // Moved from experimental - external packages for server components
  serverExternalPackages: [],
  // Improve hot reload stability and prevent Server Action cache issues
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    // Reduced to prevent stale Server Actions from being cached
    maxInactiveAge: 30 * 1000, // 30 seconds (reduced from 60)
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 3, // Reduced buffer to prevent memory issues
  },
  // Disable static optimization for pages with Server Actions to prevent caching issues
  reactStrictMode: true,
  
  // Production optimizations to prevent Server Action issues
  swcMinify: true, // Enable SWC minification for better performance
}

export default nextConfig
