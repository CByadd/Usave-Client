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

  // Experimental features - turbo is now stable in Next.js 15
  // No need for experimental.turbo configuration

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

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

  // Add SVG support
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            icon: true, // makes it scalable
            svgo: true, // optimize SVGs
            svgoConfig: {
              plugins: [
                { name: "removeViewBox", active: false },
                "cleanupIds",
              ],
            },
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;









// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "res.cloudinary.com",
//         port: "",
//         pathname: "/**",
//       },
//     ],
//     formats: ["image/webp", "image/avif"],
//   },

//   // Compiler optimizations
//   compiler: {
//     removeConsole: process.env.NODE_ENV === "production",
//   },

//   // Output configuration
//   output: "standalone",

//   async redirects() {
//     return [
//       { source: "/bedroom", destination: "/categories/bedroom", permanent: false },
//       { source: "/office", destination: "/categories/electronics", permanent: false },
//       { source: "/designs/kitchen", destination: "/categories/kitchen", permanent: false },
//       { source: "/designs/outdoor", destination: "/categories/dining", permanent: false },
//       { source: "/designs/livingroom", destination: "/categories/living", permanent: false },
//       { source: "/designs/bathroom", destination: "/categories/kitchen", permanent: false },
//       { source: "/designs/office", destination: "/categories/electronics", permanent: false },
//     ];
//   },

//   // Add SVG support
//   webpack(config) {
//     config.module.rules.push({
//       test: /\.svg$/i,
//       issuer: /\.[jt]sx?$/,
//       use: [
//         {
//           loader: "@svgr/webpack",
//           options: {
//             icon: true, // Makes SVG scalable
//             svgo: true,
//             svgoConfig: {
//               plugins: [
//                 { name: "removeViewBox", active: false },
//                 { name: "cleanupIDs", active: true },
//               ],
//             },
//           },
//         },
//       ],
//     });
//     return config;
//   },
// };

// export default nextConfig;
