/** @type {import('next').NextConfig} */

module.exports = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "damian-lis.eu.saleor.cloud",
        port: "",
        pathname: "/media/thumbnails/products/**",
      },
    ],
  },
};
