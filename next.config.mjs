/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com"],
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
