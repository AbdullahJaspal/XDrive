import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@uk-phv/shared-types', '@uk-phv/validation'],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
