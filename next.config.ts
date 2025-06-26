import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["picsum.photos"],
  },
  // Configure static file serving for large audio files
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB
  },
  // Headers for audio files
  async headers() {
    return [
      {
        source: "/songs/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Accept-Ranges",
            value: "bytes",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
