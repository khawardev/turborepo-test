import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['jotai-devtools'],
  experimental: {
    viewTransition: true,
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

};

export default nextConfig;
