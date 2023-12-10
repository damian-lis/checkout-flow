/** @type {import('next').NextConfig} */

module.exports = {
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
