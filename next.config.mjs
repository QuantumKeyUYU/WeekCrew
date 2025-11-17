/** @type {import('next').NextConfig} */
const nextConfig = {
  // Можно оставить включённым, локально это помогает ловить баги
  reactStrictMode: true,

  // Не заваливаем прод-сборку из-за ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },

  // И не заваливаем из-за ошибок TypeScript (как на Vercel)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
