/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    timeDeltaDays: "60",
  },
  images: {
    remotePatterns: [{ hostname: "cdn.jsdelivr.net" }],
  },
};

export default nextConfig;
