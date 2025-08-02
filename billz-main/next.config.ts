/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use these during development or if you're confident about the issues
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Add any other Next.js config options you need
}

module.exports = nextConfig