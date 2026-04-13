/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: false,
  skipWaiting: true,
  disable: true,
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
