import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

/** VPS that stores /uploads on disk (nginx alias → /var/www/avilla/uploads). */
const UPLOADS_ORIGIN =
  process.env.UPLOADS_ORIGIN?.replace(/\/$/, "") || "http://86.48.28.141";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "http",
        hostname: "86.48.28.141",
        pathname: "/uploads/**",
      },
    ],
    unoptimized: false,
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${UPLOADS_ORIGIN}/uploads/:path*`,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default withSerwist(nextConfig);
