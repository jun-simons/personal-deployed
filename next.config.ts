import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 public dev subdomain for the js-photos bucket.
      // If you swap to a custom domain, add its hostname here too.
      {
        protocol: 'https',
        hostname: 'pub-bb04075bc6114410b857851b2068ad83.r2.dev',
      },
    ],
  },
};


export default nextConfig;
