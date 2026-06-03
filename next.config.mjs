/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pg', '@auth/drizzle-adapter'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
