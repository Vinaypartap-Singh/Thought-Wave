import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/**"
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",

      }
    ]
  }
};

export default nextConfig;
