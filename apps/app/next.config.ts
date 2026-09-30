import type { NextConfig } from "next"

// Build trigger: rebuild app to pick up NEXT_PUBLIC_STANDALONE_ORG_KEYS (2026-09-30)
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maturoscope-staging.s3.eu-west-par.io.cloud.ovh.net',
      },
      {
        protocol: 'https',
        hostname: 'maturoscope-s3.s3.gra.io.cloud.ovh.net',
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '4mb',
  },
}

export default nextConfig
