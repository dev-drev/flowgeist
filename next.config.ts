import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SUPA_URL: process.env.SUPA_URL,
    ANON_KEY: process.env.ANON_KEY,
  },
  images: {
    domains: ["picsum.photos"],
  },
  // Configure static file serving for large audio files
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB
  },
  outputFileTracingIncludes: {
    "/api/admin/records": ["./supabase/schema.sql"],
  },
  // Headers for audio files
  async headers() {
    return [
      {
        source: "/landing/:path*",
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
