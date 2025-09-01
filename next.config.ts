import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // This is to allow cross-origin requests in development.
    allowedDevOrigins: ["https://6000-firebase-studio-1756680028212.cluster-jbb3mjctu5cbgsi6hwq6u4btwe.cloudworkstations.dev"],
  }
};

export default nextConfig;
