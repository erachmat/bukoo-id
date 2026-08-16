import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is required by @opennextjs/cloudflare (runs in workerd).
  output: "standalone",
  transpilePackages: ["@bukoo/shared-types"],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
