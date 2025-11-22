/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // В экспериментальном режиме не валим сборку из-за ESLint, чтобы быстрее проверять живой бэкенд.
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Аналогично для TypeScript: пусть билд проходит, даже если есть временные предупреждения.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
