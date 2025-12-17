import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable serverless mode for custom server
  output: 'standalone',
};

export default nextConfig;
