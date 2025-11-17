/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // не валить билд на Vercel из-за предупреждений ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
