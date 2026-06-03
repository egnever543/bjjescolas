import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@neondatabase/serverless"],
};

export default nextConfig;
