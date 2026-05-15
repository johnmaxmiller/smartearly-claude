import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["googleapis"],
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

export default nextConfig;
