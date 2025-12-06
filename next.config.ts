import type { NextConfig } from "next";

// Trigger rebuild

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.openfoodfacts.org',
      },
      {
        protocol: 'https',
        hostname: 'static.openfoodfacts.org',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  turbopack: {
    root: '/Users/moussa/.claude-worktrees/lym/pensive-davinci',
  },
};

export default nextConfig;
