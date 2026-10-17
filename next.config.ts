import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Member photos and news covers are sent to server actions as data URLs (up to ~1.5 MB).
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
