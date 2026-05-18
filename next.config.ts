import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "work.phpwebsites.in",
        pathname: "/gobite/photos/**",
      },
      {
        protocol: "https",
        hostname: "work.phpwebsites.in",
        pathname: "/gobite/photos/**",
      },
    ],
  },
};

export default nextConfig;
