/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    timeDeltaDays: "60",
    apiURL: "http://localhost:3000",
  },
};

export default nextConfig;
