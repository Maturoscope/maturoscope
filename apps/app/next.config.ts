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
  // Fix for Server Actions in development
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      // Allow server actions to be called from client
      allowedOrigins: ['localhost:3000', 'app.staging.synopp.io'],
    },
    // Disable server components cache to prevent stale Server Actions
    serverComponentsExternalPackages: [],
  },
  // Improve hot reload stability
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
