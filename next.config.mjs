/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",        // leave empty unless you use a non-standard port
        pathname: "/**"  // allow all paths on this domain
      }
    ]
  }
};

export default nextConfig;
