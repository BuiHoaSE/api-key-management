/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',  // For Google user profile images
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src']
  }
}

module.exports = nextConfig 