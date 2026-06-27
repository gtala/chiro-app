/** @type {import('next').NextConfig} */
const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_HOST_URL || "http://129.151.116.139:3000/";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/status", destination: `${apiUrl}status` },
      { source: "/dispositivos", destination: `${apiUrl}dispositivos` },
      { source: "/dispositivos/:path*", destination: `${apiUrl}dispositivos/:path*` },
      { source: "/logs", destination: `${apiUrl}logs` },
      { source: "/logs/:path*", destination: `${apiUrl}logs/:path*` },
    ];
  },
};

module.exports = nextConfig;
