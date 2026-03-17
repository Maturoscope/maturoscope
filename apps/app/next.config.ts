import type { NextConfig } from "next"

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
