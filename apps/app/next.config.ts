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
  },
  // Moved from experimental - external packages for server components
  serverExternalPackages: [],
  // Improve hot reload stability (only relevant in development)
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000, // Increased to 60 seconds
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5, // Increased buffer
  },
  // Disable static optimization for pages with Server Actions to prevent caching issues
  reactStrictMode: true,
}

export default nextConfig
