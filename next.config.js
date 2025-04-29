/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'l4k0jxudetfnwmng.public.blob.vercel-storage.com',
      },
    ],
  },
};

module.exports = nextConfig;
