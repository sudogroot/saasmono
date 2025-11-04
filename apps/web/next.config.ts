import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Disable ESLint and TypeScript checks during production builds
  // Run these checks separately in CI/CD pipeline
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
