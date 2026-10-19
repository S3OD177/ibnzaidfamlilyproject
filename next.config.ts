import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uploaded images have mutable access rules; the optimizer cannot cache or proxy them.
  images: { unoptimized: true },
  experimental: {
    // Member photos and news covers are sent to server actions as data URLs (up to ~1.5 MB).
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
