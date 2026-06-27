/** @type {import('next').NextConfig} */
const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_HOST_URL || "http://129.151.116.139:3000/";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/status", destination: `${apiUrl}status` },
      // Solo lista; /dispositivos/:id es página Next.js (logs usa /logs/:nodoId)
      { source: "/dispositivos", destination: `${apiUrl}dispositivos` },
      { source: "/logs", destination: `${apiUrl}logs` },
      { source: "/logs/:path*", destination: `${apiUrl}logs/:path*` },
    ];
  },
};

module.exports = nextConfig;
