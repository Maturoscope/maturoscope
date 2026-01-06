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
  // Note: NEXT_SERVER_ACTIONS_ENCRYPTION_KEY must be set as an environment variable
  // This ensures consistent Server Action encryption across all OVH server instances
  // Even though we use API Routes instead of Server Actions, Next.js still generates
  // encryption keys internally, and mismatched keys cause "Failed to find Server Action" errors
}

export default nextConfig