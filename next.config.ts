import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root (there are stray lockfiles higher up the tree).
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Admins paste arbitrary product image URLs from the panel, so allow any
    // https host. Local uploads are served from /uploads (same origin).
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
