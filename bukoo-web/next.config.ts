import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bukoo/shared-types"],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
