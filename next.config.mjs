/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com", "lh3.googleusercontent.com"],
    minimumCacheTTL: 60,
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    typedRoutes: true,
    serverActions: true,
  },
  // Required for Vercel deployment with NextAuth
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable React compiler
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  // For Vercel deployment
  output: 'standalone',
  // Enable server components
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

// For Vercel deployment with NextAuth
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  scope: '/',
  sw: 'sw.js',
});

module.exports = withPWA(nextConfig);
