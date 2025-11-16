/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'zustand'
    ]
  }
};

export default nextConfig;
