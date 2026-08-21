import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["src/content/blog/**/*.mdx"],
  },
};

export default nextConfig;
