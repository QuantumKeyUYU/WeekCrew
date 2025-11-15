/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'zustand',
      'firebase/app',
      'firebase/firestore',
      'firebase/auth'
    ]
  }
};

export default nextConfig;
