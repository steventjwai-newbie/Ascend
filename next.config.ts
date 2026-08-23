import type { NextConfig } from "next";

const isPagesBuild = process.env.BUILD_TARGET === "pages";

const nextConfig: NextConfig = {
  ...(isPagesBuild
    ? {
        output: "export",
        basePath: "/Ascend",
        assetPrefix: "/Ascend",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
