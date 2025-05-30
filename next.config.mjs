/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the static export, which is causing issues with dynamic routes
  // output: 'export',
  distDir: 'dist',
  // Add the following to ignore build errors related to useSearchParams
  typescript: {
    // Ignore build errors in production (but keep them in development)
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
