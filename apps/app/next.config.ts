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
  },
  // Improve hot reload stability
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

export default nextConfig
