import type { NextConfig } from "next";

const isPagesBuild = process.env.BUILD_TARGET === "pages";

const nextConfig: NextConfig = {
  ...(isPagesBuild
    ? {
        // Keep the GitHub Pages build isolated from Vinext's `.next` metadata.
        // Both build routes are exercised locally and their generated types are
        // not interchangeable.
        distDir: ".next-pages",
        output: "export",
        basePath: "/Ascend",
        assetPrefix: "/Ascend",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
