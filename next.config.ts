import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // 明确指定项目根目录，消除 Turbopack 警告
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
};

export default nextConfig;
