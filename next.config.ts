import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  assetPrefix: process.env.NODE_ENV === "production" ? "/" : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Ensure trailing slashes for proper routing
  trailingSlash: true,
};

export default nextConfig;
