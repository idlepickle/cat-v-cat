/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Next.js Image Optimization to pull from thecatapi.com
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn2.thecatapi.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
