import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "out",
  assetPrefix: process.env.NODE_ENV === "production" ? "./" : undefined,
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes for proper routing
  trailingSlash: true,
};

export default nextConfig;
