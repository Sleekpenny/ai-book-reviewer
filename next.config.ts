import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {}, 
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fwxqjkjygcgjlu7a.public.blob.vercel-storage.com',
      },
    ],
  },

  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
