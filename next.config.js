/** @type {import('next').NextConfig} */
module.exports = {
  serverExternalPackages: ["mqtt"],
  experimental: { serverComponentsExternalPackages: ["mqtt"] },
};
