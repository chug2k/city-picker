import type { NextConfig } from "next";

const nextConfig: NextConfig = process.env.CITY_PICKER_PAGES === "1"
  ? { output: "export", basePath: "/city-picker", trailingSlash: true }
  : {};

export default nextConfig;
