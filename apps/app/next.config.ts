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
}

export default nextConfig
