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
  // Explicitly disable Server Actions to prevent any Server Action infrastructure
  // Setting bodySizeLimit to 0 completely disables Server Actions
  serverActions: {
    bodySizeLimit: 0, // Disable Server Actions by setting size limit to 0
  },
}

export default nextConfig