/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**"
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable experimental features for better performance
  experimental: {
    // optimizeCss: true, // Disabled due to critters dependency issue
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Output configuration
  output: 'standalone',
  
  async redirects() {
    return [
      { source: '/bedroom', destination: '/categories/bedroom', permanent: false },
      { source: '/office', destination: '/categories/electronics', permanent: false },
      { source: '/designs/kitchen', destination: '/categories/kitchen', permanent: false },
      { source: '/designs/outdoor', destination: '/categories/dining', permanent: false },
      { source: '/designs/livingroom', destination: '/categories/living', permanent: false },
      { source: '/designs/bathroom', destination: '/categories/kitchen', permanent: false },
      { source: '/designs/office', destination: '/categories/electronics', permanent: false },
    ];
  },
};

export default nextConfig;
