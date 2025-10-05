/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip type checking during build (run separately in CI)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build (run separately in CI)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
