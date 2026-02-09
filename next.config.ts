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
  // Optimize build for Electron
  webpack: (config, { isServer }) => {
    // Externalize electron in renderer to avoid bundling it twice
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        electron: "require('electron')",
      });
    }
    return config;
  },
  // Production optimizations
  ...(process.env.NODE_ENV === "production" && {
    compiler: {
      removeConsole: true,
    },
    experimental: {
      optimizeCss: true,
    },
  }),
};

export default nextConfig;
